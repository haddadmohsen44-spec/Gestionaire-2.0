import { MedicalRisk, ToothStatus } from '../types/dental';

export const formatDZD = (amount: number): string => {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount) + ' DZD';
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-DZ', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const getRiskBadge = (risk: MedicalRisk): { label: string; labelAr: string; color: string; desc: string } => {
  switch (risk) {
    case 'diabete':
      return {
        label: 'Diabète',
        labelAr: 'مرض السكري',
        color: 'bg-amber-950/80 text-amber-300 border-amber-600/50',
        desc: 'Retard de cicatrisation, risque infectieux parodontal',
      };
    case 'hta':
      return {
        label: 'HTA (Hypertension)',
        labelAr: 'ارتفاع ضغط الدم',
        color: 'bg-red-950/80 text-red-300 border-red-600/50',
        desc: 'Attention anesthésiques avec vasoconstricteurs (adrénaline)',
      };
    case 'hemorragie':
      return {
        label: 'Risque Hémorragique',
        labelAr: 'خطر النزيف',
        color: 'bg-rose-950/90 text-rose-300 border-rose-500 font-bold',
        desc: 'Patient sous anticoagulants (Sintrom / Kardegic / Plavix). Surveillance hémostase.',
      };
    case 'allergie_penicilline':
      return {
        label: 'Allergie Pénicilline',
        labelAr: 'حساسية البنسلين',
        color: 'bg-purple-950/80 text-purple-300 border-purple-500 font-bold',
        desc: 'CONTRE-INDICATION STRICTE: Amoxicilline, Augmentin. Prescrire Macrolides / Lincosamides.',
      };
    case 'grossesse':
      return {
        label: 'Grossesse',
        labelAr: 'حمل',
        color: 'bg-pink-950/80 text-pink-300 border-pink-500',
        desc: 'Prudence 1er et 3ème trimestre. Éviter AINS et radiographies non protégées.',
      };
    case 'cardiopathie':
      return {
        label: 'Cardiopathie / Valvulopathie',
        labelAr: 'أمراض القلب',
        color: 'bg-red-950/80 text-red-400 border-red-500',
        desc: 'Risque d\'endocardite infectieuse d\'Osler. Antibioprophylaxie recommandée avant geste invasif.',
      };
    case 'asthme':
      return {
        label: 'Asthme',
        labelAr: 'الربو',
        color: 'bg-blue-950/80 text-blue-300 border-blue-500',
        desc: 'Garder Ventoline à portée de main. Éviter l\'Aspirine et AINS si syndrome de Widal.',
      };
    case 'hepatite':
      return {
        label: 'Hépatite B/C',
        labelAr: 'التهاب الكبد',
        color: 'bg-yellow-950/80 text-yellow-300 border-yellow-500',
        desc: 'Précautions standard de stérilisation et élimination DASRI.',
      };
    default:
      return {
        label: risk,
        labelAr: '',
        color: 'bg-slate-800 text-slate-300 border-slate-700',
        desc: '',
      };
  }
};

export const getToothStatusDetails = (status: ToothStatus): {
  label: string;
  labelAr: string;
  color: string;
  bgHex: string;
  borderHex: string;
} => {
  switch (status) {
    case 'healthy':
      return {
        label: 'Saine',
        labelAr: 'سليمة',
        color: 'text-emerald-400',
        bgHex: '#064e3b',
        borderHex: '#10b981',
      };
    case 'caries':
      return {
        label: 'Carie active',
        labelAr: 'تسوس نشط',
        color: 'text-rose-400',
        bgHex: '#881337',
        borderHex: '#f43f5e',
      };
    case 'restored':
      return {
        label: 'Obturée (Composite/Amalgame)',
        labelAr: 'معالجة / حشوة',
        color: 'text-blue-400',
        bgHex: '#1e3a8a',
        borderHex: '#3b82f6',
      };
    case 'endo':
      return {
        label: 'Dévitalisée (Endo)',
        labelAr: 'علاج الجذور / عصب',
        color: 'text-amber-400',
        bgHex: '#78350f',
        borderHex: '#f59e0b',
      };
    case 'crown':
      return {
        label: 'Couronne / Prothèse fixée',
        labelAr: 'تاج / خراج خزفي',
        color: 'text-yellow-400',
        bgHex: '#713f12',
        borderHex: '#eab308',
      };
    case 'missing':
      return {
        label: 'Absente / Extraite',
        labelAr: 'مفقودة / مخلوعة',
        color: 'text-slate-500',
        bgHex: '#1e293b',
        borderHex: '#475569',
      };
    case 'to_extract':
      return {
        label: 'À Extraire',
        labelAr: 'تستوجب القلع',
        color: 'text-red-500',
        bgHex: '#450a0a',
        borderHex: '#ef4444',
      };
    case 'implant':
      return {
        label: 'Implant Dentaire',
        labelAr: 'زرع سن',
        color: 'text-cyan-400',
        bgHex: '#164e63',
        borderHex: '#06b6d4',
      };
  }
};
