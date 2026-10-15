import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { syncManager, SyncStatus } from '../utils/syncManager';
import { playNotificationChime } from '../utils/audio';
import {
  Wifi,
  QrCode,
  Copy,
  Check,
  Laptop,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  X,
  Radio,
  Share2,
} from 'lucide-react';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncStatus: SyncStatus;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  isOpen,
  onClose,
  syncStatus,
}) => {
  const [step, setStep] = useState<'mode_select' | 'host_offer' | 'join_answer' | 'host_finalize'>('mode_select');
  const [hostOfferCode, setHostOfferCode] = useState('');
  const [guestInputOffer, setGuestInputOffer] = useState('');
  const [guestAnswerCode, setGuestAnswerCode] = useState('');
  const [hostInputAnswer, setHostInputAnswer] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (hostOfferCode) {
      QRCode.toDataURL(hostOfferCode, { margin: 1, width: 220 })
        .then(setQrDataUrl)
        .catch(() => setQrDataUrl(''));
    } else if (guestAnswerCode) {
      QRCode.toDataURL(guestAnswerCode, { margin: 1, width: 220 })
        .then(setQrDataUrl)
        .catch(() => setQrDataUrl(''));
    } else {
      setQrDataUrl('');
    }
  }, [hostOfferCode, guestAnswerCode]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateHostOffer = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const code = await syncManager.createHostOffer();
      setHostOfferCode(code);
      setStep('host_offer');
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur lors de la création de l\'offre WebRTC');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSubmitOffer = async () => {
    if (!guestInputOffer.trim()) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const answer = await syncManager.acceptHostOfferAndCreateAnswer(guestInputOffer);
      setGuestAnswerCode(answer);
      setStep('join_answer');
    } catch (err: any) {
      setErrorMsg('Code d\'offre invalide ou corrompu. Assurez-vous d\'avoir copié l\'intégralité du code.');
    } finally {
      setLoading(false);
    }
  };

  const handleHostFinalize = async () => {
    if (!hostInputAnswer.trim()) return;
    setLoading(true);
    setErrorMsg('');
    try {
      await syncManager.finalizeHostConnection(hostInputAnswer);
      playNotificationChime('success');
      onClose();
    } catch (err: any) {
      setErrorMsg('Code de réponse invalide. Vérifiez que l\'assistant a bien généré le code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Liaison Réseau Local Multi-Postes (P2P)
              </h3>
              <p className="text-xs text-slate-400">
                Synchronisation temps réel entre le PC du Praticien et le PC Accueil / Réception
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Status Header */}
        <div className="bg-slate-950/90 px-6 py-3 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                syncStatus === 'connected'
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-teal-400'
              }`}
            />
            <span className="text-slate-300 font-medium">
              Statut:{' '}
              <strong className="text-white">
                {syncStatus === 'connected'
                  ? 'Connecté en Direct (WebRTC LAN)'
                  : 'Mode Local Actif (BroadcastChannel)'}
              </strong>
            </span>
          </div>

          <button
            onClick={() => {
              playNotificationChime('call');
              syncManager.broadcast('PING', { test: true });
            }}
            className="text-[11px] font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Tester Sonnerie Réseau</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {step === 'mode_select' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                Cette fonctionnalité permet de relier deux ordinateurs connectés au même réseau Wi-Fi
                ou câble réseau du cabinet (ex: PC Dentiste dans la salle de soin et PC Assistante à
                l'accueil), sans avoir besoin de serveur distant ou d'accès internet externe.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCreateHostOffer}
                  disabled={loading}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-left transition-all group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-white text-sm">Poste Hôte (PC Dentiste)</h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Générer un code de liaison ou QR code pour inviter le PC de l'assistante.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setStep('join_answer')}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-teal-500/50 text-left transition-all group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-white text-sm">Poste Client (PC Assistante)</h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Rejoindre la session en saisissant le code fourni par le praticien.
                  </p>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>
                  Toutes les données restent strictement confinées à votre réseau local (chiffrement DTLS/SCTP natif).
                </span>
              </div>
            </div>
          )}

          {/* STEP: Host Generated Offer */}
          {step === 'host_offer' && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Étape 1 : Code de Liaison Généré
                </span>
                <p className="text-xs text-slate-400">
                  Scannez le QR code avec l'autre poste ou copiez ce code sur le PC de l'accueil.
                </p>
              </div>

              {qrDataUrl && (
                <div className="flex justify-center my-2">
                  <div className="p-3 bg-white rounded-2xl shadow-lg border border-slate-200">
                    <img src={qrDataUrl} alt="QR Code Handshake" className="w-40 h-40" />
                  </div>
                </div>
              )}

              <div className="relative">
                <textarea
                  readOnly
                  rows={3}
                  value={hostOfferCode}
                  className="w-full text-[10px] font-mono bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-300 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(hostOfferCode)}
                  className="absolute right-2.5 top-2.5 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copié !' : 'Copier'}</span>
                </button>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep('mode_select')}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  ← Retour
                </button>
                <button
                  type="button"
                  onClick={() => setStep('host_finalize')}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <span>Saisir la Réponse de l'Assistante</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP: Guest Input Offer & Generates Answer */}
          {step === 'join_answer' && !guestAnswerCode && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                  Rejoindre le Cabinet
                </span>
                <p className="text-xs text-slate-400">
                  Collez ci-dessous le code de liaison affiché sur le PC du Docteur.
                </p>
              </div>

              <textarea
                rows={4}
                value={guestInputOffer}
                onChange={(e) => setGuestInputOffer(e.target.value)}
                placeholder="Collez le code de liaison du Praticien ici..."
                className="w-full text-xs font-mono bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-teal-500"
              />

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep('mode_select')}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  ← Retour
                </button>
                <button
                  type="button"
                  disabled={!guestInputOffer.trim() || loading}
                  onClick={handleGuestSubmitOffer}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg cursor-pointer"
                >
                  {loading ? 'Génération...' : 'Générer le Code de Réponse'}
                </button>
              </div>
            </div>
          )}

          {/* STEP: Guest Displays Answer */}
          {step === 'join_answer' && guestAnswerCode && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Code de Réponse Généré
                </span>
                <p className="text-xs text-slate-400">
                  Copiez ce code et collez-le sur le PC du Docteur pour finaliser la liaison.
                </p>
              </div>

              {qrDataUrl && (
                <div className="flex justify-center my-2">
                  <div className="p-3 bg-white rounded-2xl shadow-lg border border-slate-200">
                    <img src={qrDataUrl} alt="QR Code Answer" className="w-40 h-40" />
                  </div>
                </div>
              )}

              <div className="relative">
                <textarea
                  readOnly
                  rows={3}
                  value={guestAnswerCode}
                  className="w-full text-[10px] font-mono bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-300 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(guestAnswerCode)}
                  className="absolute right-2.5 top-2.5 px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copié !' : 'Copier'}</span>
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs cursor-pointer"
                >
                  Terminé (En attente de validation)
                </button>
              </div>
            </div>
          )}

          {/* STEP: Host Finalize */}
          {step === 'host_finalize' && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Étape Finale : Valider la Réponse
                </span>
                <p className="text-xs text-slate-400">
                  Collez le code de réponse généré sur le PC de l'assistante.
                </p>
              </div>

              <textarea
                rows={4}
                value={hostInputAnswer}
                onChange={(e) => setHostInputAnswer(e.target.value)}
                placeholder="Collez le code de réponse de l'assistante ici..."
                className="w-full text-xs font-mono bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep('host_offer')}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  ← Retour au code hôte
                </button>
                <button
                  type="button"
                  disabled={!hostInputAnswer.trim() || loading}
                  onClick={handleHostFinalize}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg cursor-pointer"
                >
                  {loading ? 'Connexion en cours...' : 'Établir la Connexion Directe'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
