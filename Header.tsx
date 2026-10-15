import React, { useRef } from 'react';
import { ClinicSettings, Role } from '../types/dental';
import { SyncStatus } from '../utils/syncManager';
import {
  Shield,
  Lock,
  Unlock,
  Wifi,
  Settings,
  Download,
  Upload,
  Activity,
  HeartPulse,
} from 'lucide-react';

interface HeaderProps {
  settings: ClinicSettings;
  role: Role;
  syncStatus: SyncStatus;
  onOpenRoleModal: () => void;
  onOpenSyncModal: () => void;
  onOpenSettingsModal: () => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  role,
  syncStatus,
  onOpenRoleModal,
  onOpenSyncModal,
  onOpenSettingsModal,
  onExportData,
  onImportData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportData(file);
      e.target.value = '';
    }
  };

  const isDentist = role === 'dentist';

  return (
    <header className="no-print bg-[#0B0F19]/90 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Branding & Clinic Identity */}
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-400 p-0.5 shadow-lg shadow-emerald-950/50 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <HeartPulse className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-slate-950" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                <span>DentiDZ</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest font-black">
                  PRO
                </span>
              </h1>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="text-xs font-bold text-slate-300 hidden sm:inline">
                {settings.clinicName}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-emerald-300">{settings.doctorName}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 font-mono text-[11px]">{settings.city}</span>
            </div>
          </div>
        </div>

        {/* Right: Role Switcher + Sync + Backup + Settings */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* LAN Sync Status Button */}
          <button
            onClick={onOpenSyncModal}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              syncStatus === 'connected'
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900/60'
                : 'bg-slate-900/80 text-teal-400 border-teal-500/40 hover:bg-slate-800'
            }`}
            title="Liaison Réseau Local P2P"
          >
            <div className="relative">
              <Wifi className="w-3.5 h-3.5" />
              <span
                className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
                  syncStatus === 'connected'
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-teal-400'
                }`}
              />
            </div>
            <span className="hidden md:inline">
              {syncStatus === 'connected' ? 'Réseau LAN Connecté' : 'Sync Multi-Postes'}
            </span>
          </button>

          {/* Role Indicator & Mode Switcher Button */}
          <button
            onClick={onOpenRoleModal}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
              isDentist
                ? 'bg-gradient-to-r from-emerald-600/20 to-teal-600/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-600/30'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
            }`}
            title="Changer de rôle (Chirurgien-Dentiste / Assistante)"
          >
            {isDentist ? (
              <>
                <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Dr. Dentiste (Accès Total)</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Assistante / Réception</span>
              </>
            )}
          </button>

          {/* Backup Export / Import */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={onExportData}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Exporter Sauvegarde Locale (JSON)"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Restaurer Sauvegarde (JSON)"
            >
              <Upload className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Settings Button */}
          <button
            onClick={onOpenSettingsModal}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
            title="Paramètres du Cabinet"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
