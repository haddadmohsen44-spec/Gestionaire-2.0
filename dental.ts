export type Role = 'dentist' | 'assistant';

export type ToothStatus =
  | 'healthy'       // Saine
  | 'caries'        // Carie active
  | 'restored'      // Obturée / Composite / Amalgame
  | 'endo'          // Dévitalisée / Traitement endodontique
  | 'crown'         // Couronne / Prothèse fixée
  | 'missing'       // Absente / Extraite
  | 'to_extract'    // Indication d'extraction
  | 'implant';      // Implant posé

export type ToothSurface = 'O' | 'M' | 'D' | 'V' | 'L'; // Occlusal, Mésial, Distal, Vestibulaire, Lingual/Palatin

export interface ToothCondition {
  number: number; // FDI 11-48 or 51-85
  status: ToothStatus;
  surfaces?: ToothSurface[]; // surfaces affected if caries or restored
  notes?: string;
  treatmentPlanned?: string;
  cost?: number; // In DZD
}

export type QueueStatus = 'waiting' | 'in_chair' | 'completed' | 'left';

export interface Patient {
  id: string;
  fileNumber: string; // e.g. "D-2026-0042"
  firstName: string;
  lastName: string;
  birthDate?: string;
  age: number;
  gender: 'M' | 'F';
  phone: string;
  address?: string;
  city?: string; // e.g. Alger, Oran, Constantine, Blida...
  antecedents: MedicalRisk[];
  customAntecedents?: string;
  allergies?: string;
  notes?: string;
  odontogram: Record<number, ToothCondition>;
  treatmentPlans: TreatmentAct[];
  createdAt: string;
  lastVisit?: string;
}

export type MedicalRisk =
  | 'diabete'
  | 'hta'
  | 'hemorragie'
  | 'allergie_penicilline'
  | 'grossesse'
  | 'cardiopathie'
  | 'asthme'
  | 'hepatite';

export interface TreatmentAct {
  id: string;
  patientId: string;
  date: string;
  toothNumber?: number;
  actName: string; // e.g. "Détartrage", "Traitement canalaire", "Composite 2 faces"
  category: 'soin' | 'chirurgie' | 'prothese' | 'parodontie' | 'orthodontie';
  cost: number; // in DZD
  paid: number; // in DZD
  status: 'planned' | 'in_progress' | 'completed';
  notes?: string;
}

export interface QueueItem {
  id: string;
  patientId: string;
  patientName: string;
  phone: string;
  arrivalTime: string;
  status: QueueStatus;
  reason: string; // e.g. "Urgence douleur", "Contrôle", "Soin carie", "Essayage prothèse"
  priority: 'normal' | 'urgent';
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  phone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  durationMinutes: number;
  reason: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

export interface PaymentRecord {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  amount: number; // in DZD
  type: 'payment' | 'deposit'; // Règlement ou Acompte
  method: 'especes' | 'baridimob' | 'cheque' | 'virement_ccp';
  actDescription?: string;
  receiptNumber: string;
}

export interface ExpenseRecord {
  id: string;
  date: string;
  description: string;
  category: 'fournitures' | 'laboratoire' | 'loyer_charges' | 'maintenance' | 'divers';
  amount: number; // in DZD
  beneficiary?: string; // e.g. Dépôt dentaire, Prothésiste
}

export interface LabOrder {
  id: string;
  patientId: string;
  patientName: string;
  labName: string; // e.g. "Laboratoire Dentaire Zircone Alger"
  workType: string; // e.g. "Couronne Zircone", "Céramo-Métallique", "Stellite / Squelettique"
  teeth: string; // e.g. "16, 17, 21"
  shade: string; // e.g. "A2", "A3", "B1"
  sentDate: string;
  tryInDate: string;
  deliveryDate?: string;
  cost: number; // Coût labo en DZD
  isPaidToLab: boolean;
  status: 'sent' | 'try_in' | 'ready' | 'fitted';
  notes?: string;
}

export interface PrescriptionItem {
  id: string;
  medicine: string;
  dosage: string;
  posology: string; // e.g. "1 comprimé 2 fois par jour pendant 6 jours"
  duration: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  date: string;
  items: PrescriptionItem[];
  instructions?: string;
}

export interface ClinicSettings {
  doctorName: string;
  doctorSpecialty: string;
  doctorSpecialtyAr: string;
  clinicName: string;
  clinicSubtitle: string;
  address: string;
  city: string;
  phone1: string;
  phone2?: string;
  email?: string;
  orderNumber: string; // N° Ordre des Médecins Dentistes
  pinCode: string; // PIN for Dentist Mode
  currency: string; // default "DZD"
}

export interface DentalAppState {
  settings: ClinicSettings;
  patients: Patient[];
  queue: QueueItem[];
  appointments: Appointment[];
  payments: PaymentRecord[];
  expenses: ExpenseRecord[];
  labOrders: LabOrder[];
  prescriptions: Prescription[];
  lastUpdated: string;
}

export interface SyncMessage {
  type: 'STATE_SYNC' | 'QUEUE_UPDATE' | 'PAYMENT_ADDED' | 'CALL_PATIENT' | 'PING' | 'PONG';
  payload?: any;
  senderRole: Role;
  timestamp: number;
}
