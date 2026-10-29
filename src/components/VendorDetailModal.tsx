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

  // Solar requirements state
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
    if (noteContent) {
      setNoteContent(prev => prev + '\n' + preset);
    } else {
      setNoteContent(preset);
    }
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex justify-center items-center p-2 sm:p-4 animate-fadeIn">
      <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-4 sm:p-5 flex items-start justify-between border-b border-teal-800/40">
          <div className="space-y-1 pr-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-800/80 text-teal-200 font-semibold border border-teal-700">
                {vendor.district} District
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full border ${getStageBadgeClass(targetStage)}`}>
                {getStageLabel(targetStage)}
              </span>
              {vendor.priority === 'HOT' && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold flex items-center space-x-1">
                  <Flame className="w-3 h-3" />
                  <span>HOT LEAD</span>
                </span>
              )}
            </div>
            
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
              {vendor.vendorName}
            </h2>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-teal-200/90 pt-1">
              <span className="flex items-center space-x-1">
                <User className="w-3.5 h-3.5 text-solar-400" />
                <span className="font-semibold text-white">{vendor.contactPersonName || 'Contact Person Not Listed'}</span>
              </span>
              {vendor.address && (
                <span className="flex items-center space-x-1 truncate max-w-xs sm:max-w-md">
                  <MapPin className="w-3.5 h-3.5 text-solar-400 shrink-0" />
                  <span className="truncate">{vendor.address}</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {hasPrev && (
              <button 
                onClick={onPrevVendor}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs"
                title="Previous Vendor"
              >
                ◀ Prev
              </button>
            )}
            {hasNext && (
              <button 
                onClick={onNextVendor}
                className="p-1.5 bg-teal-800 hover:bg-teal-700 text-teal-200 hover:text-white rounded-lg text-xs"
                title="Next Vendor"
              >
                Next ▶
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-1.5 bg-slate-800 hover:bg-rose-900 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Call Bar (Hero Section) */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border-b border-teal-100 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Direct Call Button (The Core Feature!) */}
            <div className="flex items-center space-x-3">
              <a
                href={telLink}
                onClick={() => {
                  setSelectedOutcome('ANSWERED');
                  if (targetStage === 'NEW') setTargetStage('CONTACTED');
                }}
                className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-base sm:text-lg px-5 py-3 rounded-xl shadow-lg shadow-emerald-700/25 transition transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                  <Phone className="w-4 h-4 fill-white" />
                </div>
                <span>Call {formatPhoneDisplay(vendor.contactPersonMobile)}</span>
              </a>

              <button
                onClick={handleCopyPhone}
                className="p-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-xl transition shadow-sm"
                title="Copy phone number"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            {/* WhatsApp & Email Quick Links */}
            <div className="flex items-center space-x-2">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1.5 bg-green-600 hover:bg-green-500 text-white text-xs sm:text-sm font-bold px-3.5 py-3 rounded-xl shadow-sm transition"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                <span>WhatsApp Pitch</span>
              </a>

              {vendor.contactPersonEmail && (
                <a
                  href={mailLink}
                  className="flex items-center space-x-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs sm:text-sm font-semibold px-3 py-3 rounded-xl shadow-sm transition"
                >
                  <Mail className="w-4 h-4" />
                  <span className="hidden sm:inline">Email</span>
                </a>
              )}
            </div>

          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 text-xs font-bold px-4">
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-2.5 px-4 border-b-2 flex items-center space-x-1.5 transition ${
              activeTab === 'notes'
                ? 'border-teal-600 text-teal-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4 text-teal-600" />
            <span>Call Notes & Logging ({vendor.notes?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('pitch')}
            className={`py-2.5 px-4 border-b-2 flex items-center space-x-1.5 transition ${
              activeTab === 'pitch'
                ? 'border-amber-500 text-amber-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Sales Pitch & Scripts</span>
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`py-2.5 px-4 border-b-2 flex items-center space-x-1.5 transition ${
              activeTab === 'details'
                ? 'border-teal-600 text-teal-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Zap className="w-4 h-4 text-teal-600" />
            <span>Portal Data & Brands</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* TAB 1: CALL LOGGING & NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              
              {/* Form to log note */}
              <form onSubmit={handleSubmitNote} className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                    <PhoneForwarded className="w-4 h-4 text-teal-600" />
                    <span>Log Call Outcome & Note</span>
                  </h3>
                  <span className="text-xs text-slate-500">Auto-timestamps with Tejo Bharat Sales</span>
                </div>

                {/* Call Outcome Chips */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Call Outcome:</label>
                  <div className="flex flex-wrap gap-1.5">
                    {(['ANSWERED', 'BUSY', 'NO_ANSWER', 'SWITCHED_OFF', 'CALLBACK_REQUESTED', 'WRONG_NUMBER'] as CallOutcome[]).map((outcome) => {
                      const badge = getCallOutcomeBadge(outcome);
                      return (
                        <button
                          key={outcome}
                          type="button"
                          onClick={() => setSelectedOutcome(outcome)}
                          className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition ${
                            selectedOutcome === outcome
                              ? 'bg-teal-700 text-white border-teal-800 shadow-sm font-bold'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {badge.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Pipeline Stage & Priority Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Update Pipeline Stage:</label>
                    <select
                      value={targetStage}
                      onChange={(e) => setTargetStage(e.target.value as PipelineStage)}
                      className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    >
                      <option value="NEW">New Lead / Uncalled</option>
                      <option value="CONTACTED">Contacted</option>
                      <option value="INTERESTED">Interested in Solar Panels 🔥</option>
                      <option value="QUOTE_SENT">Price / Quotation Sent</option>
                      <option value="FOLLOW_UP">Follow-up Scheduled</option>
                      <option value="NEGOTIATION">Negotiation</option>
                      <option value="WON">Deal Won 🎉 (Partnered)</option>
                      <option value="LOST">Not Interested / Lost</option>
                      <option value="DO_NOT_CALL">Do Not Call / Wrong Number</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Lead Priority:</label>
                    <div className="flex gap-1.5">
                      {(['HOT', 'WARM', 'COLD', 'NORMAL'] as Priority[]).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setTargetPriority(p)}
                          className={`flex-1 text-xs py-2 rounded-lg border font-semibold transition ${
                            targetPriority === p
                              ? p === 'HOT'
                                ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                                : p === 'WARM'
                                ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                                : 'bg-slate-800 text-white border-slate-900 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {p === 'HOT' ? '🔥 Hot' : p === 'WARM' ? '☀️ Warm' : p === 'COLD' ? '❄️ Cold' : 'Normal'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Solar Requirement Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Monthly Capacity Req (kW)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 15 kW"
                      value={estimatedKW || ''}
                      onChange={(e) => setEstimatedKW(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Quoted Price (₹ / Wp)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      placeholder="e.g. 21.50"
                      value={quotedRate || ''}
                      onChange={(e) => setQuotedRate(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Panel Type Needed
                    </label>
                    <select
                      value={preferredType}
                      onChange={(e) => setPreferredType(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="DCR Mono PERC 550W">DCR Mono PERC 550W</option>
                      <option value="Non-DCR TOPCon 550W+ Bifacial">Non-DCR TOPCon 550W+</option>
                      <option value="DCR TOPCon 550W">DCR TOPCon 550W</option>
                      <option value="Inverters & BOS Package">Inverters & BOS Package</option>
                      <option value="Complete EPC Kit">Complete EPC Kit</option>
                    </select>
                  </div>
                </div>

                {/* Quick Note Chips */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-600">Quick Note Shortcuts:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {FREQUENT_SOLAR_NOTES.slice(0, 5).map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleQuickNoteClick(preset)}
                        className="text-[11px] bg-white hover:bg-teal-50 text-slate-600 hover:text-teal-700 border border-slate-200 hover:border-teal-300 px-2.5 py-1 rounded-md transition text-left"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Freeform Note Textarea */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Notes & Discussion Details:</label>
                  <textarea
                    rows={3}
                    placeholder="Write detailed call notes, customer reaction, ongoing site requirements, objections, or next steps..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-teal-500 focus:outline-none placeholder-slate-400"
                  />
                </div>

                {/* Next Follow-up Picker and Submit Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="text-xs font-semibold text-slate-600">Next Follow-Up:</span>
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="text-xs bg-white border border-slate-300 rounded-lg p-1.5 focus:ring-1 focus:ring-teal-500"
                    />
                    {followUpDate && (
                      <button
                        type="button"
                        onClick={() => setFollowUpDate('')}
                        className="text-xs text-rose-500 hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition flex items-center justify-center space-x-1.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Save Note & Update Lead</span>
                  </button>
                </div>

              </form>

              {/* Historical Notes Timeline */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Call & Note History ({vendor.notes?.length || 0})
                </h3>

                {(!vendor.notes || vendor.notes.length === 0) ? (
                  <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-slate-400 text-xs">
                    No notes recorded yet. Call this vendor and write the first note above!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {vendor.notes.map((note) => {
                      const outcomeBadge = getCallOutcomeBadge(note.callOutcome);
                      return (
                        <div key={note.id} className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${outcomeBadge.color}`}>
                                {outcomeBadge.label}
                              </span>
                              {note.stageChange && (
                                <span className="text-slate-500 text-[11px]">
                                  Stage: <b>{getStageLabel(note.stageChange)}</b>
                                </span>
                              )}
                            </div>
                            <span className="text-slate-400 text-[11px] flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatDateTime(note.createdAt)}</span>
                            </span>
                          </div>

                          <p className="text-xs text-slate-800 whitespace-pre-wrap font-medium">
                            {note.content}
                          </p>

                          {note.nextFollowUpDate && (
                            <div className="text-[11px] text-amber-700 bg-amber-50 px-2 py-1 rounded-md inline-flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>Follow-up scheduled for: <b>{note.nextFollowUpDate}</b></span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: SOLAR PITCH & SCRIPTS */}
          {activeTab === 'pitch' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start space-x-2">
                <Sparkles className="w-4 h-4 text-solar-500 shrink-0 mt-0.5" />
                <p>
                  <b>Tejo Bharat Sales Pitch Assistant:</b> Read these live while on call with {vendor.vendorName}.
                  Click "Copy" to quickly paste into WhatsApp or notes.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {SOLAR_PITCH_SCRIPTS.map((script) => (
                  <div key={script.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                          script.language === 'Telugu' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {script.language}
                        </span>
                        <span>{script.title}</span>
                      </span>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(script.content);
                          alert('Pitch copied to clipboard!');
                        }}
                        className="text-xs text-teal-700 hover:text-teal-900 flex items-center space-x-1 font-semibold"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </button>
                    </div>

                    <pre className="text-xs font-sans text-slate-700 bg-slate-50 p-3 rounded-lg whitespace-pre-wrap leading-relaxed border border-slate-100">
                      {script.content}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PORTAL DATA & BRANDS */}
          {activeTab === 'details' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Installation Metrics */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <h4 className="font-bold text-slate-800 flex items-center space-x-1.5">
                    <Zap className="w-4 h-4 text-teal-600" />
                    <span>Portal Installation Metrics</span>
                  </h4>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Nationwide Installations:</span>
                      <span className="font-bold text-slate-900">
                        {vendor.nationwiseInstallationAndCapacity?.installationCount ?? 0} sites
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Nationwide Installed Capacity:</span>
                      <span className="font-bold text-teal-700">
                        {vendor.nationwiseInstallationAndCapacity?.installedCapacity ?? 0} kW
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Districtwise Capacity:</span>
                      <span className="font-bold text-slate-900">
                        {vendor.districtwiseInstallationAndCapacity?.installedCapacity ?? 0} kW
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Consumer Rating:</span>
                      <span className="font-bold text-amber-600 flex items-center space-x-1">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>{vendor.rating ? `${vendor.rating} / 5` : 'No ratings'}</span>
                        <span className="text-slate-400 font-normal">({vendor.consumerRatingCount || 0} reviews)</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact & Registration Data */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <h4 className="font-bold text-slate-800 flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    <span>Vendor Registration Data</span>
                  </h4>

                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Portal Vendor ID:</span>
                      <span className="font-mono font-bold text-slate-900">{vendor.vendorId}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Email:</span>
                      <span className="font-medium text-slate-900">{vendor.contactPersonEmail || 'Not Provided'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Website:</span>
                      <span className="font-medium text-teal-700">
                        {vendor.websiteUrl ? (
                          <a href={vendor.websiteUrl.startsWith('http') ? vendor.websiteUrl : `https://${vendor.websiteUrl}`} target="_blank" rel="noreferrer" className="underline">
                            {vendor.websiteUrl}
                          </a>
                        ) : 'None'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">District:</span>
                      <span className="font-bold text-slate-900">{vendor.district}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Brands list */}
              {vendor.vendorBrandsList && vendor.vendorBrandsList.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-slate-800 flex items-center space-x-1.5">
                    <Tag className="w-4 h-4 text-teal-600" />
                    <span>Registered Brands & Tie-ups</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {vendor.vendorBrandsList.map((b, idx) => (
                      <span key={idx} className="bg-white border border-slate-300 px-2.5 py-1 rounded-md text-slate-700 font-medium">
                        {b.brandName}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
