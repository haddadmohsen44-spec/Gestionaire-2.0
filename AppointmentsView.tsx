import React, { useState } from 'react';
import { Appointment, Patient, Role } from '../types/dental';
import { formatDate } from '../utils/formatters';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  CheckCircle2,
  Phone,
  User,
  Users,
  X,
  AlertCircle,
} from 'lucide-react';

interface AppointmentsViewProps {
  appointments: Appointment[];
  patients: Patient[];
  role: Role;
  onAddAppointment: (appointment: Appointment) => void;
  onUpdateAppointment: (updated: Appointment) => void;
  onMoveToWaitingRoom: (patientId: string, reason: string) => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  appointments,
  patients,
  role,
  onAddAppointment,
  onUpdateAppointment,
  onMoveToWaitingRoom,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New appointment form state
  const [patientId, setPatientId] = useState('');
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState(30);
  const [reason, setReason] = useState('Contrôle & Soin');
  const [notes, setNotes] = useState('');

  const filteredAppointments = appointments
    .filter((a) => a.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === patientId);
    if (!pat) return;

    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      patientId: pat.id,
      patientName: `${pat.lastName.toUpperCase()} ${pat.firstName}`,
      phone: pat.phone,
      date: selectedDate,
      time,
      durationMinutes: Number(duration),
      reason,
      status: 'scheduled',
      notes,
    };

    onAddAppointment(newApt);
    setIsAddModalOpen(false);
    setReason('Contrôle & Soin');
    setNotes('');
  };

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return { label: 'Confirmé', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'scheduled':
        return { label: 'Prévu', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
      case 'completed':
        return { label: 'Terminé', color: 'bg-slate-800 text-slate-400 border-slate-700' };
      case 'cancelled':
        return { label: 'Annulé', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Date Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Agenda des Rendez-vous</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-teal-500/20 text-teal-300 border border-teal-500/30">
                {filteredAppointments.length} RDV
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Planification des consultations et passages au fauteuil
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs text-white font-bold focus:outline-none cursor-pointer"
            />
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors cursor-pointer"
            >
              Aujourd'hui
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-900/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau RDV</span>
          </button>
        </div>
      </div>

      {/* Appointments List for selected date */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Rendez-vous du {formatDate(selectedDate)}
        </h3>

        {filteredAppointments.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <CalendarIcon className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-sm font-medium">Aucun rendez-vous fixé pour cette date</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredAppointments.map((apt) => {
              const badge = getStatusBadge(apt.status);
              return (
                <div
                  key={apt.id}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 transition-all flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                      <span className="text-sm font-mono font-black text-emerald-400 block">
                        {apt.time}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {apt.durationMinutes} min
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">
                          {apt.patientName}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                        <span className="text-slate-300 font-medium">{apt.reason}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {apt.phone}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onMoveToWaitingRoom(apt.patientId, apt.reason)}
                      className="px-3 py-1.5 rounded-xl bg-teal-600/20 hover:bg-teal-600 text-teal-300 hover:text-white border border-teal-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Placer en Salle d'Attente</span>
                    </button>

                    {apt.status !== 'completed' && (
                      <button
                        onClick={() => onUpdateAppointment({ ...apt, status: 'completed' })}
                        className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Marquer comme honoré"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: New Appointment */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Planifier un Rendez-vous</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Patient</label>
                <select
                  required
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full text-xs rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="">-- Choisir un patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.lastName.toUpperCase()} {p.firstName} ({p.fileNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">Heure</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full text-xs rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">Durée</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full text-xs rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value={15}>15 minutes (Contrôle)</option>
                    <option value={30}>30 minutes (Soin standard)</option>
                    <option value={45}>45 minutes (Dévitalisation / Détartrage)</option>
                    <option value={60}>60 minutes (Chirurgie / Prothèse)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Motif de la Consultation</label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex: Soin carie dent 21, Essayage armature..."
                  className="w-full text-xs rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Notes Complémentaires</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Remarques éventuelles..."
                  className="w-full text-xs rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
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
                  disabled={!patientId}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg cursor-pointer"
                >
                  Enregistrer le Rendez-vous
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
