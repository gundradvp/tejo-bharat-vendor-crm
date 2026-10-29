import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  PhoneForwarded, 
  MessageSquare, 
  Copy, 
  Check, 
  Calendar, 
  Zap, 
  User, 
  MapPin, 
  Sparkles,
  ArrowRight,
  ChevronRight,
  Mail,
  Globe,
  Tag,
  Star
} from 'lucide-react';
import { Vendor, PipelineStage, Priority, CallOutcome } from '../types/vendor';
import { 
  formatPhoneDisplay, 
  getTelLink, 
  getWhatsAppLink, 
  getCallOutcomeBadge 
} from '../utils/formatters';
import { FREQUENT_SOLAR_NOTES, SOLAR_PITCH_SCRIPTS } from '../utils/solarPitch';

interface PowerDialerModalProps {
  queue: Vendor[];
  onClose: () => void;
  onAddNoteAndAdvance: (
    vendorKey: string,
    noteData: {
      content: string;
      callOutcome?: CallOutcome | string;
      nextFollowUpDate?: string | null;
      stageChange?: PipelineStage;
      priorityChange?: Priority;
      solarRequirement?: Vendor['solarRequirement'];
    }
  ) => void;
}

export const PowerDialerModal: React.FC<PowerDialerModalProps> = ({
  queue,
  onClose,
  onAddNoteAndAdvance
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [outcome, setOutcome] = useState<CallOutcome>('ANSWERED');
  const [noteText, setNoteText] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [stage, setStage] = useState<PipelineStage>('CONTACTED');
  const [priority, setPriority] = useState<Priority>('NORMAL');
  const [showPitch, setShowPitch] = useState(false);

  const currentVendor = queue[currentIndex];

  if (!currentVendor) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-3xl">
            🎉
          </div>
          <h3 className="text-xl font-black text-slate-900">Calling Queue Done!</h3>
          <p className="text-xs text-slate-500">
            You called all leads in the current calling queue.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-teal-700 text-white font-extrabold py-3 rounded-2xl text-xs"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const telLink = getTelLink(currentVendor.contactPersonMobile);
  const waLink = getWhatsAppLink(currentVendor.contactPersonMobile);

  const handleCopyPhone = () => {
    if (currentVendor.contactPersonMobile) {
      navigator.clipboard.writeText(currentVendor.contactPersonMobile);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveAndNext = () => {
    onAddNoteAndAdvance(currentVendor.uniqueKey, {
      content: noteText.trim() || `Called via Power Dialer: ${outcome}`,
      callOutcome: outcome,
      nextFollowUpDate: followUpDate || null,
      stageChange: stage,
      priorityChange: priority,
      solarRequirement: {
        preferredPanelType: 'DCR Mono PERC 550W'
      }
    });

    setNoteText('');
    setFollowUpDate('');
    setOutcome('ANSWERED');
    setStage('CONTACTED');
    setPriority('NORMAL');

    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(queue.length);
    }
  };

  const handleSkip = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex flex-col justify-end sm:justify-center items-center sm:p-4 animate-fadeIn">
      
      {/* Mobile Full Screen / Desktop Modal */}
      <div className="bg-white w-full sm:max-w-2xl h-[94vh] sm:h-auto sm:max-h-[92vh] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-slideUp">
        
        {/* Mobile Top Header */}
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-lg">
              Lead {currentIndex + 1} of {queue.length}
            </span>
            <span className="text-xs text-teal-300 font-bold">
              {currentVendor.district}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowPitch(!showPitch)}
              className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-xl font-bold flex items-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{showPitch ? 'Hide Pitch' : 'Pitch'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 h-1 shrink-0">
          <div
            className="bg-emerald-500 h-1 transition-all duration-300"
            style={{ width: `${Math.round(((currentIndex + 1) / queue.length) * 100)}%` }}
          />
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3.5 text-xs">
          
          {/* Quick Pitch Banner if open */}
          {showPitch && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-amber-900 text-xs leading-relaxed">
              <b>Telugu Pitch:</b> "నమస్కారం సార్! నా పేరు దుర్గ, తేజో భారత్ గ్లోబల్ ఎనర్జీ నుండి మాట్లాడుతున్నాను. మీ సోలార్ ఇన్స్టాలేషన్స్ కోసం Tier-1 DCR & Non-DCR Mono PERC/TOPCon 550W+ ప్యానెల్స్ హోల్‌సేల్ డీలర్ ప్రైస్‌కే రెడీ స్టాక్ ఇస్తున్నాము. మీ కరెంట్ రిక్వైర్మెంట్ ఏమైనా ఉందా సార్?"
            </div>
          )}

          {/* Current Vendor Identity Card */}
          <div className="bg-gradient-to-br from-teal-50 via-slate-50 to-white border border-teal-200 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                  {currentVendor.vendorName}
                </h2>
                <div className="text-xs text-slate-600 font-bold flex items-center space-x-1 mt-0.5">
                  <User className="w-3.5 h-3.5 text-teal-700" />
                  <span>{currentVendor.contactPersonName || 'No Contact Listed'}</span>
                </div>
              </div>

              <span className="bg-white border border-teal-200 px-2 py-0.5 rounded-lg text-teal-800 font-black text-[11px] shrink-0">
                ⚡ {currentVendor.nationwiseInstallationAndCapacity?.installedCapacity ?? 0} kW Base
              </span>
            </div>

            {/* Full Address */}
            {currentVendor.address ? (
              <div className="flex items-start space-x-1.5 text-xs text-slate-700 bg-white/80 p-2 rounded-xl border border-teal-100">
                <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Address:</span>
                  <p className="leading-relaxed font-medium">{currentVendor.address}</p>
                </div>
              </div>
            ) : null}

            {/* Other Details Row */}
            <div className="flex flex-wrap items-center gap-2 text-xs pt-0.5">
              {currentVendor.contactPersonEmail && (
                <a
                  href={`mailto:${currentVendor.contactPersonEmail}`}
                  className="inline-flex items-center space-x-1 text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md text-[11px] font-semibold border border-teal-200"
                >
                  <Mail className="w-3 h-3 text-teal-600" />
                  <span className="truncate max-w-[160px]">{currentVendor.contactPersonEmail}</span>
                </a>
              )}

              {currentVendor.websiteUrl && (
                <a
                  href={currentVendor.websiteUrl.startsWith('http') ? currentVendor.websiteUrl : `https://${currentVendor.websiteUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md text-[11px] font-semibold border border-blue-200"
                >
                  <Globe className="w-3 h-3 text-blue-500" />
                  <span className="truncate max-w-[130px]">{currentVendor.websiteUrl.replace(/^https?:\/\//, '')}</span>
                </a>
              )}

              {currentVendor.rating ? (
                <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  <span>{currentVendor.rating} ★ ({currentVendor.consumerRatingCount || 0})</span>
                </span>
              ) : null}

              {currentVendor.vendorBrandsList && currentVendor.vendorBrandsList.length > 0 && (
                <div className="flex flex-wrap items-center gap-1">
                  {currentVendor.vendorBrandsList.slice(0, 3).map((b, idx) => (
                    <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-1.5 py-0.2 rounded border border-slate-200">
                      {b.brandName}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* CALL ACTION BUTTONS (HUGE THUMB TARGETS) */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href={telLink}
                className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 active:scale-95 text-white font-black py-3 rounded-2xl shadow-lg shadow-emerald-700/25 transition"
              >
                <Phone className="w-4 h-4 fill-white animate-bounce" />
                <span className="text-sm font-mono tracking-tight">
                  Call {formatPhoneDisplay(currentVendor.contactPersonMobile)}
                </span>
              </a>

              <button
                onClick={handleCopyPhone}
                className="w-12 h-12 flex items-center justify-center bg-white border border-slate-300 rounded-2xl text-slate-600 active:scale-95 transition shrink-0"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
              </button>

              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 flex items-center justify-center bg-green-600 text-white rounded-2xl shadow-sm active:scale-95 transition shrink-0"
              >
                <MessageSquare className="w-5 h-5 fill-white" />
              </a>
            </div>
          </div>

          {/* Quick Outcome Logger */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1.5">Call Outcome:</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['ANSWERED', 'BUSY', 'NO_ANSWER', 'SWITCHED_OFF', 'CALLBACK_REQUESTED', 'WRONG_NUMBER'] as CallOutcome[]).map((oc) => (
                  <button
                    key={oc}
                    type="button"
                    onClick={() => {
                      setOutcome(oc);
                      if (oc === 'ANSWERED') setStage('CONTACTED');
                      if (oc === 'BUSY' || oc === 'CALLBACK_REQUESTED') setStage('FOLLOW_UP');
                    }}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition ${
                      outcome === oc
                        ? 'bg-teal-700 text-white border-teal-800 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    {getCallOutcomeBadge(oc).label}
                  </button>
                ))}
              </div>
            </div>

            {/* Stage & Priority */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Set Stage:</label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value as PipelineStage)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold"
                >
                  <option value="CONTACTED">Contacted</option>
                  <option value="INTERESTED">Interested 🔥</option>
                  <option value="QUOTE_SENT">Quote Sent</option>
                  <option value="FOLLOW_UP">Follow-up</option>
                  <option value="WON">Deal Won 🎉</option>
                  <option value="LOST">Lost</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Priority:</label>
                <div className="flex gap-1">
                  {(['NORMAL', 'WARM', 'HOT'] as Priority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border ${
                        priority === p
                          ? p === 'HOT' ? 'bg-rose-600 text-white' : p === 'WARM' ? 'bg-amber-500 text-white' : 'bg-slate-800 text-white'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      {p === 'HOT' ? '🔥' : p === 'WARM' ? '☀️' : 'Normal'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick note presets */}
            <div>
              <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Quick Note:</span>
              <div className="flex flex-wrap gap-1">
                {FREQUENT_SOLAR_NOTES.slice(0, 4).map((note, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setNoteText(prev => prev ? `${prev}. ${note}` : note)}
                    className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded-lg text-slate-600"
                  >
                    + {note}
                  </button>
                ))}
              </div>
            </div>

            {/* Note text + Follow-up date */}
            <div className="space-y-2">
              <textarea
                rows={2}
                placeholder="Call notes..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />

              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Follow-up:</span>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl p-1 text-xs"
                />
              </div>
            </div>

          </div>

        </div>

        {/* STICKY BOTTOM ACTION (HUGE THUMB BUTTON) */}
        <div className="bg-slate-100 p-3 sm:p-4 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0 pb-safe-modal">
          <button
            onClick={handleSkip}
            className="text-xs text-slate-500 font-bold px-3 py-2.5"
          >
            Skip ⏩
          </button>

          <button
            onClick={handleSaveAndNext}
            className="flex-1 flex items-center justify-center space-x-2 bg-teal-700 active:bg-teal-800 text-white font-black text-sm py-3.5 rounded-2xl shadow-lg transition active:scale-95"
          >
            <span>Save & Next Lead</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
