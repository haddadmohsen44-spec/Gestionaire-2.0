import React, { useState } from 'react';
import { Patient, QueueItem, QueueStatus, Role } from '../types/dental';
import { playNotificationChime } from '../utils/audio';
import {
  Users,
  Clock,
  UserCheck,
  Phone,
  AlertTriangle,
  Play,
  CheckCircle2,
  XCircle,
  Plus,
  Volume2,
  Search,
} from 'lucide-react';

interface WaitingRoomViewProps {
  queue: QueueItem[];
  patients: Patient[];
  role: Role;
  onUpdateQueue: (newQueue: QueueItem[]) => void;
  onSelectPatient: (patientId: string) => void;
  onBroadcastCall?: (patientName: string) => void;
}

export const WaitingRoomView: React.FC<WaitingRoomViewProps> = ({
  queue,
  patients,
  role,
  onUpdateQueue,
  onSelectPatient,
  onBroadcastCall,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [reason, setReason] = useState('Consultation & Soins');
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');
  const [patientSearch, setPatientSearch] = useState('');

  const activeWaiting = queue.filter((q) => q.status === 'waiting');
  const inChair = queue.filter((q) => q.status === 'in_chair');
  const completedToday = queue.filter((q) => q.status === 'completed' || q.status === 'left');

  const handleStatusChange = (id: string, newStatus: QueueStatus) => {
    const target = queue.find((q) => q.id === id);
    if (newStatus === 'in_chair') {
      playNotificationChime('call');
      if (target && onBroadcastCall) {
        onBroadcastCall(target.patientName);
      }
    } else if (newStatus === 'completed') {
      playNotificationChime('success');
    }

    const updated = queue.map((item) => {
      if (item.id === id) {
        return { ...item, status: newStatus };
      }
      // If someone moves to in_chair, ensure other in_chair becomes completed or stays
      return item;
    });
    onUpdateQueue(updated);
  };

  const handleAddToQueue = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === selectedPatientId);
    if (!pat) return;

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const newItem: QueueItem = {
      id: `q-${Date.now()}`,
      patientId: pat.id,
      patientName: `${pat.lastName.toUpperCase()} ${pat.firstName}`,
      phone: pat.phone,
      arrivalTime: `${hours}:${minutes}`,
      status: 'waiting',
      reason: reason || 'Consultation dentaire',
      priority,
    };

    playNotificationChime('queue');
    onUpdateQueue([newItem, ...queue]);
    setIsAddModalOpen(false);
    setSelectedPatientId('');
    setReason('Consultation & Soins');
    setPriority('normal');
  };

  const filteredPatients = patients.filter(
    (p) =>
      `${p.firstName} ${p.lastName} ${p.phone} ${p.fileNumber}`
        .toLowerCase()
        .includes(patientSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Controls & Counter */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Salle d'Attente Interactive</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {activeWaiting.length} en attente
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Synchronisation instantanée en réseau local entre Réception et Fauteuil
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Faire Entrer en Salle d'Attente</span>
        </button>
      </div>

      {/* Grid: In Chair (Fauteuil) + Waiting List + History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Patient In Chair (Current Treatment) */}
        <div className="lg:col-span-12">
          {inChair.length > 0 ? (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/70 border-2 border-emerald-500/60 shadow-xl shadow-emerald-950/40">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 font-extrabold text-xl animate-pulse">
                      <UserCheck className="w-7 h-7" />
                    </div>
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full ring-2 ring-slate-900 animate-ping" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                        AU FAUTEUIL ACTUELLEMENT
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        Installé à {inChair[0].arrivalTime}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-white mt-1">
                      {inChair[0].patientName}
                    </h3>
                    <p className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                      <span className="font-semibold text-emerald-300">Motif:</span> {inChair[0].reason}
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">{inChair[0].phone}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectPatient(inChair[0].patientId)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors cursor-pointer"
                  >
                    Ouvrir Dossier Clinique
                  </button>
                  <button
                    onClick={() => handleStatusChange(inChair[0].id, 'completed')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Terminer le Soin</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center py-6">
              <span className="text-xs text-slate-500">
                Aucun patient actuellement au fauteuil. Le chirurgien-dentiste est disponible.
              </span>
            </div>
          )}
        </div>

        {/* Patients Waiting Queue */}
        <div className="lg:col-span-8 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            File d'Attente ({activeWaiting.length})
          </h3>

          {activeWaiting.length === 0 ? (
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-8 text-center text-slate-500 space-y-2">
              <Users className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-sm font-medium">La salle d'attente est vide pour le moment</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {activeWaiting.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-wrap items-center justify-between gap-4 ${
                    item.priority === 'urgent'
                      ? 'bg-rose-950/20 border-rose-500/50 shadow-md shadow-rose-950/20'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-sm">
                      #{idx + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm sm:text-base">
                          {item.patientName}
                        </span>
                        {item.priority === 'urgent' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Urgence Douleur
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1 font-mono text-slate-400">
                          <Clock className="w-3 h-3 text-emerald-400" />
                          Arrivé à {item.arrivalTime}
                        </span>
                        <span>•</span>
                        <span className="text-slate-300">{item.reason}</span>
                        <span>•</span>
                        <span className="text-slate-400 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {item.phone}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for this patient */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStatusChange(item.id, 'in_chair')}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-900/30 transition-all cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Appeler au Fauteuil</span>
                    </button>
                    <button
                      onClick={() => onSelectPatient(item.patientId)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Consulter le dossier"
                    >
                      Dossier
                    </button>
                    <button
                      onClick={() => handleStatusChange(item.id, 'left')}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Marquer comme parti / absent"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Visits Today */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Patients Reçus Aujourd'hui ({completedToday.length})
          </h3>

          <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-4 space-y-2 max-h-[460px] overflow-y-auto">
            {completedToday.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6 italic">
                Aucun patient terminé pour le moment
              </p>
            ) : (
              completedToday.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-200">{item.patientName}</p>
                    <p className="text-[11px] text-slate-400">{item.reason}</p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-emerald-400">
                    Terminé
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal: Add Patient to Waiting Room */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Faire Entrer en Salle d'Attente</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddToQueue} className="space-y-4">
              {/* Patient Search & Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Rechercher & Sélectionner un Patient
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Taper le nom, prénom ou téléphone..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="w-full text-xs rounded-xl bg-slate-950 border border-slate-800 p-2.5 pl-9 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <select
                  required
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full text-xs rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-white focus:outline-none focus:border-emerald-500 mt-2 cursor-pointer"
                >
                  <option value="">-- Choisir un patient ({filteredPatients.length} trouvés) --</option>
                  {filteredPatients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.lastName.toUpperCase()} {p.firstName} - {p.phone} ({p.fileNumber})
                    </option>
                  ))}
                </select>
              </div>

              {/* Reason for visit */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Motif de la Consultation
                </label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex: Soin carie, Détartrage, Urgence abcès, Pose couronne..."
                  className="w-full text-xs rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Priority */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Degré d'Urgence
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPriority('normal')}
                    className={`py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      priority === 'normal'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Ordre Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriority('urgent')}
                    className={`py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      priority === 'urgent'
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Urgence / Douleur Aiguë
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!selectedPatientId}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs shadow-lg cursor-pointer"
                >
                  Ajouter à la File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
