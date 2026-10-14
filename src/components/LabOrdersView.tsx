import React, { useState } from 'react';
import { LabOrder, Patient, Role } from '../types/dental';
import { formatDZD, formatDate } from '../utils/formatters';
import {
  Sparkles,
  Plus,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Building2,
  DollarSign,
  X,
} from 'lucide-react';

interface LabOrdersViewProps {
  labOrders: LabOrder[];
  patients: Patient[];
  role: Role;
  onAddOrder: (order: LabOrder) => void;
  onUpdateOrder: (updatedOrder: LabOrder) => void;
}

export const LabOrdersView: React.FC<LabOrdersViewProps> = ({
  labOrders,
  patients,
  role,
  onAddOrder,
  onUpdateOrder,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [labName, setLabName] = useState('Labo Prothèse Zircone El Mordjane');
  const [workType, setWorkType] = useState('Couronne Zircone VITA');
  const [teeth, setTeeth] = useState('');
  const [shade, setShade] = useState('A2');
  const [sentDate, setSentDate] = useState(new Date().toISOString().split('T')[0]);
  const [tryInDate, setTryInDate] = useState('');
  const [cost, setCost] = useState<number>(8500);
  const [notes, setNotes] = useState('');

  const pendingOrders = labOrders.filter((o) => o.status !== 'fitted');
  const fittedOrders = labOrders.filter((o) => o.status === 'fitted');

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === patientId);
    if (!pat) return;

    const newOrder: LabOrder = {
      id: `lab-${Date.now()}`,
      patientId: pat.id,
      patientName: `${pat.lastName.toUpperCase()} ${pat.firstName}`,
      labName,
      workType,
      teeth: teeth || '16',
      shade,
      sentDate,
      tryInDate: tryInDate || sentDate,
      cost: Number(cost),
      isPaidToLab: false,
      status: 'sent',
      notes,
    };

    onAddOrder(newOrder);
    setIsModalOpen(false);
    setTeeth('');
    setNotes('');
  };

  const getStatusBadge = (status: LabOrder['status']) => {
    switch (status) {
      case 'sent':
        return {
          label: 'Au Laboratoire',
          color: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        };
      case 'try_in':
        return {
          label: 'Reçu - Essayage',
          color: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
        };
      case 'ready':
        return {
          label: 'Prêt pour la Pose',
          color: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
        };
      case 'fitted':
        return {
          label: 'Posé au Patient',
          color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Suivi des Travaux de Prothèse</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {pendingOrders.length} en cours
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Gestion des commandes prothétiques, teintes VITA, essayages et coûts laboratoires
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-950/30 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle Commande Laboratoire</span>
        </button>
      </div>

      {/* Lab Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {labOrders.length === 0 ? (
          <div className="col-span-full bg-slate-900/60 rounded-2xl border border-slate-800 p-12 text-center text-slate-500">
            Aucun travail de prothèse enregistré pour le moment.
          </div>
        ) : (
          labOrders.map((order) => {
            const badge = getStatusBadge(order.status);
            return (
              <div
                key={order.id}
                className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-400">
                        {order.patientName}
                      </span>
                      <h3 className="text-sm font-black text-white mt-0.5">
                        {order.workType}
                      </h3>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">Dents</span>
                      <span className="font-bold text-slate-200">Dent(s) {order.teeth}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">Teinte VITA</span>
                      <span className="font-bold text-amber-300">{order.shade}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">Date Envoi</span>
                      <span className="text-slate-300 font-mono">{formatDate(order.sentDate)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">Essayage / Pose</span>
                      <span className="text-emerald-300 font-mono font-bold">
                        {formatDate(order.tryInDate)}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1">
                    <p className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">{order.labName}</span>
                    </p>
                    {order.notes && (
                      <p className="text-[11px] text-slate-400 italic bg-slate-950/40 p-2 rounded-lg border border-slate-800/50">
                        "{order.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Coût Labo</span>
                    <span className="font-mono font-bold text-slate-200">
                      {formatDZD(order.cost)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {order.status !== 'fitted' && (
                      <button
                        onClick={() => {
                          const nextStatus: Record<LabOrder['status'], LabOrder['status']> = {
                            sent: 'try_in',
                            try_in: 'ready',
                            ready: 'fitted',
                            fitted: 'fitted',
                          };
                          onUpdateOrder({ ...order, status: nextStatus[order.status] });
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        Avancer Étape →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: New Lab Order */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Nouvelle Commande de Prothèse</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Patient Concerné</label>
                <select
                  required
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full text-xs rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="">-- Sélectionner un patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.lastName.toUpperCase()} {p.firstName} ({p.fileNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Laboratoire de Prothèse</label>
                <input
                  type="text"
                  required
                  value={labName}
                  onChange={(e) => setLabName(e.target.value)}
                  placeholder="Ex: Laboratoire Prothèse El Mordjane, Alger"
                  className="w-full text-xs rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">Type de Travail</label>
                  <select
                    value={workType}
                    onChange={(e) => setWorkType(e.target.value)}
                    className="w-full text-xs rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Couronne Zircone VITA">Couronne Zircone VITA</option>
                    <option value="Couronne Céramo-Métallique (CCM)">Céramo-Métallique (CCM)</option>
                    <option value="Facette Céramique E-max">Facette Céramique E-max</option>
                    <option value="Bridge Zircone 3 éléments">Bridge Zircone</option>
                    <option value="Stellite Squelettique">Stellite Squelettique</option>
                    <option value="Prothèse Amovible Résine Complète">Prothèse Résine Complète</option>
                    <option value="Gouttière de Bruxisme / Blanchiment">Gouttière de Bruxisme</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">Dents Concernées</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 16 ou 11, 21, 22"
                    value={teeth}
                    onChange={(e) => setTeeth(e.target.value)}
                    className="w-full text-xs rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">Teinte VITA</label>
                  <select
                    value={shade}
                    onChange={(e) => setShade(e.target.value)}
                    className="w-full text-xs rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {['A1', 'A2', 'A3', 'A3.5', 'A4', 'B1', 'B2', 'B3', 'C1', 'C2', 'D2', 'Bleach 1', 'Bleach 2'].map(
                      (s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">Date d'Essayage</label>
                  <input
                    type="date"
                    required
                    value={tryInDate}
                    onChange={(e) => setTryInDate(e.target.value)}
                    className="w-full text-xs rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">Coût Labo (DZD)</label>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={cost}
                    onChange={(e) => setCost(Number(e.target.value))}
                    className="w-full text-xs font-bold font-mono rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Instructions & Observations Prothésiste</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Émergence gingivale soignée, point de contact serré, transvissée sur implant..."
                  className="w-full text-xs rounded-xl bg-slate-950 border border-slate-800 p-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!patientId || !teeth}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg cursor-pointer"
                >
                  Enregistrer la Commande
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
