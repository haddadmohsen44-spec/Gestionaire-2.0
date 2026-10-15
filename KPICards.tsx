import React from 'react';
import { formatDZD } from '../utils/formatters';
import {
  Banknote,
  Users,
  CalendarCheck,
  Sparkles,
  TrendingUp,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface KPICardsProps {
  todayRevenue: number;
  waitingCount: number;
  inChairPatientName?: string;
  todayAppointmentsCount: number;
  pendingLabCount: number;
  onNavigateTab: (tab: string) => void;
}

export const KPICards: React.FC<KPICardsProps> = ({
  todayRevenue,
  waitingCount,
  inChairPatientName,
  todayAppointmentsCount,
  pendingLabCount,
  onNavigateTab,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Daily Revenue */}
      <div
        onClick={() => onNavigateTab('caisse')}
        className="group relative bg-slate-900/90 rounded-2xl p-5 border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer shadow-lg overflow-hidden flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Recette du Jour
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Banknote className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
            {formatDZD(todayRevenue)}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
            <span className="flex items-center gap-1 text-emerald-300">
              <TrendingUp className="w-3.5 h-3.5" />
              Caisse active
            </span>
            <span className="text-[11px] group-hover:text-emerald-400 flex items-center gap-0.5 transition-colors">
              Bilan <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* KPI 2: Waiting Room */}
      <div
        onClick={() => onNavigateTab('salle_attente')}
        className="group relative bg-slate-900/90 rounded-2xl p-5 border border-slate-800 hover:border-teal-500/50 transition-all cursor-pointer shadow-lg overflow-hidden flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Salle d'Attente
          </span>
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-2xl font-black text-white font-mono tracking-tight flex items-baseline gap-2">
            <span>{waitingCount}</span>
            <span className="text-xs font-medium text-slate-400">patient(s)</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
            <span className="text-[11px] truncate max-w-[140px] text-teal-300">
              {inChairPatientName ? `Au fauteuil: ${inChairPatientName}` : 'Fauteuil libre'}
            </span>
            <span className="text-[11px] group-hover:text-teal-400 flex items-center gap-0.5 transition-colors">
              Gérer <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* KPI 3: Daily Appointments */}
      <div
        onClick={() => onNavigateTab('rdv')}
        className="group relative bg-slate-900/90 rounded-2xl p-5 border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer shadow-lg overflow-hidden flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Rendez-vous du Jour
          </span>
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-2xl font-black text-white font-mono tracking-tight flex items-baseline gap-2">
            <span>{todayAppointmentsCount}</span>
            <span className="text-xs font-medium text-slate-400">programmés</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
            <span className="text-[11px] text-blue-300 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Agenda du jour
            </span>
            <span className="text-[11px] group-hover:text-blue-400 flex items-center gap-0.5 transition-colors">
              Planning <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* KPI 4: Pending Lab Orders */}
      <div
        onClick={() => onNavigateTab('prothese')}
        className="group relative bg-slate-900/90 rounded-2xl p-5 border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer shadow-lg overflow-hidden flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Travaux Prothèse
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-2xl font-black text-amber-300 font-mono tracking-tight flex items-baseline gap-2">
            <span>{pendingLabCount}</span>
            <span className="text-xs font-medium text-slate-400">en laboratoire</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
            <span className="text-[11px] text-amber-300">Couronnes & Stellites</span>
            <span className="text-[11px] group-hover:text-amber-400 flex items-center gap-0.5 transition-colors">
              Suivre <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
