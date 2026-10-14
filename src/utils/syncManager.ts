import { DentalAppState, SyncMessage, Role } from '../types/dental';

export type SyncStatus = 'disconnected' | 'connecting' | 'connected' | 'broadcasting';

type MessageListener = (message: SyncMessage) => void;

class SyncManager {
  private broadcastChannel: BroadcastChannel | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private listeners: Set<MessageListener> = new Set();
  private statusListeners: Set<(status: SyncStatus) => void> = new Set();
  private status: SyncStatus = 'broadcasting';
  private currentRole: Role = 'dentist';

  constructor() {
    this.initBroadcastChannel();
  }

  public setRole(role: Role) {
    this.currentRole = role;
  }

  public getRole(): Role {
    return this.currentRole;
  }

  private initBroadcastChannel() {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        this.broadcastChannel = new BroadcastChannel('dentidz_pro_channel');
        this.broadcastChannel.onmessage = (event) => {
          const msg = event.data as SyncMessage;
          this.notifyListeners(msg);
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel not supported in this environment', e);
    }
  }

  public subscribe(listener: MessageListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public subscribeStatus(listener: (status: SyncStatus) => void): () => void {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => this.statusListeners.delete(listener);
  }

  private notifyListeners(message: SyncMessage) {
    this.listeners.forEach((fn) => fn(message));
  }

  private setStatus(status: SyncStatus) {
    this.status = status;
    this.statusListeners.forEach((fn) => fn(status));
  }

  public getStatus(): SyncStatus {
    return this.status;
  }

  /**
   * Broadcast a message to all local browser tabs/windows and connected WebRTC peers
   */
  public broadcast(type: SyncMessage['type'], payload?: any) {
    const message: SyncMessage = {
      type,
      payload,
      senderRole: this.currentRole,
      timestamp: Date.now(),
    };

    // 1. BroadcastChannel (instant for tabs/windows on same PC)
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(message);
      } catch (err) {
        console.error('Error posting to BroadcastChannel:', err);
      }
    }

    // 2. WebRTC DataChannel (instant across local Wi-Fi / separate PCs)
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      try {
        this.dataChannel.send(JSON.stringify(message));
      } catch (err) {
        console.error('Error sending through WebRTC DataChannel:', err);
      }
    }
  }

  // ===== WebRTC Multi-Computer Setup (Offer/Answer Handshake) =====

  public async createHostOffer(): Promise<string> {
    this.cleanupPeer();
    this.setStatus('connecting');

    const config: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };

    this.peerConnection = new RTCPeerConnection(config);

    // Setup DataChannel
    this.dataChannel = this.peerConnection.createDataChannel('dentidz_sync', {
      ordered: true,
    });
    this.setupDataChannel(this.dataChannel);

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    // Wait for ICE gathering to complete so the code contains all candidates
    await this.waitForIceGathering(this.peerConnection);

    const localDesc = this.peerConnection.localDescription;
    if (!localDesc) throw new Error("Impossible de créer l'offre WebRTC");

    return btoa(JSON.stringify(localDesc));
  }

  public async acceptHostOfferAndCreateAnswer(offerCode: string): Promise<string> {
    this.cleanupPeer();
    this.setStatus('connecting');

    const config: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };

    this.peerConnection = new RTCPeerConnection(config);

    this.peerConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.setupDataChannel(this.dataChannel);
    };

    const offerDesc = JSON.parse(atob(offerCode.trim()));
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offerDesc));

    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);

    await this.waitForIceGathering(this.peerConnection);

    const localDesc = this.peerConnection.localDescription;
    if (!localDesc) throw new Error("Impossible de générer la réponse WebRTC");

    return btoa(JSON.stringify(localDesc));
  }

  public async finalizeHostConnection(answerCode: string): Promise<void> {
    if (!this.peerConnection) {
      throw new Error("Aucune connexion hôte active. Veuillez relancer la génération du code.");
    }
    const answerDesc = JSON.parse(atob(answerCode.trim()));
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answerDesc));
  }

  private setupDataChannel(channel: RTCDataChannel) {
    channel.onopen = () => {
      this.setStatus('connected');
      // Send handshake ping
      this.broadcast('PING', { clientRole: this.currentRole });
    };

    channel.onclose = () => {
      this.setStatus('broadcasting');
    };

    channel.onerror = (e) => {
      console.warn('WebRTC data channel error', e);
    };

    channel.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as SyncMessage;
        this.notifyListeners(msg);
      } catch (err) {
        console.error('Failed to parse WebRTC message', err);
      }
    };
  }

  private waitForIceGathering(pc: RTCPeerConnection): Promise<void> {
    return new Promise((resolve) => {
      if (pc.iceGatheringState === 'complete') {
        resolve();
      } else {
        const checkState = () => {
          if (pc.iceGatheringState === 'complete') {
            pc.removeEventListener('icegatheringstatechange', checkState);
            resolve();
          }
        };
        pc.addEventListener('icegatheringstatechange', checkState);
        // Fallback timeout in case some ICE candidate hangs
        setTimeout(() => resolve(), 3000);
      }
    });
  }

  public cleanupPeer() {
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.setStatus('broadcasting');
  }
}

export const syncManager = new SyncManager();
