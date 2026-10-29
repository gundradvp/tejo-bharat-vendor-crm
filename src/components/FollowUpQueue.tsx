import React from 'react';
import { 
  CalendarClock, 
  Phone, 
  MessageSquare, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  User,
  Zap
} from 'lucide-react';
import { Vendor, PipelineStage } from '../types/vendor';
import { 
  formatPhoneDisplay, 
  getTelLink, 
  getWhatsAppLink, 
  getStageBadgeClass, 
  getStageLabel,
  formatDate,
  isFollowUpDueToday 
} from '../utils/formatters';

interface FollowUpQueueProps {
  vendors: Vendor[];
  onSelectVendor: (vendor: Vendor) => void;
  onQuickCall: (vendor: Vendor) => void;
}

export const FollowUpQueue: React.FC<FollowUpQueueProps> = ({
  vendors,
  onSelectVendor,
  onQuickCall
}) => {
  const today = new Date().toISOString().slice(0, 10);

  const vendorsWithFollowUp = vendors.filter(v => Boolean(v.nextFollowUpDate));
  const overdue = vendorsWithFollowUp.filter(v => v.nextFollowUpDate! < today);
  const dueToday = vendorsWithFollowUp.filter(v => v.nextFollowUpDate! === today);
  const upcoming = vendorsWithFollowUp.filter(v => v.nextFollowUpDate! > today);

  return (
    <div className="space-y-4 pb-safe">
      
      {/* Mobile-Friendly Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-teal-500/10 to-transparent p-3.5 sm:p-4 rounded-2xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
            <CalendarClock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-900">Follow-up Call Center</h2>
            <p className="text-[11px] text-slate-500">
              Scheduled callbacks & pending quotation discussions
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-bold pt-1 sm:pt-0">
          <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 border border-rose-200">
            {overdue.length} Overdue
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 border border-amber-200">
            {dueToday.length} Due Today
          </span>
        </div>
      </div>

      {/* OVERDUE SECTION */}
      {overdue.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center space-x-1.5 text-xs font-extrabold uppercase text-rose-700 tracking-wider">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Overdue Follow-ups ({overdue.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {overdue.map(v => (
              <FollowUpCard 
                key={v.uniqueKey} 
                vendor={v} 
                isOverdue={true} 
                onSelectVendor={onSelectVendor} 
                onQuickCall={onQuickCall} 
              />
            ))}
          </div>
        </div>
      )}

      {/* DUE TODAY SECTION */}
      <div className="space-y-2.5">
        <div className="flex items-center space-x-1.5 text-xs font-extrabold uppercase text-amber-800 tracking-wider">
          <Clock className="w-4 h-4 text-amber-600" />
          <span>Scheduled for Today ({dueToday.length})</span>
        </div>

        {dueToday.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center text-xs text-slate-400">
            No scheduled follow-ups due today. Call leads from the Leads tab!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {dueToday.map(v => (
              <FollowUpCard 
                key={v.uniqueKey} 
                vendor={v} 
                isOverdue={false} 
                onSelectVendor={onSelectVendor} 
                onQuickCall={onQuickCall} 
              />
            ))}
          </div>
        )}
      </div>

      {/* UPCOMING SECTION */}
      {upcoming.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center space-x-1.5 text-xs font-extrabold uppercase text-teal-800 tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            <span>Upcoming Scheduled Calls ({upcoming.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcoming.map(v => (
              <FollowUpCard 
                key={v.uniqueKey} 
                vendor={v} 
                isOverdue={false} 
                onSelectVendor={onSelectVendor} 
                onQuickCall={onQuickCall} 
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

const FollowUpCard: React.FC<{
  vendor: Vendor;
  isOverdue: boolean;
  onSelectVendor: (v: Vendor) => void;
  onQuickCall: (v: Vendor) => void;
}> = ({ vendor, isOverdue, onSelectVendor, onQuickCall }) => {
  const telLink = getTelLink(vendor.contactPersonMobile);
  const waLink = getWhatsAppLink(vendor.contactPersonMobile);
  const latestNote = vendor.notes && vendor.notes.length > 0 ? vendor.notes[0] : null;

  return (
    <div className={`bg-white rounded-2xl p-3.5 sm:p-4 border shadow-sm space-y-3 text-xs transition ${
      isOverdue ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'
    }`}>
      <div className="flex items-start justify-between gap-1">
        <div>
          <button
            onClick={() => onSelectVendor(vendor)}
            className="font-bold text-slate-900 hover:text-teal-700 text-sm text-left line-clamp-1"
          >
            {vendor.vendorName}
          </button>
          <div className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
            <User className="w-3 h-3 text-slate-400" />
            <span>{vendor.contactPersonName || 'No contact'}</span>
            <span>•</span>
            <span className="font-bold text-teal-700">{vendor.district}</span>
          </div>
        </div>

        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
          isOverdue ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
        }`}>
          {vendor.nextFollowUpDate}
        </span>
      </div>

      {latestNote && (
        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-[11px] text-slate-700 space-y-0.5">
          <p className="line-clamp-2 italic">"{latestNote.content}"</p>
        </div>
      )}

      {/* Thumb Call Bar */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
        <a
          href={telLink}
          onClick={() => onQuickCall(vendor)}
          className="flex-1 flex items-center justify-center space-x-1.5 bg-emerald-600 active:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs active:scale-95 transition"
        >
          <Phone className="w-3.5 h-3.5 fill-white" />
          <span>Call {formatPhoneDisplay(vendor.contactPersonMobile)}</span>
        </a>

        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 flex items-center justify-center bg-green-50 text-green-700 border border-green-200 rounded-xl hover:bg-green-100 shrink-0"
        >
          <MessageSquare className="w-4 h-4 fill-green-600 text-green-600" />
        </a>

        <button
          onClick={() => onSelectVendor(vendor)}
          className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-700 rounded-xl hover:bg-teal-700 hover:text-white transition shrink-0"
        >
          <FileText className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
