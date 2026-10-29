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

  // Filter vendors with follow-up date
  const vendorsWithFollowUp = vendors.filter(v => Boolean(v.nextFollowUpDate));

  const overdue = vendorsWithFollowUp.filter(v => v.nextFollowUpDate! < today);
  const dueToday = vendorsWithFollowUp.filter(v => v.nextFollowUpDate! === today);
  const upcoming = vendorsWithFollowUp.filter(v => v.nextFollowUpDate! > today);

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-teal-500/10 to-transparent p-4 rounded-2xl border border-amber-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
            <CalendarClock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">Follow-up Call Center</h2>
            <p className="text-xs text-slate-500">
              Vendors who requested callbacks, quotations, or scheduled sales discussions
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-bold">
          <span className="px-3 py-1 rounded-lg bg-rose-100 text-rose-800 border border-rose-200">
            {overdue.length} Overdue
          </span>
          <span className="px-3 py-1 rounded-lg bg-amber-100 text-amber-800 border border-amber-200">
            {dueToday.length} Due Today
          </span>
        </div>
      </div>

      {/* OVERDUE SECTION */}
      {overdue.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-xs font-extrabold uppercase text-rose-700 tracking-wider">
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
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-xs font-extrabold uppercase text-amber-800 tracking-wider">
          <Clock className="w-4 h-4 text-amber-600" />
          <span>Scheduled for Today ({dueToday.length})</span>
        </div>

        {dueToday.length === 0 ? (
          <div className="bg-white rounded-xl p-6 border border-slate-200 text-center text-xs text-slate-400">
            No scheduled follow-ups due today. Check the table view to call new leads!
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
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-xs font-extrabold uppercase text-teal-800 tracking-wider">
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
    <div className={`bg-white rounded-2xl p-4 border shadow-sm space-y-3 text-xs transition hover:shadow-md ${
      isOverdue ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'
    }`}>
      <div className="flex items-start justify-between">
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
            <span className="font-semibold text-teal-700">{vendor.district}</span>
          </div>
        </div>

        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
          isOverdue ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
        }`}>
          {vendor.nextFollowUpDate}
        </span>
      </div>

      {latestNote && (
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-700 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Previous Note:</span>
          <p className="line-clamp-2 italic">"{latestNote.content}"</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
        <a
          href={telLink}
          onClick={() => onQuickCall(vendor)}
          className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs"
        >
          <Phone className="w-3.5 h-3.5 fill-white" />
          <span>Call {formatPhoneDisplay(vendor.contactPersonMobile)}</span>
        </a>

        <div className="flex items-center space-x-1.5">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100"
            title="WhatsApp Pitch"
          >
            <MessageSquare className="w-4 h-4 fill-green-600 text-green-600" />
          </a>

          <button
            onClick={() => onSelectVendor(vendor)}
            className="p-1.5 bg-slate-100 text-slate-700 hover:bg-teal-700 hover:text-white rounded-lg transition"
            title="Open Notes"
          >
            <FileText className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
