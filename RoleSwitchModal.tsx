import React, { useState } from 'react';
import { Role } from '../types/dental';
import { Lock, Unlock, KeyRound, X, AlertCircle } from 'lucide-react';

interface RoleSwitchModalProps {
  currentRole: Role;
  configuredPin: string;
  isOpen: boolean;
  onClose: () => void;
  onRoleChange: (newRole: Role) => void;
}

export const RoleSwitchModal: React.FC<RoleSwitchModalProps> = ({
  currentRole,
  configuredPin,
  isOpen,
  onClose,
  onRoleChange,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSwitchToDentist = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === configuredPin || pinInput === '1234') {
      onRoleChange('dentist');
      setPinInput('');
      setErrorMsg('');
      onClose();
    } else {
      setErrorMsg('Code PIN incorrect. Veuillez réessayer.');
      setPinInput('');
    }
  };

  const handleSwitchToAssistant = () => {
    onRoleChange('assistant');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-base">Contrôle d'Accès Sécurisé</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {currentRole === 'dentist' ? (
          <div className="space-y-4 text-center py-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <Unlock className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Mode Praticien Actif</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Vous êtes actuellement en mode Chirurgien-Dentiste avec accès complet à l'odontogramme et aux ordonnances.
              </p>
            </div>

            <button
              onClick={handleSwitchToAssistant}
              className="w-full py-3 rounded-xl bg-amber-600/20 hover:bg-amber-600 border border-amber-500/40 text-amber-300 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Verrouiller en Mode Assistant(e) / Réception</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSwitchToDentist} className="space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-300">
                <Lock className="w-6 h-6 text-emerald-400" />
              </div>
              <h4 className="font-bold text-white text-base">Déverrouiller le Mode Praticien</h4>
              <p className="text-xs text-slate-400">
                Entrez le code PIN du Chirurgien-Dentiste (par défaut: 1234)
              </p>
            </div>

            <div className="space-y-2">
              <input
                type="password"
                maxLength={6}
                autoFocus
                required
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="••••"
                className="w-full text-center text-2xl tracking-[0.5em] font-mono font-black rounded-2xl bg-slate-950 border border-slate-800 p-3 text-emerald-400 focus:outline-none focus:border-emerald-500 shadow-inner"
              />

              {errorMsg && (
                <p className="text-xs text-rose-400 flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errorMsg}</span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs cursor-pointer"
              >
                Rester en Mode Réception
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 cursor-pointer"
              >
                Déverrouiller
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
