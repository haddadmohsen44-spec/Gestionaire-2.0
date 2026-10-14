import React, { useState } from 'react';
import { Patient, Role, ToothCondition, ToothStatus, ToothSurface } from '../types/dental';
import { OdontogramTooth } from './OdontogramTooth';
import { getToothStatusDetails, formatDZD } from '../utils/formatters';
import { DENTAL_ACT_TEMPLATES } from '../data/defaultData';
import { Lock, Sparkles, Check, AlertCircle, Plus, Trash2, Info } from 'lucide-react';

interface OdontogramViewProps {
  patient: Patient;
  role: Role;
  onUpdatePatient: (updatedPatient: Patient) => void;
  onOpenPinModal: () => void;
}

export const OdontogramView: React.FC<OdontogramViewProps> = ({
  patient,
  role,
  onUpdatePatient,
  onOpenPinModal,
}) => {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(16);
  const [dentitionType, setDentitionType] = useState<'adult' | 'pediatric'>('adult');
  const [selectedActTemplate, setSelectedActTemplate] = useState<string>('');
  const [customPrice, setCustomPrice] = useState<number>(0);

  const isDentist = role === 'dentist';

  // Adult quadrants
  const q1 = [18, 17, 16, 15, 14, 13, 12, 11];
  const q2 = [21, 22, 23, 24, 25, 26, 27, 28];
  const q4 = [48, 47, 46, 45, 44, 43, 42, 41];
  const q3 = [31, 32, 33, 34, 35, 36, 37, 38];

  // Pediatric quadrants
  const q5 = [55, 54, 53, 52, 51];
  const q6 = [61, 62, 63, 64, 65];
  const q8 = [85, 84, 83, 82, 81];
  const q7 = [71, 72, 73, 74, 75];

  const currentCondition: ToothCondition | undefined = selectedTooth
    ? patient.odontogram[selectedTooth] || {
        number: selectedTooth,
        status: 'healthy',
        surfaces: [],
        notes: '',
      }
    : undefined;

  const handleUpdateTooth = (partial: Partial<ToothCondition>) => {
    if (!isDentist || !selectedTooth) return;

    const existing = patient.odontogram[selectedTooth] || {
      number: selectedTooth,
      status: 'healthy',
      surfaces: [],
      notes: '',
    };

    const updatedCondition: ToothCondition = {
      ...existing,
      ...partial,
      number: selectedTooth,
    };

    const newOdontogram = {
      ...patient.odontogram,
      [selectedTooth]: updatedCondition,
    };

    onUpdatePatient({
      ...patient,
      odontogram: newOdontogram,
    });
  };

  const toggleSurface = (surf: ToothSurface) => {
    if (!isDentist || !selectedTooth || !currentCondition) return;
    const currentSurfaces = currentCondition.surfaces || [];
    const exists = currentSurfaces.includes(surf);
    const newSurfaces = exists
      ? currentSurfaces.filter((s) => s !== surf)
      : [...currentSurfaces, surf];

    handleUpdateTooth({ surfaces: newSurfaces });
  };

  const handleAddActToTreatmentPlan = () => {
    if (!isDentist || !selectedTooth) return;
    const template = DENTAL_ACT_TEMPLATES.find((t) => t.name === selectedActTemplate);
    const actName = template ? template.name : (currentCondition?.notes || `Soin Dent ${selectedTooth}`);
    const cost = customPrice > 0 ? customPrice : (template ? template.price : 3000);

    const newAct = {
      id: `act-${Date.now()}`,
      patientId: patient.id,
      date: new Date().toISOString().split('T')[0],
      toothNumber: selectedTooth,
      actName,
      category: (template?.category as any) || 'soin',
      cost,
      paid: 0,
      status: 'planned' as const,
      notes: `Prescrit via Odontogramme pour la dent ${selectedTooth}`,
    };

    onUpdatePatient({
      ...patient,
      treatmentPlans: [newAct, ...patient.treatmentPlans],
    });

    setSelectedActTemplate('');
    setCustomPrice(0);
  };

  // If role is assistant, display strictly locked notice
  if (!isDentist) {
    return (
      <div className="relative rounded-2xl bg-slate-900/60 border border-slate-800 p-8 text-center overflow-hidden">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Accès Clinique Verrouillé</h3>
            <p className="text-sm text-slate-400 mt-2">
              L'odontogramme FDI et les actes cliniques sont strictement réservés au
              <span className="text-emerald-400 font-semibold"> Chirurgien-Dentiste</span>.
            </p>
          </div>
          <button
            onClick={onOpenPinModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            Déverrouiller avec Code PIN
          </button>
        </div>
      </div>
    );
  }

  const statuses: ToothStatus[] = [
    'healthy',
    'caries',
    'restored',
    'endo',
    'crown',
    'implant',
    'to_extract',
    'missing',
  ];

  return (
    <div className="space-y-6">
      {/* Dentition selector & header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDentitionType('adult')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              dentitionType === 'adult'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Dentition Adulte (Dents 11 - 48)
          </button>
          <button
            type="button"
            onClick={() => setDentitionType('pediatric')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              dentitionType === 'pediatric'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Dents Temporaires / Enfants (51 - 85)
          </button>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-emerald-400" />
          <span>Sélectionnez une dent pour modifier son état ou planifier un acte</span>
        </div>
      </div>

      {/* Main Odontogram Canvas & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Visual Interactive Dental Chart */}
        <div className="lg:col-span-8 bg-slate-900/80 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between shadow-inner">
          <div className="space-y-6">
            {/* Upper Jaw (Maxillaire) */}
            <div>
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Droit (Maxillaire Supérieur)
                </span>
                <span className="text-xs font-bold text-emerald-400/80 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                  ARCADE SUPÉRIEURE
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Gauche (Maxillaire Supérieur)
                </span>
              </div>

              <div className="flex items-center justify-center gap-1 sm:gap-2 p-3 bg-slate-950/50 rounded-xl border border-slate-800/70 overflow-x-auto">
                {dentitionType === 'adult' ? (
                  <>
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      {q1.map((num) => (
                        <OdontogramTooth
                          key={num}
                          toothNumber={num}
                          condition={patient.odontogram[num]}
                          isSelected={selectedTooth === num}
                          onClick={setSelectedTooth}
                          isMaxillary={true}
                        />
                      ))}
                    </div>
                    <div className="w-px h-12 bg-slate-700/80 mx-1.5 sm:mx-2" />
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      {q2.map((num) => (
                        <OdontogramTooth
                          key={num}
                          toothNumber={num}
                          condition={patient.odontogram[num]}
                          isSelected={selectedTooth === num}
                          onClick={setSelectedTooth}
                          isMaxillary={true}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5">
                      {q5.map((num) => (
                        <OdontogramTooth
                          key={num}
                          toothNumber={num}
                          condition={patient.odontogram[num]}
                          isSelected={selectedTooth === num}
                          onClick={setSelectedTooth}
                          isMaxillary={true}
                        />
                      ))}
                    </div>
                    <div className="w-px h-12 bg-slate-700/80 mx-3" />
                    <div className="flex items-center gap-1.5">
                      {q6.map((num) => (
                        <OdontogramTooth
                          key={num}
                          toothNumber={num}
                          condition={patient.odontogram[num]}
                          isSelected={selectedTooth === num}
                          onClick={setSelectedTooth}
                          isMaxillary={true}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Anatomical midline & separator */}
            <div className="relative flex items-center justify-center my-1">
              <div className="w-full border-t border-slate-800" />
              <div className="absolute px-3 py-0.5 rounded-full bg-slate-800/90 border border-slate-700 text-[10px] text-slate-400 font-mono">
                Ligne d'occlusion
              </div>
            </div>

            {/* Lower Jaw (Mandibulaire) */}
            <div>
              <div className="flex items-center justify-center gap-1 sm:gap-2 p-3 bg-slate-950/50 rounded-xl border border-slate-800/70 overflow-x-auto">
                {dentitionType === 'adult' ? (
                  <>
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      {q4.map((num) => (
                        <OdontogramTooth
                          key={num}
                          toothNumber={num}
                          condition={patient.odontogram[num]}
                          isSelected={selectedTooth === num}
                          onClick={setSelectedTooth}
                          isMaxillary={false}
                        />
                      ))}
                    </div>
                    <div className="w-px h-12 bg-slate-700/80 mx-1.5 sm:mx-2" />
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      {q3.map((num) => (
                        <OdontogramTooth
                          key={num}
                          toothNumber={num}
                          condition={patient.odontogram[num]}
                          isSelected={selectedTooth === num}
                          onClick={setSelectedTooth}
                          isMaxillary={false}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5">
                      {q8.map((num) => (
                        <OdontogramTooth
                          key={num}
                          toothNumber={num}
                          condition={patient.odontogram[num]}
                          isSelected={selectedTooth === num}
                          onClick={setSelectedTooth}
                          isMaxillary={false}
                        />
                      ))}
                    </div>
                    <div className="w-px h-12 bg-slate-700/80 mx-3" />
                    <div className="flex items-center gap-1.5">
                      {q7.map((num) => (
                        <OdontogramTooth
                          key={num}
                          toothNumber={num}
                          condition={patient.odontogram[num]}
                          isSelected={selectedTooth === num}
                          onClick={setSelectedTooth}
                          isMaxillary={false}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center justify-between px-2 mt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Droit (Mandibulaire)
                </span>
                <span className="text-xs font-bold text-teal-400/80 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/40">
                  ARCADE INFÉRIEURE
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Gauche (Mandibulaire)
                </span>
              </div>
            </div>
          </div>

          {/* Color Status Legend */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {statuses.map((st) => {
              const details = getToothStatusDetails(st);
              return (
                <div key={st} className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-950/40 border border-slate-800/60">
                  <span
                    className="w-3 h-3 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: details.borderHex }}
                  />
                  <span className="truncate text-slate-300 font-medium">{details.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Selected Tooth Inspector & Clinical Action Hub */}
        <div className="lg:col-span-4 bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-5">
          {selectedTooth ? (
            <>
              {/* Tooth Header Info */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-2xl text-emerald-400">
                    {selectedTooth}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">Dent N° {selectedTooth}</h4>
                    <span className="text-xs text-slate-400">
                      {getToothStatusDetails(currentCondition?.status || 'healthy').label}
                    </span>
                  </div>
                </div>

                {currentCondition && currentCondition.status !== 'healthy' && (
                  <button
                    onClick={() => handleUpdateTooth({ status: 'healthy', surfaces: [], notes: '' })}
                    className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
                    title="Remettre à l'état sain"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Réinitialiser</span>
                  </button>
                )}
              </div>

              {/* Status Selector Grid */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide block">
                  État Clinique
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {statuses.map((st) => {
                    const d = getToothStatusDetails(st);
                    const isCurrent = (currentCondition?.status || 'healthy') === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleUpdateTooth({ status: st })}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-left flex items-center justify-between transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-slate-800 border-2 font-bold shadow-sm'
                            : 'bg-slate-950/60 border border-slate-800/80 text-slate-300 hover:bg-slate-800/60'
                        }`}
                        style={{
                          borderColor: isCurrent ? d.borderHex : undefined,
                          color: isCurrent ? '#ffffff' : undefined,
                        }}
                      >
                        <span className="truncate">{d.label}</span>
                        {isCurrent && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Surfaces Selector (for Caries & Restorations) */}
              {(currentCondition?.status === 'caries' || currentCondition?.status === 'restored') && (
                <div className="space-y-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide flex items-center justify-between">
                    <span>Surfaces Affectées</span>
                    <span className="text-[11px] text-emerald-400 font-normal">
                      {currentCondition.surfaces?.join(', ') || 'Toutes faces'}
                    </span>
                  </label>
                  <div className="grid grid-cols-5 gap-1.5 text-center">
                    {(['O', 'M', 'D', 'V', 'L'] as ToothSurface[]).map((surf) => {
                      const active = currentCondition.surfaces?.includes(surf);
                      const labels: Record<ToothSurface, string> = {
                        O: 'Occlusal',
                        M: 'Mésial',
                        D: 'Distal',
                        V: 'Vestib.',
                        L: 'Lingual',
                      };
                      return (
                        <button
                          key={surf}
                          type="button"
                          onClick={() => toggleSurface(surf)}
                          className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            active
                              ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          <div>{surf}</div>
                          <div className="text-[9px] font-normal opacity-80">{labels[surf]}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Clinical Notes for this tooth */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide block">
                  Observation Clinique
                </label>
                <textarea
                  rows={2}
                  value={currentCondition?.notes || ''}
                  onChange={(e) => handleUpdateTooth({ notes: e.target.value })}
                  placeholder="Ex: Douleur à la percussion, fêlure, fistule vestibulaire..."
                  className="w-full text-xs rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 p-2.5 text-white placeholder-slate-600 focus:outline-none"
                />
              </div>

              {/* Quick Add Act to Treatment Plan */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-xs font-semibold text-emerald-400 uppercase tracking-wide flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Planifier un Acte Médical (Devis)</span>
                </label>

                <select
                  value={selectedActTemplate}
                  onChange={(e) => {
                    setSelectedActTemplate(e.target.value);
                    const t = DENTAL_ACT_TEMPLATES.find((x) => x.name === e.target.value);
                    if (t) setCustomPrice(t.price);
                  }}
                  className="w-full text-xs rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 p-2.5 text-white focus:outline-none cursor-pointer"
                >
                  <option value="">-- Choisir un acte dans le catalogue --</option>
                  {DENTAL_ACT_TEMPLATES.map((act) => (
                    <option key={act.name} value={act.name}>
                      {act.name} ({formatDZD(act.price)})
                    </option>
                  ))}
                </select>

                {selectedActTemplate && (
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        value={customPrice}
                        onChange={(e) => setCustomPrice(Number(e.target.value))}
                        className="w-full text-xs rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 p-2 text-white pl-3 pr-12 focus:outline-none"
                      />
                      <span className="absolute right-2.5 top-2 text-[11px] font-bold text-slate-400">
                        DZD
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddActToTreatmentPlan}
                      className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-md cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter au Devis</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <Sparkles className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-sm font-medium">Cliquez sur une dent pour ouvrir l'inspecteur clinique</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
