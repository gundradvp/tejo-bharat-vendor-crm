import { PipelineStage, CallOutcome, Priority } from '../types/vendor';

export function cleanPhoneNumber(rawPhone?: string | null): string {
  if (!rawPhone) return '';
  // Remove non-digit characters
  const digits = rawPhone.replace(/\D/g, '');
  // If it starts with 91 and has 12 digits, return last 10 or with 91
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  return digits;
}

export function formatPhoneDisplay(rawPhone?: string | null): string {
  const clean = cleanPhoneNumber(rawPhone);
  if (clean.length === 10) {
    return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
  }
  return rawPhone || 'No Phone';
}

export function getTelLink(rawPhone?: string | null): string {
  const clean = cleanPhoneNumber(rawPhone);
  if (!clean) return '#';
  return `tel:+91${clean}`;
}

export function getWhatsAppLink(rawPhone?: string | null, customText?: string): string {
  const clean = cleanPhoneNumber(rawPhone);
  if (!clean) return '#';
  const defaultText = encodeURIComponent(
    customText ||
    `Namaskaram, this is Durga from Tejo Bharat Global Energy LLP. We supply premium Tier-1 DCR & Non-DCR Solar Modules (Mono PERC / TOPCon 550W+) directly to solar installers and EPC vendors across Andhra Pradesh with immediate dispatch and dealer margins. Would you like our latest dealer price list?`
  );
  return `https://wa.me/91${clean}?text=${defaultText}`;
}

export function getEmailLink(email?: string | null, vendorName?: string): string {
  if (!email) return '#';
  const subject = encodeURIComponent(`Solar Modules & EPC Partner Supply | Tejo Bharat Global Energy LLP`);
  const body = encodeURIComponent(
    `Dear ${vendorName || 'Partner'},\n\n` +
    `Greetings from Tejo Bharat Global Energy LLP.\n\n` +
    `We are a leading renewable energy provider & distributor specializing in rooftop solar installations, PM Surya Ghar compliant DCR modules, and high-efficiency solar modules.\n\n` +
    `We would love to supply Tier-1 solar modules, inverters, and BOS to your ongoing projects with high dealer margins and rapid logistics.\n\n` +
    `Let us know your current requirements or reach us directly at +91 94797 97947.\n\n` +
    `Warm regards,\n` +
    `Tejo Bharat Global Energy LLP\n` +
    `https://www.tejobharat.com/`
  );
  return `mailto:${email}?subject=${subject}&body=${body}`;
}

export function getStageBadgeClass(stage: PipelineStage): string {
  switch (stage) {
    case 'NEW':
      return 'bg-slate-100 text-slate-700 border-slate-300';
    case 'CONTACTED':
      return 'bg-blue-50 text-blue-700 border-blue-300';
    case 'INTERESTED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-400 font-semibold';
    case 'QUOTE_SENT':
      return 'bg-amber-50 text-amber-800 border-amber-300';
    case 'FOLLOW_UP':
      return 'bg-purple-50 text-purple-700 border-purple-300';
    case 'NEGOTIATION':
      return 'bg-indigo-50 text-indigo-700 border-indigo-300';
    case 'WON':
      return 'bg-emerald-600 text-white border-emerald-700 shadow-sm font-bold';
    case 'LOST':
      return 'bg-rose-50 text-rose-700 border-rose-300';
    case 'DO_NOT_CALL':
      return 'bg-gray-200 text-gray-500 border-gray-400 line-through';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export function getStageLabel(stage: PipelineStage): string {
  switch (stage) {
    case 'NEW': return 'New / Uncalled';
    case 'CONTACTED': return 'Contacted';
    case 'INTERESTED': return 'Interested 🔥';
    case 'QUOTE_SENT': return 'Quote Sent';
    case 'FOLLOW_UP': return 'Follow-up Scheduled';
    case 'NEGOTIATION': return 'Negotiating';
    case 'WON': return 'Deal Won 🎉';
    case 'LOST': return 'Lost / Not Interested';
    case 'DO_NOT_CALL': return 'Do Not Call';
    default: return stage;
  }
}

export function getCallOutcomeBadge(outcome?: CallOutcome | string | null): { label: string; color: string } {
  switch (outcome) {
    case 'ANSWERED':
      return { label: 'Answered', color: 'bg-emerald-100 text-emerald-800' };
    case 'BUSY':
      return { label: 'Line Busy', color: 'bg-amber-100 text-amber-800' };
    case 'NO_ANSWER':
      return { label: 'No Answer / Ringing', color: 'bg-orange-100 text-orange-800' };
    case 'SWITCHED_OFF':
      return { label: 'Switched Off', color: 'bg-rose-100 text-rose-800' };
    case 'CALLBACK_REQUESTED':
      return { label: 'Callback Requested', color: 'bg-indigo-100 text-indigo-800' };
    case 'WRONG_NUMBER':
      return { label: 'Wrong Number', color: 'bg-gray-100 text-gray-600' };
    default:
      return { label: 'Not Called Yet', color: 'bg-slate-100 text-slate-500' };
  }
}

export function getPriorityBadge(priority: Priority): { label: string; badge: string } {
  switch (priority) {
    case 'HOT':
      return { label: 'Hot Lead 🔥', badge: 'bg-rose-100 text-rose-700 border-rose-300 font-bold' };
    case 'WARM':
      return { label: 'Warm ☀️', badge: 'bg-amber-100 text-amber-800 border-amber-300 font-medium' };
    case 'COLD':
      return { label: 'Cold ❄️', badge: 'bg-blue-100 text-blue-800 border-blue-200' };
    default:
      return { label: 'Normal', badge: 'bg-slate-100 text-slate-600 border-slate-200' };
  }
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
}

export function isFollowUpDueToday(followUpDate?: string | null): boolean {
  if (!followUpDate) return false;
  const today = new Date().toISOString().slice(0, 10);
  const target = followUpDate.slice(0, 10);
  return target <= today;
}
