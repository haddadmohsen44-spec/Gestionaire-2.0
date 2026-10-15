import React, { useState } from 'react';
import { ClinicSettings, Patient, Prescription, PrescriptionItem } from '../types/dental';
import { ALGERIAN_PHARMA_PRESETS, PharmaPreset } from '../data/defaultData';
import { formatDate } from '../utils/formatters';
import { X, Printer, Plus, Trash2, Pill, Check, FileText } from 'lucide-react';

interface PrescriptionModalProps {
  patient: Patient;
  settings: ClinicSettings;
  isOpen: boolean;
  onClose: () => void;
  onSavePrescription: (prescription: Prescription) => void;
  initialPrescription?: Prescription;
}

export const PrescriptionModal: React.FC<PrescriptionModalProps> = ({
  patient,
  settings,
  isOpen,
  onClose,
  onSavePrescription,
  initialPrescription,
}) => {
  const [items, setItems] = useState<PrescriptionItem[]>(
    initialPrescription?.items || [
      {
        id: `item-1`,
        medicine: 'Amoxicilline',
        dosage: '1 g (Comprimé)',
        posology: '1 comprimé matin et soir au milieu des repas',
        duration: '6 jours',
      },
      {
        id: `item-2`,
        medicine: 'Spidifen (Ibuprofène L-Arginine)',
        dosage: '400 mg (Sachet)',
        posology: '1 sachet toutes les 8 heures si douleur après les repas',
        duration: '4 jours',
      },
    ]
  );

  const [instructions, setInstructions] = useState<string>(
    initialPrescription?.instructions ||
      'Éviter les boissons très chaudes. Brossage délicat de la zone traitée.'
  );

  const [customMed, setCustomMed] = useState({
    medicine: '',
    dosage: '',
    posology: '',
    duration: '',
  });

  if (!isOpen) return null;

  const handleAddPreset = (preset: PharmaPreset) => {
    const newItem: PrescriptionItem = {
      id: `item-${Date.now()}-${Math.random()}`,
      medicine: preset.name,
      dosage: preset.dosage,
      posology: preset.posology,
      duration: preset.duration,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMed.medicine.trim()) return;
    const newItem: PrescriptionItem = {
      id: `item-${Date.now()}`,
      medicine: customMed.medicine,
      dosage: customMed.dosage || 'Selon prescription',
      posology: customMed.posology || '1 prise par jour',
      duration: customMed.duration || '5 jours',
    };
    setItems((prev) => [...prev, newItem]);
    setCustomMed({ medicine: '', dosage: '', posology: '', duration: '' });
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSaveAndPrint = () => {
    const newPrescription: Prescription = {
      id: initialPrescription?.id || `presc-${Date.now()}`,
      patientId: patient.id,
      patientName: `${patient.lastName.toUpperCase()} ${patient.firstName}`,
      patientAge: patient.age,
      date: new Date().toISOString().split('T')[0],
      items,
      instructions,
    };

    onSavePrescription(newPrescription);
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto">
        {/* Top Action Bar (Screen Only) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Générateur d'Ordonnance Médicale</h3>
              <p className="text-xs text-slate-400">
                Patient: <span className="text-emerald-400 font-semibold">{patient.lastName.toUpperCase()} {patient.firstName}</span> ({patient.age} ans)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveAndPrint}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-900/30 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer l'Ordonnance (A4 / A5)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Left column presets & editor, Right column printable paper sheet */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Presets & Editing Controls (Screen Only) */}
          <div className="no-print lg:col-span-5 p-5 border-r border-slate-800 space-y-5 bg-slate-900/90 max-h-[75vh] overflow-y-auto">
            {/* Algerian Presets Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5" />
                  Prescriptions Prédéfinies (Algérie)
                </span>
                <span className="text-[10px] text-slate-500">1-clic pour ajouter</span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {ALGERIAN_PHARMA_PRESETS.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => handleAddPreset(preset)}
                    className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/40 transition-all cursor-pointer group flex items-start justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white group-hover:text-emerald-300">
                          {preset.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {preset.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{preset.dosage}</p>
                      <p className="text-[10px] text-slate-500 italic mt-0.5">{preset.posology}</p>
                    </div>
                    <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Medication Form */}
            <form onSubmit={handleAddCustom} className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wide block">
                Ajouter un Autre Médicament
              </span>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Nom de la molécule / Spécialité"
                  value={customMed.medicine}
                  onChange={(e) => setCustomMed({ ...customMed, medicine: e.target.value })}
                  className="w-full text-xs rounded-xl bg-slate-900 border border-slate-800 p-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Dosage (ex: 500 mg)"
                    value={customMed.dosage}
                    onChange={(e) => setCustomMed({ ...customMed, dosage: e.target.value })}
                    className="text-xs rounded-xl bg-slate-900 border border-slate-800 p-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    placeholder="Durée (ex: 5 jours)"
                    value={customMed.duration}
                    onChange={(e) => setCustomMed({ ...customMed, duration: e.target.value })}
                    className="text-xs rounded-xl bg-slate-900 border border-slate-800 p-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Posologie (ex: 1 cp matin et soir)"
                  value={customMed.posology}
                  onChange={(e) => setCustomMed({ ...customMed, posology: e.target.value })}
                  className="w-full text-xs rounded-xl bg-slate-900 border border-slate-800 p-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Insérer dans l'ordonnance</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Authentic Algerian Medical Prescription Sheet */}
          <div className="lg:col-span-7 p-6 bg-slate-950 flex flex-col justify-between max-h-[75vh] overflow-y-auto">
            {/* The A4 / A5 Paper Style Container */}
            <div
              id="ordonnance-print-area"
              className="bg-white text-slate-900 p-8 sm:p-10 rounded-2xl shadow-xl border border-slate-300 min-h-[560px] flex flex-col justify-between"
            >
              <div>
                {/* Official Algerian Clinic Header */}
                <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
                  <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                      {settings.doctorName}
                    </h2>
                    <p className="text-xs sm:text-sm font-bold text-emerald-800">
                      {settings.doctorSpecialty}
                    </p>
                    <p className="text-xs text-slate-600 font-medium font-serif" dir="rtl">
                      {settings.doctorSpecialtyAr}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-700">
                      N° d'Ordre CND: <span className="font-mono">{settings.orderNumber}</span>
                    </p>
                  </div>

                  <div className="text-right text-[11px] text-slate-600 space-y-0.5">
                    <p className="font-bold text-slate-800">{settings.clinicName}</p>
                    <p>{settings.address}</p>
                    <p>{settings.city}</p>
                    <p className="font-bold text-slate-800">Tél: {settings.phone1} / {settings.phone2}</p>
                  </div>
                </div>

                {/* Date & Patient line */}
                <div className="my-5 flex items-center justify-between text-xs sm:text-sm">
                  <div className="text-slate-800">
                    <span className="font-bold">Patient(e): </span>
                    <span className="font-extrabold uppercase text-slate-950 text-base">
                      {patient.lastName} {patient.firstName}
                    </span>
                    <span className="ml-2 font-medium text-slate-600">({patient.age} ans)</span>
                  </div>

                  <div className="font-medium text-slate-700">
                    {settings.city.split(',')[0]}, le{' '}
                    <span className="font-bold">
                      {new Date().toLocaleDateString('fr-DZ', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Prescription Title */}
                <div className="text-center my-4">
                  <span className="text-base sm:text-lg font-black tracking-widest uppercase border-b-2 border-emerald-800 pb-0.5 px-4 text-emerald-900">
                    ORDONNANCE
                  </span>
                </div>

                {/* Medication Items List */}
                <div className="space-y-4 my-6">
                  {items.length === 0 ? (
                    <p className="text-center text-slate-400 py-8 italic text-xs">
                      Aucun médicament sélectionné. Cliquez sur un preset à gauche pour l'ajouter.
                    </p>
                  ) : (
                    items.map((item, idx) => (
                      <div key={item.id} className="relative group/item pl-2 border-l-2 border-emerald-700/60">
                        <div className="flex items-baseline justify-between">
                          <div className="font-black text-slate-900 text-sm sm:text-base">
                            {idx + 1}. {item.medicine} - <span className="font-semibold text-slate-800">{item.dosage}</span>
                          </div>
                          {/* Screen delete button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="no-print opacity-0 group-hover/item:opacity-100 text-rose-600 hover:text-rose-800 transition-opacity p-1 cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-xs sm:text-sm text-slate-700 mt-0.5 font-medium pl-3">
                          • {item.posology} <span className="font-semibold">({item.duration})</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Additional instructions */}
                {instructions && (
                  <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-600 italic">
                    <span className="font-bold not-italic text-slate-700">Recommandations: </span>
                    {instructions}
                  </div>
                )}
              </div>

              {/* Bottom Stamp & Signature Box */}
              <div className="pt-6 mt-8 border-t border-slate-300 flex items-end justify-between">
                <div className="text-[10px] text-slate-500 space-y-0.5 max-w-[260px]">
                  <p>Ordonnance valable uniquement pour le patient désigné.</p>
                  <p className="font-semibold text-slate-600">DentiDZ Pro Medical Practice System</p>
                </div>

                <div className="text-center w-52 p-3 border-2 border-dashed border-slate-300 rounded-xl">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Cachet et Signature
                  </span>
                  <div className="h-16 flex items-center justify-center text-xs font-serif text-slate-400 italic">
                    {settings.doctorName}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
