import React, { useState, useEffect } from 'react';
import {
  ClinicSettings,
  DentalAppState,
  Patient,
  QueueItem,
  Role,
  PaymentRecord,
  ExpenseRecord,
  LabOrder,
  Appointment,
  Prescription,
} from './types/dental';
import { getInitialAppState } from './data/defaultData';
import { syncManager, SyncStatus } from './utils/syncManager';
import { playNotificationChime } from './utils/audio';
import { Header } from './components/Header';
import { KPICards } from './components/KPICards';
import { WaitingRoomView } from './components/WaitingRoomView';
import { PatientsListView } from './components/PatientsListView';
import { PatientDetailModal } from './components/PatientDetailModal';
import { CashLedgerView } from './components/CashLedgerView';
import { AppointmentsView } from './components/AppointmentsView';
import { LabOrdersView } from './components/LabOrdersView';
import { SettingsModal } from './components/SettingsModal';
import { RoleSwitchModal } from './components/RoleSwitchModal';
import { SyncModal } from './components/SyncModal';
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  CalendarCheck,
  Wallet,
  Sparkles,
  UserPlus,
  Play,
  CheckCircle2,
  Clock,
  Phone,
  FileText,
} from 'lucide-react';

const STORAGE_KEY = 'dentidz_pro_data_v1';
const ROLE_KEY = 'dentidz_current_role';

export default function App() {
  // Load initial state from LocalStorage or Algerian Defaults
  const [appState, setAppState] = useState<DentalAppState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading stored state', e);
    }
    return getInitialAppState();
  });

  // Current Role: 'dentist' or 'assistant'
  const [role, setRole] = useState<Role>(() => {
    try {
      const savedRole = localStorage.getItem(ROLE_KEY) as Role;
      if (savedRole === 'assistant' || savedRole === 'dentist') {
        return savedRole;
      }
    } catch {}
    return 'dentist';
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('broadcasting');

  // Multi-Computer Sync listener
  useEffect(() => {
    syncManager.setRole(role);
    localStorage.setItem(ROLE_KEY, role);
  }, [role]);

  useEffect(() => {
    const unsubStatus = syncManager.subscribeStatus(setSyncStatus);

    const unsubMsg = syncManager.subscribe((msg) => {
      if (msg.type === 'STATE_SYNC' && msg.payload) {
        setAppState(msg.payload);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(msg.payload));
        } catch {}
      } else if (msg.type === 'QUEUE_UPDATE' && msg.payload) {
        setAppState((prev) => {
          const updated = { ...prev, queue: msg.payload };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
        playNotificationChime('queue');
      } else if (msg.type === 'PAYMENT_ADDED' && msg.payload) {
        setAppState((prev) => {
          const updated = { ...prev, payments: [msg.payload, ...prev.payments] };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
        playNotificationChime('payment');
      } else if (msg.type === 'CALL_PATIENT') {
        playNotificationChime('call');
      }
    });

    return () => {
      unsubStatus();
      unsubMsg();
    };
  }, []);

  // Save to LocalStorage and broadcast state whenever it changes locally
  const updateStateAndBroadcast = (updater: (prev: DentalAppState) => DentalAppState) => {
    setAppState((prev) => {
      const next = updater(prev);
      next.lastUpdated = new Date().toISOString();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error('LocalStorage save error', e);
      }
      syncManager.broadcast('STATE_SYNC', next);
      return next;
    });
  };

  // Handlers for specific modules
  const handleUpdateQueue = (newQueue: QueueItem[]) => {
    updateStateAndBroadcast((prev) => ({ ...prev, queue: newQueue }));
  };

  const handleUpdatePatient = (updatedPatient: Patient) => {
    updateStateAndBroadcast((prev) => ({
      ...prev,
      patients: prev.patients.map((p) => (p.id === updatedPatient.id ? updatedPatient : p)),
    }));
  };

  const handleAddPatient = (newPatient: Patient) => {
    updateStateAndBroadcast((prev) => ({
      ...prev,
      patients: [newPatient, ...prev.patients],
    }));
    playNotificationChime('success');
  };

  const handleAddPayment = (payment: PaymentRecord) => {
    updateStateAndBroadcast((prev) => {
      // Also update patient paid totals if relevant
      return {
        ...prev,
        payments: [payment, ...prev.payments],
      };
    });
  };

  const handleAddExpense = (expense: ExpenseRecord) => {
    updateStateAndBroadcast((prev) => ({
      ...prev,
      expenses: [expense, ...prev.expenses],
    }));
  };

  const handleAddAppointment = (apt: Appointment) => {
    updateStateAndBroadcast((prev) => ({
      ...prev,
      appointments: [apt, ...prev.appointments],
    }));
  };

  const handleUpdateAppointment = (updated: Appointment) => {
    updateStateAndBroadcast((prev) => ({
      ...prev,
      appointments: prev.appointments.map((a) => (a.id === updated.id ? updated : a)),
    }));
  };

  const handleAddLabOrder = (order: LabOrder) => {
    updateStateAndBroadcast((prev) => ({
      ...prev,
      labOrders: [order, ...prev.labOrders],
    }));
    playNotificationChime('success');
  };

  const handleUpdateLabOrder = (updated: LabOrder) => {
    updateStateAndBroadcast((prev) => ({
      ...prev,
      labOrders: prev.labOrders.map((o) => (o.id === updated.id ? updated : o)),
    }));
  };

  const handleSavePrescription = (prescription: Prescription) => {
    updateStateAndBroadcast((prev) => ({
      ...prev,
      prescriptions: [prescription, ...prev.prescriptions],
    }));
    playNotificationChime('success');
  };

  const handleSendToWaitingRoom = (patientId: string, reason: string) => {
    const pat = appState.patients.find((p) => p.id === patientId);
    if (!pat) return;

    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const item: QueueItem = {
      id: `q-${Date.now()}`,
      patientId: pat.id,
      patientName: `${pat.lastName.toUpperCase()} ${pat.firstName}`,
      phone: pat.phone,
      arrivalTime: time,
      status: 'waiting',
      reason,
      priority: 'normal',
    };

    handleUpdateQueue([item, ...appState.queue]);
    playNotificationChime('queue');
    setActiveTab('salle_attente');
  };

  const handleSaveSettings = (newSettings: ClinicSettings) => {
    updateStateAndBroadcast((prev) => ({ ...prev, settings: newSettings }));
  };

  // Backup & Restore
  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(appState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `DentiDZ_Backup_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.settings && json.patients) {
          updateStateAndBroadcast(() => json);
          alert('Sauvegarde restaurée avec succès !');
        } else {
          alert('Fichier JSON invalide. Structure DentiDZ Pro non reconnue.');
        }
      } catch (err) {
        alert('Erreur lors de la lecture du fichier JSON.');
      }
    };
    reader.readAsText(file);
  };

  // Computed properties
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRevenue = appState.payments
    .filter((p) => p.date === todayStr)
    .reduce((acc, p) => acc + p.amount, 0);

  const waitingPatients = appState.queue.filter((q) => q.status === 'waiting');
  const inChairItem = appState.queue.find((q) => q.status === 'in_chair');
  const todayAppointments = appState.appointments.filter((a) => a.date === todayStr);
  const pendingLabOrders = appState.labOrders.filter((o) => o.status !== 'fitted');

  const selectedPatient = selectedPatientId
    ? appState.patients.find((p) => p.id === selectedPatientId) || null
    : null;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        settings={appState.settings}
        role={role}
        syncStatus={syncStatus}
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsOpen(true)}
        onExportData={handleExportData}
        onImportData={handleImportData}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="no-print flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 overflow-x-auto shadow-md">
          {[
            { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
            { id: 'salle_attente', label: "Salle d'Attente", icon: Users, badge: waitingPatients.length },
            { id: 'patients', label: 'Dossiers Patients', icon: FolderOpen, badge: appState.patients.length },
            { id: 'rdv', label: 'Agenda & RDV', icon: CalendarCheck, badge: todayAppointments.length },
            { id: 'caisse', label: 'Bilan de Caisse', icon: Wallet },
            { id: 'prothese', label: 'Travaux Prothèse', icon: Sparkles, badge: pendingLabOrders.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white text-emerald-900' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Top KPI Cards (Always visible on dashboard, or accessible anytime) */}
        {activeTab === 'dashboard' && (
          <KPICards
            todayRevenue={todayRevenue}
            waitingCount={waitingPatients.length}
            inChairPatientName={inChairItem?.patientName}
            todayAppointmentsCount={todayAppointments.length}
            pendingLabCount={pendingLabOrders.length}
            onNavigateTab={setActiveTab}
          />
        )}

        {/* TAB VIEWS */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 Cols: Live Waiting Queue + Shortcuts */}
            <div className="lg:col-span-8 space-y-6">
              <WaitingRoomView
                queue={appState.queue}
                patients={appState.patients}
                role={role}
                onUpdateQueue={handleUpdateQueue}
                onSelectPatient={setSelectedPatientId}
                onBroadcastCall={(patName) => syncManager.broadcast('CALL_PATIENT', { patName })}
              />
            </div>

            {/* Right 4 Cols: Today's Appointments & Recent Payments */}
            <div className="lg:col-span-4 space-y-6">
              {/* Today's Appointments Box */}
              <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-3 shadow-lg">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4 text-emerald-400" />
                    <span>RDV du Jour ({todayAppointments.length})</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('rdv')}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                  >
                    Voir tout →
                  </button>
                </div>

                <div className="space-y-2 max-h-[280px] overflow-y-auto">
                  {todayAppointments.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4 text-center italic">
                      Aucun rendez-vous prévu aujourd'hui.
                    </p>
                  ) : (
                    todayAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-emerald-400">
                              {apt.time}
                            </span>
                            <span className="text-xs font-bold text-slate-200">
                              {apt.patientName}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{apt.reason}</p>
                        </div>
                        <button
                          onClick={() => handleSendToWaitingRoom(apt.patientId, apt.reason)}
                          className="px-2 py-1 rounded-lg bg-teal-600/20 hover:bg-teal-600 text-teal-300 hover:text-white text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          Entrer
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Lab Orders Pending alert box */}
              <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-3 shadow-lg">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Prothèses en Attente ({pendingLabOrders.length})</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('prothese')}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                  >
                    Gérer →
                  </button>
                </div>

                <div className="space-y-2">
                  {pendingLabOrders.slice(0, 3).map((o) => (
                    <div
                      key={o.id}
                      className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-white">{o.patientName}</p>
                        <p className="text-[11px] text-slate-400">
                          {o.workType} (Dents {o.teeth})
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-amber-300 font-mono">
                        Teinte {o.shade}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: SALLE D'ATTENTE */}
        {activeTab === 'salle_attente' && (
          <WaitingRoomView
            queue={appState.queue}
            patients={appState.patients}
            role={role}
            onUpdateQueue={handleUpdateQueue}
            onSelectPatient={setSelectedPatientId}
            onBroadcastCall={(patName) => syncManager.broadcast('CALL_PATIENT', { patName })}
          />
        )}

        {/* TAB: PATIENTS */}
        {activeTab === 'patients' && (
          <PatientsListView
            patients={appState.patients}
            role={role}
            onSelectPatient={setSelectedPatientId}
            onAddPatient={handleAddPatient}
            onSendToWaitingRoom={handleSendToWaitingRoom}
          />
        )}

        {/* TAB: AGENDA & RDV */}
        {activeTab === 'rdv' && (
          <AppointmentsView
            appointments={appState.appointments}
            patients={appState.patients}
            role={role}
            onAddAppointment={handleAddAppointment}
            onUpdateAppointment={handleUpdateAppointment}
            onMoveToWaitingRoom={handleSendToWaitingRoom}
          />
        )}

        {/* TAB: BILAN DE CAISSE */}
        {activeTab === 'caisse' && (
          <CashLedgerView
            payments={appState.payments}
            expenses={appState.expenses}
            patients={appState.patients}
            settings={appState.settings}
            role={role}
            onAddPayment={handleAddPayment}
            onAddExpense={handleAddExpense}
          />
        )}

        {/* TAB: PROTHESES */}
        {activeTab === 'prothese' && (
          <LabOrdersView
            labOrders={appState.labOrders}
            patients={appState.patients}
            role={role}
            onAddOrder={handleAddLabOrder}
            onUpdateOrder={handleUpdateLabOrder}
          />
        )}
      </main>

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <PatientDetailModal
          patient={selectedPatient}
          settings={appState.settings}
          role={role}
          isOpen={!!selectedPatient}
          onClose={() => setSelectedPatientId(null)}
          onUpdatePatient={handleUpdatePatient}
          onOpenPinModal={() => setIsRoleModalOpen(true)}
          onSavePrescription={handleSavePrescription}
          patientPrescriptions={appState.prescriptions.filter(
            (p) => p.patientId === selectedPatient.id
          )}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        settings={appState.settings}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaveSettings={handleSaveSettings}
      />

      {/* Role Switch PIN Modal */}
      <RoleSwitchModal
        currentRole={role}
        configuredPin={appState.settings.pinCode || '1234'}
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        onRoleChange={setRole}
      />

      {/* WebRTC Multi-Computer Sync Modal */}
      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        syncStatus={syncStatus}
      />
    </div>
  );
}
