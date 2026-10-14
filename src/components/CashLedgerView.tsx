import React, { useState } from 'react';
import { ClinicSettings, ExpenseRecord, Patient, PaymentRecord, Role } from '../types/dental';
import { formatDZD, formatDate } from '../utils/formatters';
import { playNotificationChime } from '../utils/audio';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Printer,
  FileSpreadsheet,
  Calendar,
  CreditCard,
  Building,
  CheckCircle2,
  X,
} from 'lucide-react';

interface CashLedgerViewProps {
  payments: PaymentRecord[];
  expenses: ExpenseRecord[];
  patients: Patient[];
  settings: ClinicSettings;
  role: Role;
  onAddPayment: (payment: PaymentRecord) => void;
  onAddExpense: (expense: ExpenseRecord) => void;
}

export const CashLedgerView: React.FC<CashLedgerViewProps> = ({
  payments,
  expenses,
  patients,
  settings,
  role,
  onAddPayment,
  onAddExpense,
}) => {
  const [activeTab, setActiveTab] = useState<'payments' | 'expenses'>('payments');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [printableReceipt, setPrintableReceipt] = useState<PaymentRecord | null>(null);

  // New Payment Form State
  const [newPayPatientId, setNewPayPatientId] = useState('');
  const [newPayAmount, setNewPayAmount] = useState<number>(3000);
  const [newPayType, setNewPayType] = useState<'payment' | 'deposit'>('payment');
  const [newPayMethod, setNewPayMethod] = useState<'especes' | 'baridimob' | 'cheque' | 'virement_ccp'>('especes');
  const [newPayDesc, setNewPayDesc] = useState('Soin carie / consultation');

  // New Expense Form State
  const [newExpDesc, setNewExpDesc] = useState('');
  const [newExpAmount, setNewExpAmount] = useState<number>(1500);
  const [newExpCategory, setNewExpCategory] = useState<ExpenseRecord['category']>('fournitures');
  const [newExpBeneficiary, setNewExpBeneficiary] = useState('Comptoir Dentaire');

  // Calculate totals
  const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netBalance = totalRevenue - totalExpenses;

  // Today totals
  const todayStr = new Date().toISOString().split('T')[0];
  const todayPayments = payments.filter((p) => p.date === todayStr);
  const todayRevenue = todayPayments.reduce((acc, p) => acc + p.amount, 0);
  const todayExpenses = expenses.filter((e) => e.date === todayStr).reduce((acc, e) => acc + e.amount, 0);

  const handleCreatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === newPayPatientId);
    if (!pat || newPayAmount <= 0) return;

    const receiptNum = `REC-${new Date().getFullYear()}-${String(payments.length + 101).padStart(4, '0')}`;
    const newRecord: PaymentRecord = {
      id: `pay-${Date.now()}`,
      patientId: pat.id,
      patientName: `${pat.lastName.toUpperCase()} ${pat.firstName}`,
      date: new Date().toISOString().split('T')[0],
      amount: Number(newPayAmount),
      type: newPayType,
      method: newPayMethod,
      actDescription: newPayDesc,
      receiptNumber: receiptNum,
    };

    playNotificationChime('payment');
    onAddPayment(newRecord);
    setIsPaymentModalOpen(false);
    setPrintableReceipt(newRecord); // Offer instant receipt preview
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpDesc || newExpAmount <= 0) return;

    const newRecord: ExpenseRecord = {
      id: `exp-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      description: newExpDesc,
      amount: Number(newExpAmount),
      category: newExpCategory,
      beneficiary: newExpBeneficiary,
    };

    playNotificationChime('success');
    onAddExpense(newRecord);
    setIsExpenseModalOpen(false);
    setNewExpDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Revenue */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Recettes Encaissées
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
              {formatDZD(totalRevenue)}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span>Aujourd'hui:</span>
              <span className="font-bold text-emerald-300">{formatDZD(todayRevenue)}</span>
            </div>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Dépenses Cabinet
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-400 font-mono tracking-tight">
              {formatDZD(totalExpenses)}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span>Aujourd'hui:</span>
              <span className="font-bold text-rose-300">{formatDZD(todayExpenses)}</span>
            </div>
          </div>
        </div>

        {/* Net Solde */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Bénéfice Net Caisse
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-black font-mono tracking-tight ${netBalance >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
              {formatDZD(netBalance)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Solde disponible au cabinet
            </div>
          </div>
        </div>
      </div>

      {/* Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'payments'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Encaissements Patients ({payments.length})
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'expenses'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Dépenses & Fournitures ({expenses.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
            <span>Enregistrer une Dépense</span>
          </button>
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-900/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Encaisser Règlement (DZD)</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-inner">
        {activeTab === 'payments' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">N° Reçu</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Acte / Prestation</th>
                  <th className="py-3 px-4">Mode de Règlement</th>
                  <th className="py-3 px-4 text-right">Montant (DZD)</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                      Aucun encaissement enregistré pour le moment.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                        {p.receiptNumber}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">{formatDate(p.date)}</td>
                      <td className="py-3.5 px-4 font-bold text-white">{p.patientName}</td>
                      <td className="py-3.5 px-4 text-slate-400">{p.actDescription || 'Soin dentaire'}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                          {p.method === 'especes'
                            ? 'Espèces'
                            : p.method === 'baridimob'
                            ? 'BaridiMob'
                            : p.method === 'cheque'
                            ? 'Chèque'
                            : 'CCP'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-400 text-sm">
                        +{formatDZD(p.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setPrintableReceipt(p)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium flex items-center gap-1 mx-auto transition-colors cursor-pointer"
                        >
                          <Printer className="w-3 h-3 text-emerald-400" />
                          <span>Reçu</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description / Motif</th>
                  <th className="py-3 px-4">Catégorie</th>
                  <th className="py-3 px-4">Bénéficiaire</th>
                  <th className="py-3 px-4 text-right">Montant (DZD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 italic">
                      Aucune dépense enregistrée.
                    </td>
                  </tr>
                ) : (
                  expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 text-slate-300">{formatDate(e.date)}</td>
                      <td className="py-3.5 px-4 font-bold text-white">{e.description}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-400">
                          {e.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">{e.beneficiary || '-'}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-rose-400 text-sm">
                        -{formatDZD(e.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: New Payment */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Encaisser un Règlement</h3>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePayment} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Patient</label>
                <select
                  required
                  value={newPayPatientId}
                  onChange={(e) => setNewPayPatientId(e.target.value)}
                  className="w-full text-xs rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="">-- Choisir un patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.lastName.toUpperCase()} {p.firstName} - {p.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Montant en Dinars (DZD)</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min={100}
                    step={100}
                    value={newPayAmount}
                    onChange={(e) => setNewPayAmount(Number(e.target.value))}
                    className="w-full text-sm font-bold font-mono rounded-xl bg-slate-950 border border-slate-800 p-2.5 pl-4 pr-14 text-white focus:outline-none focus:border-emerald-500"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">
                    DZD
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Mode de Paiement</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'especes', label: 'Espèces (Cash)' },
                    { id: 'baridimob', label: 'BaridiMob' },
                    { id: 'cheque', label: 'Chèque Bancaire' },
                    { id: 'virement_ccp', label: 'Virement CCP' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setNewPayMethod(m.id as any)}
                      className={`p-2 rounded-xl text-center font-medium transition-all cursor-pointer ${
                        newPayMethod === m.id
                          ? 'bg-emerald-600 text-white font-bold shadow-md'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Motif / Acte Concerné</label>
                <input
                  type="text"
                  value={newPayDesc}
                  onChange={(e) => setNewPayDesc(e.target.value)}
                  placeholder="Ex: Reste soin carie, Acompte prothèse..."
                  className="w-full text-xs rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!newPayPatientId}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg cursor-pointer"
                >
                  Valider et Encaisser
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Expense */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Enregistrer une Dépense</h3>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Désignation / Achat</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Cartouches anesthésique, Gants, Alginate..."
                  value={newExpDesc}
                  onChange={(e) => setNewExpDesc(e.target.value)}
                  className="w-full text-xs rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">Montant (DZD)</label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={newExpAmount}
                    onChange={(e) => setNewExpAmount(Number(e.target.value))}
                    className="w-full text-xs font-bold font-mono rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">Catégorie</label>
                  <select
                    value={newExpCategory}
                    onChange={(e) => setNewExpCategory(e.target.value as any)}
                    className="w-full text-xs rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="fournitures">Fournitures / Dépôt</option>
                    <option value="laboratoire">Frais Laboratoire</option>
                    <option value="loyer_charges">Loyer & Charges</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="divers">Divers</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Fournisseur / Bénéficiaire</label>
                <input
                  type="text"
                  value={newExpBeneficiary}
                  onChange={(e) => setNewExpBeneficiary(e.target.value)}
                  placeholder="Ex: Comptoir Dentaire d'Alger, Sonelgaz, etc."
                  className="w-full text-xs rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg cursor-pointer"
                >
                  Enregistrer la Dépense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Financial Receipt Modal */}
      {printableReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="no-print flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Reçu de Règlement Patient</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer le Reçu</span>
                </button>
                <button
                  onClick={() => setPrintableReceipt(null)}
                  className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Receipt Printable Sheet */}
            <div className="bg-white text-slate-900 p-6 rounded-xl border border-slate-300 space-y-4">
              <div className="text-center pb-3 border-b border-slate-200">
                <h4 className="font-black text-lg text-slate-900">{settings.clinicName}</h4>
                <p className="text-xs font-semibold text-emerald-800">{settings.doctorName}</p>
                <p className="text-[11px] text-slate-500">{settings.address} - {settings.city}</p>
                <p className="text-[11px] text-slate-500 font-mono">Tél: {settings.phone1}</p>
              </div>

              <div className="text-center py-1">
                <span className="text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-800 px-3 py-1 rounded border border-slate-300">
                  REÇU DE RÈGLEMENT N° {printableReceipt.receiptNumber}
                </span>
              </div>

              <div className="text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Date:</span>
                  <span className="font-semibold text-slate-800">{formatDate(printableReceipt.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Patient:</span>
                  <span className="font-bold text-slate-900">{printableReceipt.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Désignation:</span>
                  <span className="text-slate-800">{printableReceipt.actDescription || 'Prestation dentaire'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mode de paiement:</span>
                  <span className="font-semibold uppercase text-slate-800">{printableReceipt.method}</span>
                </div>
              </div>

              <div className="my-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950 uppercase">Montant Reçu</span>
                <span className="text-xl font-black font-mono text-emerald-900">
                  {formatDZD(printableReceipt.amount)}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-end text-[11px] text-slate-500">
                <span>Merci de votre confiance.</span>
                <div className="text-center font-serif text-slate-400 italic">
                  Cachet du Cabinet
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
