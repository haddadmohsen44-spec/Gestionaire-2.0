import React, { useState } from 'react';
import { MedicalRisk, Patient, Role } from '../types/dental';
import { formatDate, getRiskBadge } from '../utils/formatters';
import {
  Users,
  Search,
  Plus,
  Phone,
  MapPin,
  Calendar,
  AlertTriangle,
  FolderOpen,
  UserCheck,
  X,
  FileText,
} from 'lucide-react';

interface PatientsListViewProps {
  patients: Patient[];
  role: Role;
  onSelectPatient: (patientId: string) => void;
  onAddPatient: (newPatient: Patient) => void;
  onSendToWaitingRoom: (patientId: string, reason: string) => void;
}

export const PatientsListView: React.FC<PatientsListViewProps> = ({
  patients,
  role,
  onSelectPatient,
  onAddPatient,
  onSendToWaitingRoom,
}) => {
  const [search, setSearch] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New patient state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [age, setAge] = useState<number>(30);
  const [phone, setPhone] = useState('0550 ');
  const [city, setCity] = useState('Alger');
  const [address, setAddress] = useState('');
  const [selectedRisks, setSelectedRisks] = useState<MedicalRisk[]>([]);
  const [allergies, setAllergies] = useState('');

  const filteredPatients = patients.filter((p) => {
    const matchesSearch = `${p.firstName} ${p.lastName} ${p.phone} ${p.fileNumber} ${p.city}`
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesRisk =
      filterRisk === 'all'
        ? true
        : filterRisk === 'risks_only'
        ? p.antecedents.length > 0
        : p.antecedents.includes(filterRisk as MedicalRisk);

    return matchesSearch && matchesRisk;
  });

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) return;

    const fileNum = `D-${new Date().getFullYear()}-${String(patients.length + 46).padStart(4, '0')}`;
    const newPat: Patient = {
      id: `pat-${Date.now()}`,
      fileNumber: fileNum,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      age: Number(age),
      gender,
      phone: phone.trim(),
      city: city.trim(),
      address: address.trim(),
      antecedents: selectedRisks,
      allergies: allergies.trim(),
      odontogram: {},
      treatmentPlans: [],
      createdAt: new Date().toISOString().split('T')[0],
      lastVisit: new Date().toISOString().split('T')[0],
    };

    onAddPatient(newPat);
    setIsAddModalOpen(false);

    // Reset form
    setFirstName('');
    setLastName('');
    setPhone('0550 ');
    setAge(30);
    setAddress('');
    setSelectedRisks([]);
    setAllergies('');
  };

  const toggleRisk = (risk: MedicalRisk) => {
    setSelectedRisks((prev) =>
      prev.includes(risk) ? prev.filter((r) => r !== risk) : [...prev, risk]
    );
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[260px] flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, téléphone, N° dossier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs rounded-xl bg-slate-950 border border-slate-800 p-2.5 pl-9 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="text-xs rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">Tous les patients ({patients.length})</option>
            <option value="risks_only">Avec facteurs de risques médicaux</option>
            <option value="diabete">Diabète</option>
            <option value="hta">Hypertension (HTA)</option>
            <option value="hemorragie">Risque Hémorragique</option>
            <option value="allergie_penicilline">Allergie Pénicilline</option>
          </select>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-900/30 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Dossier Patient</span>
        </button>
      </div>

      {/* Patients Grid / Table */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-inner">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">N° Dossier</th>
                <th className="py-3 px-4">Nom & Prénom</th>
                <th className="py-3 px-4">Âge / Sexe</th>
                <th className="py-3 px-4">Téléphone</th>
                <th className="py-3 px-4">Ville</th>
                <th className="py-3 px-4">Antécédents / Risques</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500 italic">
                    Aucun patient trouvé avec ces critères.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((pat) => (
                  <tr
                    key={pat.id}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                    onClick={() => onSelectPatient(pat.id)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      {pat.fileNumber}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white text-sm">
                      {pat.lastName.toUpperCase()} {pat.firstName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {pat.age} ans ({pat.gender === 'M' ? 'H' : 'F'})
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-slate-500" />
                      {pat.phone}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{pat.city || 'Alger'}</td>
                    <td className="py-3.5 px-4">
                      {pat.antecedents.length === 0 && !pat.allergies ? (
                        <span className="text-slate-500 text-[11px]">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {pat.antecedents.slice(0, 2).map((r) => {
                            const b = getRiskBadge(r);
                            return (
                              <span
                                key={r}
                                className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${b.color}`}
                              >
                                {b.label}
                              </span>
                            );
                          })}
                          {pat.antecedents.length > 2 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                              +{pat.antecedents.length - 2}
                            </span>
                          )}
                          {pat.allergies && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-600 font-bold">
                              ⚠️ Allergie
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td
                      className="py-3.5 px-4 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onSendToWaitingRoom(pat.id, 'Consultation / Soins')}
                          className="px-2.5 py-1 rounded-lg bg-teal-600/20 hover:bg-teal-600 text-teal-300 hover:text-white text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Faire entrer en salle d'attente"
                        >
                          <UserCheck className="w-3 h-3" />
                          <span>Attente</span>
                        </button>
                        <button
                          onClick={() => onSelectPatient(pat.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <FolderOpen className="w-3 h-3 text-emerald-400" />
                          <span>Dossier</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Patient */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Nouveau Dossier Patient</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Nom</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Benali"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full text-xs rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-white focus:outline-none focus:border-emerald-500 uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Prénom</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Amine"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full text-xs rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Sexe</label>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() => setGender('M')}
                      className={`py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        gender === 'M' ? 'bg-emerald-600 text-white' : 'bg-slate-950 text-slate-400'
                      }`}
                    >
                      Homme
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('F')}
                      className={`py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        gender === 'F' ? 'bg-emerald-600 text-white' : 'bg-slate-950 text-slate-400'
                      }`}
                    >
                      Femme
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Âge</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    required
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full text-xs rounded-xl bg-slate-950 border border-slate-800 p-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Téléphone</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs rounded-xl bg-slate-950 border border-slate-800 p-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Ville / Commune</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ex: Alger, Oran, Blida..."
                    className="w-full text-xs rounded-xl bg-slate-950 border border-slate-800 p-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Adresse</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ex: Cité 5 Juillet, Bat 12..."
                    className="w-full text-xs rounded-xl bg-slate-950 border border-slate-800 p-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Antecedents / Medical Risks (Dentist or Intake notes) */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-xs font-semibold text-slate-300 block">
                  Facteurs de Risques Médicaux (Sélection rapide)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['diabete', 'hta', 'hemorragie', 'allergie_penicilline'] as MedicalRisk[]).map(
                    (risk) => {
                      const badge = getRiskBadge(risk);
                      const isSelected = selectedRisks.includes(risk);
                      return (
                        <button
                          key={risk}
                          type="button"
                          onClick={() => toggleRisk(risk)}
                          className={`p-2 rounded-xl text-[11px] font-semibold text-left transition-all border cursor-pointer ${
                            isSelected
                              ? 'bg-slate-800 border-rose-500 text-rose-300'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          {badge.label}
                        </button>
                      );
                    }
                  )}
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
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg cursor-pointer"
                >
                  Créer le Dossier Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
