import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  MessageSquare, 
  Mail, 
  Copy, 
  Check, 
  Calendar, 
  Clock, 
  MapPin, 
  Zap, 
  Star, 
  ShieldCheck, 
  ChevronRight,
  Flame,
  PlusCircle,
  FileText,
  User,
  Sparkles,
  PhoneForwarded,
  Tag
} from 'lucide-react';
import { Vendor, PipelineStage, Priority, CallOutcome } from '../types/vendor';
import { 
  formatPhoneDisplay, 
  getTelLink, 
  getWhatsAppLink, 
  getEmailLink, 
  getStageBadgeClass, 
  getStageLabel,
  getCallOutcomeBadge,
  formatDateTime 
} from '../utils/formatters';
import { FREQUENT_SOLAR_NOTES, SOLAR_PITCH_SCRIPTS } from '../utils/solarPitch';

interface VendorDetailModalProps {
  vendor: Vendor | null;
  onClose: () => void;
  onUpdateVendor: (vendorKey: string, updates: Partial<Vendor>) => void;
  onAddNote: (
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
  onNextVendor?: () => void;
  onPrevVendor?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export const VendorDetailModal: React.FC<VendorDetailModalProps> = ({
  vendor,
  onClose,
  onUpdateVendor,
  onAddNote,
  onNextVendor,
  onPrevVendor,
  hasNext,
  hasPrev
}) => {
  if (!vendor) return null;

  const [copied, setCopied] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<CallOutcome>('ANSWERED');
  const [noteContent, setNoteContent] = useState('');
  const [followUpDate, setFollowUpDate] = useState(vendor.nextFollowUpDate || '');
  const [targetStage, setTargetStage] = useState<PipelineStage>(vendor.pipelineStage);
  const [targetPriority, setTargetPriority] = useState<Priority>(vendor.priority);
  const [activeTab, setActiveTab] = useState<'notes' | 'pitch' | 'details'>('notes');

  const [estimatedKW, setEstimatedKW] = useState<number | undefined>(vendor.solarRequirement?.estimatedMonthlyKW);
  const [quotedRate, setQuotedRate] = useState<number | undefined>(vendor.solarRequirement?.quotedPricePerWatt);
  const [preferredType, setPreferredType] = useState<string>(vendor.solarRequirement?.preferredPanelType || 'DCR Mono PERC 550W');

  const handleCopyPhone = () => {
    if (vendor.contactPersonMobile) {
      navigator.clipboard.writeText(vendor.contactPersonMobile);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleQuickNoteClick = (preset: string) => {
    setNoteContent(prev => prev ? `${prev}. ${preset}` : preset);
  };

  const handleSubmitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim() && !selectedOutcome) return;

    onAddNote(vendor.uniqueKey, {
      content: noteContent.trim() || `Logged call: ${selectedOutcome}`,
      callOutcome: selectedOutcome,
      nextFollowUpDate: followUpDate || null,
      stageChange: targetStage,
      priorityChange: targetPriority,
      solarRequirement: {
        estimatedMonthlyKW: estimatedKW ? Number(estimatedKW) : undefined,
        quotedPricePerWatt: quotedRate ? Number(quotedRate) : undefined,
        preferredPanelType: preferredType
      }
    });

    setNoteContent('');
  };

  const telLink = getTelLink(vendor.contactPersonMobile);
  const waLink = getWhatsAppLink(vendor.contactPersonMobile);
  const mailLink = getEmailLink(vendor.contactPersonEmail, vendor.vendorName);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex flex-col justify-end sm:justify-center items-center sm:p-4 animate-fadeIn">
      
      {/* Mobile Bottom Sheet (Sliding from bottom on phone, modal on desktop) */}
      <div className="relative bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] sm:max-h-[90vh] flex flex-col animate-slideUp">
        
        {/* Mobile Drag Pill */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2 sm:hidden shrink-0" />

        {/* Top Header */}
        <div className="bg-slate-900 text-white p-3.5 sm:p-5 flex items-start justify-between border-b border-teal-800/40 shrink-0">
          <div className="space-y-1 pr-3 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-800 text-teal-200 font-bold">
                {vendor.district}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getStageBadgeClass(targetStage)}`}>
                {getStageLabel(targetStage)}
              </span>
              {vendor.priority === 'HOT' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold flex items-center space-x-0.5">
                  <Flame className="w-3 h-3" />
                  <span>HOT LEAD</span>
                </span>
              )}
            </div>
            
            <h2 className="text-base sm:text-xl font-black text-white tracking-tight leading-snug">
              {vendor.vendorName}
            </h2>

            <div className="space-y-1 pt-0.5">
              <div className="text-xs text-teal-200/90 font-medium flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-solar-400 shrink-0" />
                <span className="font-bold text-white">{vendor.contactPersonName || 'No Contact Listed'}</span>
                {vendor.rating ? (
                  <span className="text-amber-400 font-bold ml-1 flex items-center space-x-0.5">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{vendor.rating} ★</span>
                  </span>
                ) : null}
              </div>

              {vendor.address && (
                <div className="text-[11px] text-slate-300 flex items-start space-x-1.5 leading-snug">
                  <MapPin className="w-3.5 h-3.5 text-solar-400 shrink-0 mt-0.5" />
                  <span>{vendor.address}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            {hasPrev && (
              <button 
                onClick={onPrevVendor}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
                title="Prev"
              >
                ◀
              </button>
            )}
            {hasNext && (
              <button 
                onClick={onNextVendor}
                className="p-2 bg-teal-800 hover:bg-teal-700 text-teal-200 rounded-xl text-xs"
                title="Next"
              >
                ▶
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-rose-900 text-slate-400 hover:text-white rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Big Thumb Call Bar */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border-b border-teal-100 p-3 sm:p-4 shrink-0">
          <div className="flex items-center gap-2">
            
            {/* Primary Call Button */}
            <a
              href={telLink}
              onClick={() => {
                setSelectedOutcome('ANSWERED');
                if (targetStage === 'NEW') setTargetStage('CONTACTED');
              }}
              className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 active:scale-95 text-white font-black py-3 rounded-2xl shadow-lg shadow-emerald-700/25 transition"
            >
              <Phone className="w-4 h-4 fill-white animate-bounce" />
              <span className="text-sm font-mono font-bold tracking-tight">
                Call {formatPhoneDisplay(vendor.contactPersonMobile)}
              </span>
            </a>

            {/* Copy phone */}
            <button
              onClick={handleCopyPhone}
              className="w-12 h-12 flex items-center justify-center bg-white border border-slate-300 rounded-2xl text-slate-700 active:scale-95 transition shadow-sm shrink-0"
              title="Copy"
            >
              {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
            </button>

            {/* WhatsApp */}
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 flex items-center justify-center bg-green-600 text-white rounded-2xl shadow-sm active:scale-95 transition shrink-0"
              title="WhatsApp Pitch"
            >
              <MessageSquare className="w-5 h-5 fill-white" />
            </a>

          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-100 text-xs font-bold px-3 shrink-0">
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 py-2.5 border-b-2 flex items-center justify-center space-x-1 transition ${
              activeTab === 'notes' ? 'border-teal-600 text-teal-800 bg-white' : 'border-transparent text-slate-500'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Notes ({vendor.notes?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('pitch')}
            className={`flex-1 py-2.5 border-b-2 flex items-center justify-center space-x-1 transition ${
              activeTab === 'pitch' ? 'border-amber-500 text-amber-900 bg-white' : 'border-transparent text-slate-500'
            }`}
          >
            <Sparkles className="w-4 h-4 text-solar-500" />
            <span>Pitch Script</span>
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-2.5 border-b-2 flex items-center justify-center space-x-1 transition ${
              activeTab === 'details' ? 'border-teal-600 text-teal-800 bg-white' : 'border-transparent text-slate-500'
            }`}
          >
            <Zap className="w-4 h-4 text-teal-600" />
            <span>Data</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4 pb-safe-modal">
          
          {/* TAB 1: CALL LOGGING & NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              
              <form onSubmit={handleSubmitNote} className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center space-x-1">
                    <PhoneForwarded className="w-4 h-4 text-teal-600" />
                    <span>Log Call Outcome:</span>
                  </span>
                </div>

                {/* Outcome Touch Chips */}
                <div className="grid grid-cols-3 gap-1.5">
                  {(['ANSWERED', 'BUSY', 'NO_ANSWER', 'SWITCHED_OFF', 'CALLBACK_REQUESTED', 'WRONG_NUMBER'] as CallOutcome[]).map((outcome) => {
                    const badge = getCallOutcomeBadge(outcome);
                    return (
                      <button
                        key={outcome}
                        type="button"
                        onClick={() => setSelectedOutcome(outcome)}
                        className={`text-xs py-2 px-1 rounded-xl border font-bold text-center transition ${
                          selectedOutcome === outcome
                            ? 'bg-teal-700 text-white border-teal-800 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        {badge.label}
                      </button>
                    );
                  })}
                </div>

                {/* Stage and Priority dropdowns */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Stage:</label>
                    <select
                      value={targetStage}
                      onChange={(e) => setTargetStage(e.target.value as PipelineStage)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold text-xs"
                    >
                      <option value="NEW">New</option>
                      <option value="CONTACTED">Contacted</option>
                      <option value="INTERESTED">Interested 🔥</option>
                      <option value="QUOTE_SENT">Quote Sent</option>
                      <option value="FOLLOW_UP">Follow-up</option>
                      <option value="NEGOTIATION">Negotiation</option>
                      <option value="WON">Deal Won 🎉</option>
                      <option value="LOST">Lost</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Priority:</label>
                    <div className="flex gap-1">
                      {(['NORMAL', 'WARM', 'HOT'] as Priority[]).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setTargetPriority(p)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border ${
                            targetPriority === p
                              ? p === 'HOT' ? 'bg-rose-600 text-white border-rose-700' : p === 'WARM' ? 'bg-amber-500 text-white border-amber-600' : 'bg-slate-800 text-white'
                              : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          {p === 'HOT' ? '🔥' : p === 'WARM' ? '☀️' : 'Normal'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick note shortcuts */}
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Quick Note:</span>
                  <div className="flex flex-wrap gap-1">
                    {FREQUENT_SOLAR_NOTES.slice(0, 4).map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleQuickNoteClick(preset)}
                        className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded-lg text-slate-600 active:bg-teal-50"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Textarea */}
                <div>
                  <textarea
                    rows={2}
                    placeholder="Type notes from the conversation..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Follow-up date & Save Button */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center space-x-1 text-xs">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="bg-white border border-slate-300 rounded-xl p-1.5 text-xs font-semibold"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-teal-700 active:bg-teal-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition flex items-center space-x-1"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Save Note</span>
                  </button>
                </div>

              </form>

              {/* History list */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                  Notes History ({vendor.notes?.length || 0})
                </span>

                {(!vendor.notes || vendor.notes.length === 0) ? (
                  <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-50 rounded-xl">
                    No previous notes logged.
                  </p>
                ) : (
                  vendor.notes.map(note => {
                    const outcomeBadge = getCallOutcomeBadge(note.callOutcome);
                    return (
                      <div key={note.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className={`px-1.5 py-0.2 rounded font-bold ${outcomeBadge.color}`}>
                            {outcomeBadge.label}
                          </span>
                          <span className="text-slate-400">{formatDateTime(note.createdAt)}</span>
                        </div>
                        <p className="text-slate-800 font-medium whitespace-pre-wrap">{note.content}</p>
                        {note.nextFollowUpDate && (
                          <span className="text-[10px] text-amber-800 font-bold bg-amber-50 px-1.5 py-0.5 rounded inline-block">
                            Reminder: {note.nextFollowUpDate}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          )}

          {/* TAB 2: PITCH SCRIPT */}
          {activeTab === 'pitch' && (
            <div className="space-y-3">
              {SOLAR_PITCH_SCRIPTS.map(script => (
                <div key={script.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{script.title}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(script.content);
                        alert('Copied pitch!');
                      }}
                      className="text-teal-700 font-bold flex items-center space-x-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="font-sans text-slate-700 whitespace-pre-wrap bg-white p-2.5 rounded-lg border border-slate-100 text-xs leading-relaxed">
                    {script.content}
                  </pre>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: PORTAL DETAILS */}
          {activeTab === 'details' && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Vendor ID:</span>
                <span className="font-bold text-slate-900">{vendor.vendorId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Tracked Installations:</span>
                <span className="font-bold text-slate-900">
                  {vendor.nationwiseInstallationAndCapacity?.installationCount ?? 0} sites
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Installed Capacity:</span>
                <span className="font-bold text-teal-800">
                  {vendor.nationwiseInstallationAndCapacity?.installedCapacity ?? 0} kW
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Email:</span>
                <span className="font-bold text-slate-900 truncate max-w-[180px]">
                  {vendor.contactPersonEmail || 'None'}
                </span>
              </div>
              <div className="py-1">
                <span className="text-slate-500 block mb-0.5">Address:</span>
                <span className="font-medium text-slate-800">{vendor.address || 'None'}</span>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
