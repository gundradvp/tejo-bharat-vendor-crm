import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  PhoneForwarded, 
  MessageSquare, 
  ChevronRight, 
  ChevronLeft, 
  Copy, 
  Check, 
  Calendar, 
  Zap, 
  User, 
  MapPin, 
  Flame, 
  Sparkles,
  ArrowRight
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
  const [kwReq, setKwReq] = useState<number | undefined>(undefined);
  const [quotedRate, setQuotedRate] = useState<number | undefined>(undefined);
  const [showPitch, setShowPitch] = useState(false);

  const currentVendor = queue[currentIndex];

  if (!currentVendor) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-xl">
            🎉
          </div>
          <h3 className="text-lg font-bold text-slate-900">Calling Queue Completed!</h3>
          <p className="text-xs text-slate-500">
            You have gone through all vendors in the current calling queue. Excellent sales outreach session!
          </p>
          <button
            onClick={onClose}
            className="w-full bg-teal-700 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-teal-600 transition"
          >
            Return to Dashboard
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
        estimatedMonthlyKW: kwReq ? Number(kwReq) : undefined,
        quotedPricePerWatt: quotedRate ? Number(quotedRate) : undefined,
        preferredPanelType: 'DCR Mono PERC 550W'
      }
    });

    // Reset local state for next vendor
    setNoteText('');
    setFollowUpDate('');
    setOutcome('ANSWERED');
    setStage('CONTACTED');
    setPriority('NORMAL');
    setKwReq(undefined);
    setQuotedRate(undefined);

    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(queue.length); // trigger complete
    }
  };

  const handleSkip = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Dialer Header Bar */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <PhoneForwarded className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm text-teal-300 uppercase tracking-wider">
                  Power Calling Session
                </span>
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                  {currentIndex + 1} of {queue.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                District: <b>{currentVendor.district}</b>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowPitch(!showPitch)}
              className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg font-semibold flex items-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{showPitch ? 'Hide Pitch' : 'Show Pitch'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1">
          <div
            className="bg-emerald-500 h-1 transition-all duration-300"
            style={{ width: `${Math.round(((currentIndex + 1) / queue.length) * 100)}%` }}
          />
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          
          {/* Pitch Quick View if toggled */}
          {showPitch && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-900 space-y-1.5">
              <span className="font-bold uppercase text-[10px] tracking-wider text-amber-700">Quick Telugu Pitch:</span>
              <p className="text-xs leading-relaxed">
                "నమస్కారం సార్! నా పేరు దుర్గ, తేజో భారత్ గ్లోబల్ ఎనర్జీ నుండి మాట్లాడుతున్నాను. మీ సోలార్ ఇన్స్టాలేషన్స్ కోసం Tier-1 DCR & Non-DCR Mono PERC/TOPCon 550W+ ప్యానెల్స్ హోల్‌సేల్ డీలర్ ప్రైస్‌కే రెడీ స్టాక్ ఇస్తున్నాము. మీ కరెంట్ రిక్వైర్మెంట్ ఏమైనా ఉందా సార్?"
              </p>
            </div>
          )}

          {/* Current Vendor Identity Card */}
          <div className="bg-gradient-to-br from-teal-50/80 via-slate-50 to-white border border-teal-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  {currentVendor.vendorName}
                </h2>
                <div className="flex items-center space-x-2 text-slate-600 font-semibold mt-0.5">
                  <User className="w-3.5 h-3.5 text-teal-600" />
                  <span>{currentVendor.contactPersonName || 'No Contact Person'}</span>
                  <span>•</span>
                  <span className="text-teal-700 font-bold">{currentVendor.district}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <span className="bg-white border border-teal-200 px-2.5 py-1 rounded-lg text-teal-800 font-bold flex items-center space-x-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{currentVendor.nationwiseInstallationAndCapacity?.installedCapacity ?? 0} kW Base</span>
                </span>
              </div>
            </div>

            {currentVendor.address && (
              <p className="text-[11px] text-slate-500 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{currentVendor.address}</span>
              </p>
            )}

            {/* CALL BUTTONS */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              
              {/* Click to Call */}
              <a
                href={telLink}
                className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm sm:text-base px-5 py-2.5 rounded-xl shadow-md transition transform active:scale-95"
              >
                <Phone className="w-4 h-4 fill-white animate-bounce" />
                <span>Call {formatPhoneDisplay(currentVendor.contactPersonMobile)}</span>
              </a>

              <button
                onClick={handleCopyPhone}
                className="p-2.5 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 text-slate-600"
                title="Copy phone"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>

              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1.5 bg-green-600 hover:bg-green-500 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                <span>WhatsApp Pitch</span>
              </a>

            </div>
          </div>

          {/* Quick Call Logging Form */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            
            {/* Outcome Selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Call Outcome:</label>
              <div className="flex flex-wrap gap-1.5">
                {(['ANSWERED', 'BUSY', 'NO_ANSWER', 'SWITCHED_OFF', 'CALLBACK_REQUESTED', 'WRONG_NUMBER'] as CallOutcome[]).map((oc) => (
                  <button
                    key={oc}
                    type="button"
                    onClick={() => {
                      setOutcome(oc);
                      if (oc === 'ANSWERED') setStage('CONTACTED');
                      if (oc === 'BUSY' || oc === 'CALLBACK_REQUESTED') setStage('FOLLOW_UP');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                      outcome === oc
                        ? 'bg-teal-700 text-white border-teal-800 font-bold shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {getCallOutcomeBadge(oc).label}
                  </button>
                ))}
              </div>
            </div>

            {/* Stage & Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Set Stage:</label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value as PipelineStage)}
                  className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2"
                >
                  <option value="CONTACTED">Contacted</option>
                  <option value="INTERESTED">Interested in Panels 🔥</option>
                  <option value="QUOTE_SENT">Price / Quote Sent</option>
                  <option value="FOLLOW_UP">Follow-up</option>
                  <option value="WON">Deal Won 🎉</option>
                  <option value="LOST">Not Interested / Lost</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Priority:</label>
                <div className="flex gap-1">
                  {(['NORMAL', 'WARM', 'HOT'] as Priority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg border transition ${
                        priority === p
                          ? p === 'HOT'
                            ? 'bg-rose-600 text-white border-rose-700'
                            : p === 'WARM'
                            ? 'bg-amber-500 text-white border-amber-600'
                            : 'bg-slate-800 text-white'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      {p === 'HOT' ? '🔥 Hot' : p === 'WARM' ? '☀️ Warm' : 'Normal'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Note Presets */}
            <div>
              <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Quick Note:</span>
              <div className="flex flex-wrap gap-1">
                {FREQUENT_SOLAR_NOTES.slice(0, 4).map((note, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setNoteText(prev => prev ? `${prev}. ${note}` : note)}
                    className="text-[10px] bg-white border border-slate-200 hover:border-teal-400 px-2 py-0.5 rounded text-slate-600"
                  >
                    + {note}
                  </button>
                ))}
              </div>
            </div>

            {/* Note text & Follow-up date */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <textarea
                  rows={2}
                  placeholder="Notes from the call..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Follow-up Date:</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>

          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-xs text-slate-500 hover:text-slate-800 font-semibold px-3 py-2"
          >
            Skip for now ⏩
          </button>

          <button
            onClick={handleSaveAndNext}
            className="flex items-center space-x-2 bg-teal-700 hover:bg-teal-600 text-white font-extrabold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md transition transform active:scale-95"
          >
            <span>Save & Next Lead</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
