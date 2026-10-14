import React, { useState } from 'react';
import {
  ClinicSettings,
  MedicalRisk,
  Patient,
  Prescription,
  Role,
  TreatmentAct,
} from '../types/dental';
import { OdontogramView } from './OdontogramView';
import { PrescriptionModal } from './PrescriptionModal';
import { formatDZD, formatDate, getRiskBadge } from '../utils/formatters';
import {
  X,
  User,
  Phone,
  MapPin,
  Calendar,
  AlertTriangle,
  Lock,
  FileText,
  DollarSign,
  Plus,
  CheckCircle2,
  Clock,
  Printer,
  Sparkles,
  Edit2,
  ShieldAlert,
} from 'lucide-react';

interface PatientDetailModalProps {
  patient: Patient;
  settings: ClinicSettings;
  role: Role;
  isOpen: boolean;
  onClose: () => void;
  onUpdatePatient: (updatedPatient: Patient) => void;
  onOpenPinModal: () => void;
  onSavePrescription: (prescription: Prescription) => void;
  patientPrescriptions: Prescription[];
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  patient,
  settings,
  role,
  isOpen,
  onClose,
  onUpdatePatient,
  onOpenPinModal,
  onSavePrescription,
  patientPrescriptions,
}) => {
  const [activeTab, setActiveTab] = useState<'odontogram' | 'history' | 'treatments' | 'billing' | 'prescriptions'>('odontogram');
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Edit form state
  const [editFirstName, setEditFirstName] = useState(patient.firstName);
  const [editLastName, setEditLastName] = useState(patient.lastName);
  const [editPhone, setEditPhone] = useState(patient.phone);
  const [editAge, setEditAge] = useState(patient.age);
  const [editCity, setEditCity] = useState(patient.city || 'Alger');
  const [editAddress, setEditAddress] = useState(patient.address || '');
  const [editCustomAntecedents, setEditCustomAntecedents] = useState(patient.customAntecedents || '');
  const [editAllergies, setEditAllergies] = useState(patient.allergies || '');

  const isDentist = role === 'dentist';

  if (!isOpen) return null;

  const totalDevis = patient.treatmentPlans.reduce((acc, t) => acc + t.cost, 0);
  const totalPaid = patient.treatmentPlans.reduce((acc, t) => acc + t.paid, 0);
  const remainingDue = totalDevis - totalPaid;

  const handleToggleRisk = (risk: MedicalRisk) => {
    if (!isDentist) return;
    const exists = patient.antecedents.includes(risk);
    const updatedAntecedents = exists
      ? patient.antecedents.filter((r) => r !== risk)
      : [...patient.antecedents, risk];

    onUpdatePatient({
      ...patient,
      antecedents: updatedAntecedents,
    });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePatient({
      ...patient,
      firstName: editFirstName,
      lastName: editLastName,
      phone: editPhone,
      age: Number(editAge),
      city: editCity,
      address: editAddress,
      customAntecedents: editCustomAntecedents,
      allergies: editAllergies,
    });
    setIsEditingProfile(false);
  };

  const allRisks: MedicalRisk[] = [
    'diabete',
    'hta',
    'hemorragie',
    'allergie_penicilline',
    'grossesse',
    'cardiopathie',
    'asthme',
    'hepatite',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Top Header Information Card */}
        <div className="p-5 sm:p-6 bg-slate-950/80 border-b border-slate-800 flex-shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-950/40">
                {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
              </div>

              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {patient.lastName.toUpperCase()} {patient.firstName}
                  </h2>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-800 text-emerald-400 border border-slate-700">
                    {patient.fileNumber}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                    {patient.gender === 'M' ? 'Homme' : 'Femme'}, {patient.age} ans
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1 text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    {patient.phone}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {patient.city || 'Algérie'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    Dernière visite: {formatDate(patient.lastVisit || patient.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Modifier Coordonnées</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* CRITICAL MEDICAL ALERTS BANNER (Always prominent for clinical safety) */}
          {patient.antecedents.length > 0 && (
            <div className="mt-4 p-3 rounded-2xl bg-rose-950/30 border border-rose-500/40 flex flex-wrap items-center gap-2 shadow-inner">
              <span className="text-xs font-black text-rose-400 uppercase tracking-wider flex items-center gap-1 mr-2">
                <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
                Facteurs de Risque Médicaux:
              </span>
              {patient.antecedents.map((risk) => {
                const b = getRiskBadge(risk);
                return (
                  <span
                    key={risk}
                    title={b.desc}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1.5 ${b.color}`}
                  >
                    <span>{b.label}</span>
                    {b.labelAr && <span className="opacity-75 text-[10px]" dir="rtl">{b.labelAr}</span>}
                  </span>
                );
              })}
              {patient.allergies && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-950/80 text-purple-300 border border-purple-500">
                  ⚠️ {patient.allergies}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between flex-shrink-0 overflow-x-auto">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('odontogram')}
              className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'odontogram'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Odontogramme FDI</span>
              {!isDentist && <Lock className="w-3.5 h-3.5 text-amber-400" />}
            </button>

            <button
              onClick={() => setActiveTab('treatments')}
              className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'treatments'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Plan de Traitement & Actes</span>
              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-300">
                {patient.treatmentPlans.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'history'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Antécédents & Risques</span>
              {!isDentist && <Lock className="w-3.5 h-3.5 text-amber-400" />}
            </button>

            <button
              onClick={() => setActiveTab('prescriptions')}
              className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'prescriptions'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Ordonnances Médicales</span>
              {!isDentist && <Lock className="w-3.5 h-3.5 text-amber-400" />}
            </button>

            <button
              onClick={() => setActiveTab('billing')}
              className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'billing'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Règlements & Solde ({formatDZD(remainingDue)})</span>
            </button>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {/* EDIT PROFILE DRAWER */}
          {isEditingProfile && (
            <form onSubmit={handleSaveProfile} className="mb-6 p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-emerald-400">Modifier le Profil du Patient</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Nom"
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  className="text-xs rounded-xl bg-slate-900 border border-slate-800 p-2 text-white"
                />
                <input
                  type="text"
                  required
                  placeholder="Prénom"
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  className="text-xs rounded-xl bg-slate-900 border border-slate-800 p-2 text-white"
                />
                <input
                  type="text"
                  required
                  placeholder="Téléphone"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="text-xs rounded-xl bg-slate-900 border border-slate-800 p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="number"
                  placeholder="Âge"
                  value={editAge}
                  onChange={(e) => setEditAge(Number(e.target.value))}
                  className="text-xs rounded-xl bg-slate-900 border border-slate-800 p-2 text-white"
                />
                <input
                  type="text"
                  placeholder="Ville / Wilaya"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  className="text-xs rounded-xl bg-slate-900 border border-slate-800 p-2 text-white"
                />
                <input
                  type="text"
                  placeholder="Adresse"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="text-xs rounded-xl bg-slate-900 border border-slate-800 p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          )}

          {/* TAB 1: ODONTOGRAMME */}
          {activeTab === 'odontogram' && (
            <OdontogramView
              patient={patient}
              role={role}
              onUpdatePatient={onUpdatePatient}
              onOpenPinModal={onOpenPinModal}
            />
          )}

          {/* TAB 2: ANTECEDENTS & RISQUES */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              {!isDentist ? (
                <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-8 text-center space-y-3">
                  <Lock className="w-8 h-8 text-amber-400 mx-auto" />
                  <h3 className="font-bold text-white text-base">Dossier Médical Confidentiel</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    La consultation des antécédents médicaux et pathologies est soumise au secret médical du praticien.
                  </p>
                  <button
                    onClick={onOpenPinModal}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
                  >
                    Déverrouiller Mode Dentiste (PIN)
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-emerald-400" />
                      Sélection des Antécédents Médicaux Majeurs
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {allRisks.map((risk) => {
                        const badge = getRiskBadge(risk);
                        const isActive = patient.antecedents.includes(risk);
                        return (
                          <div
                            key={risk}
                            onClick={() => handleToggleRisk(risk)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                              isActive
                                ? 'bg-slate-900 border-2 shadow-lg ' + badge.color
                                : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <span className="font-bold text-xs">{badge.label}</span>
                              <input
                                type="checkbox"
                                checked={isActive}
                                onChange={() => {}}
                                className="rounded text-emerald-500"
                              />
                            </div>
                            <p className="text-[10px] mt-2 opacity-80">{badge.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wide block">
                        Détails Antécédents Médicaux / Traitements en cours
                      </label>
                      <textarea
                        rows={3}
                        value={patient.customAntecedents || ''}
                        onChange={(e) =>
                          onUpdatePatient({ ...patient, customAntecedents: e.target.value })
                        }
                        placeholder="Ex: Diabète sous Metformine, Sintrom 1/2 cp par jour..."
                        className="w-full text-xs rounded-xl bg-slate-900 border border-slate-800 p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wide block">
                        Allergies Médicamenteuses / Anesthésiques
                      </label>
                      <textarea
                        rows={3}
                        value={patient.allergies || ''}
                        onChange={(e) =>
                          onUpdatePatient({ ...patient, allergies: e.target.value })
                        }
                        placeholder="Ex: Allergie stricte à la Pénicilline, intolérance au latex..."
                        className="w-full text-xs rounded-xl bg-slate-900 border border-slate-800 p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TREATMENTS & ACTS PLAN */}
          {activeTab === 'treatments' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div>
                  <h3 className="font-bold text-white text-base">Plan de Traitement & Devis</h3>
                  <p className="text-xs text-slate-400">
                    Actes planifiés, en cours de réalisation et terminés
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px] uppercase">Total Devis</span>
                    <span className="font-bold text-white">{formatDZD(totalDevis)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px] uppercase">Reste à payer</span>
                    <span className="font-black text-rose-400">{formatDZD(remainingDue)}</span>
                  </div>
                </div>
              </div>

              {/* Treatments table */}
              <div className="bg-slate-950/50 rounded-2xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800 uppercase">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Dent</th>
                      <th className="py-3 px-4">Acte Médical</th>
                      <th className="py-3 px-4">Statut</th>
                      <th className="py-3 px-4 text-right">Tarif (DZD)</th>
                      <th className="py-3 px-4 text-right">Réglé (DZD)</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {patient.treatmentPlans.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                          Aucun acte enregistré dans le plan de traitement.
                        </td>
                      </tr>
                    ) : (
                      patient.treatmentPlans.map((act) => (
                        <tr key={act.id} className="hover:bg-slate-900/40">
                          <td className="py-3 px-4 text-slate-400">{formatDate(act.date)}</td>
                          <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                            {act.toothNumber ? `Dent ${act.toothNumber}` : 'Général'}
                          </td>
                          <td className="py-3 px-4 font-bold text-white">{act.actName}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                act.status === 'completed'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : act.status === 'in_progress'
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : 'bg-blue-500/20 text-blue-400'
                              }`}
                            >
                              {act.status === 'completed'
                                ? 'Réalisé'
                                : act.status === 'in_progress'
                                ? 'En cours'
                                : 'Planifié'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-white">
                            {formatDZD(act.cost)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                            {formatDZD(act.paid)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {isDentist && act.status !== 'completed' && (
                              <button
                                onClick={() => {
                                  const updated = patient.treatmentPlans.map((t) =>
                                    t.id === act.id ? { ...t, status: 'completed' as const } : t
                                  );
                                  onUpdatePatient({ ...patient, treatmentPlans: updated });
                                }}
                                className="px-2 py-1 rounded bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white text-[11px] font-semibold transition-colors cursor-pointer"
                              >
                                Marquer Réalisé
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: PRESCRIPTIONS (ORDONNANCES) */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-4">
              {!isDentist ? (
                <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-8 text-center space-y-3">
                  <Lock className="w-8 h-8 text-amber-400 mx-auto" />
                  <h3 className="font-bold text-white text-base">Prescription Médicale Protégée</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    La rédaction et l'édition des ordonnances sont réservées au Chirurgien-Dentiste.
                  </p>
                  <button
                    onClick={onOpenPinModal}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
                  >
                    Déverrouiller Mode Dentiste (PIN)
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <div>
                      <h3 className="font-bold text-white text-base">Ordonnances Médicales du Patient</h3>
                      <p className="text-xs text-slate-400">
                        Historique des prescriptions et impression avec en-tête officiel du cabinet
                      </p>
                    </div>

                    <button
                      onClick={() => setIsPrescriptionModalOpen(true)}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-900/30 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Rédiger une Nouvelle Ordonnance</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {patientPrescriptions.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-800">
                        Aucune ordonnance délivrée pour le moment.
                      </div>
                    ) : (
                      patientPrescriptions.map((presc) => (
                        <div
                          key={presc.id}
                          className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-wrap items-center justify-between gap-4"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-emerald-400">
                                {formatDate(presc.date)}
                              </span>
                              <span className="text-xs text-slate-400">•</span>
                              <span className="text-xs font-bold text-white">
                                {presc.items.length} médicament(s)
                              </span>
                            </div>
                            <div className="mt-1 text-xs text-slate-300">
                              {presc.items.map((i) => i.medicine).join(' — ')}
                            </div>
                          </div>

                          <button
                            onClick={() => setIsPrescriptionModalOpen(true)}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Réimprimer</span>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 5: BILLING & PAYMENTS */}
          {activeTab === 'billing' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-white text-base">État Financier du Dossier</h3>
                  <p className="text-xs text-slate-400">Total devis et historique des versements</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-right">
                    <span className="text-[10px] uppercase text-slate-400 block font-semibold">
                      Total Soins
                    </span>
                    <span className="text-sm font-black font-mono text-white">
                      {formatDZD(totalDevis)}
                    </span>
                  </div>

                  <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-right">
                    <span className="text-[10px] uppercase text-slate-400 block font-semibold">
                      Total Payé
                    </span>
                    <span className="text-sm font-black font-mono text-emerald-400">
                      {formatDZD(totalPaid)}
                    </span>
                  </div>

                  <div className="px-4 py-2 rounded-xl bg-rose-950/40 border border-rose-500/40 text-right">
                    <span className="text-[10px] uppercase text-rose-300 block font-semibold">
                      Reste à Régler
                    </span>
                    <span className="text-sm font-black font-mono text-rose-400">
                      {formatDZD(remainingDue)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Prescription Modal Subview */}
      {isPrescriptionModalOpen && (
        <PrescriptionModal
          patient={patient}
          settings={settings}
          isOpen={isPrescriptionModalOpen}
          onClose={() => setIsPrescriptionModalOpen(false)}
          onSavePrescription={(newPresc) => {
            onSavePrescription(newPresc);
            setIsPrescriptionModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
