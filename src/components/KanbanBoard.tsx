import React from 'react';
import { 
  Phone, 
  MessageSquare, 
  FileText, 
  Flame, 
  Zap, 
  ArrowRight, 
  ArrowLeft,
  Calendar,
  User,
  Plus
} from 'lucide-react';
import { Vendor, PipelineStage } from '../types/vendor';
import { 
  formatPhoneDisplay, 
  getTelLink, 
  getWhatsAppLink, 
  getStageBadgeClass, 
  getStageLabel,
  getCallOutcomeBadge 
} from '../utils/formatters';

interface KanbanBoardProps {
  vendors: Vendor[];
  selectedDistrict: string;
  onSelectVendor: (vendor: Vendor) => void;
  onUpdateStage: (vendorKey: string, newStage: PipelineStage) => void;
}

const STAGES: { key: PipelineStage; title: string; color: string; border: string }[] = [
  { key: 'NEW', title: 'New Leads', color: 'bg-slate-100 text-slate-800', border: 'border-slate-300' },
  { key: 'CONTACTED', title: 'Contacted', color: 'bg-blue-100 text-blue-900', border: 'border-blue-300' },
  { key: 'INTERESTED', title: 'Interested 🔥', color: 'bg-emerald-100 text-emerald-900', border: 'border-emerald-400' },
  { key: 'QUOTE_SENT', title: 'Quote Sent', color: 'bg-amber-100 text-amber-900', border: 'border-amber-400' },
  { key: 'FOLLOW_UP', title: 'Follow-up', color: 'bg-purple-100 text-purple-900', border: 'border-purple-300' },
  { key: 'NEGOTIATION', title: 'Negotiation', color: 'bg-indigo-100 text-indigo-900', border: 'border-indigo-300' },
  { key: 'WON', title: 'Deals Won 🎉', color: 'bg-emerald-600 text-white', border: 'border-emerald-700' },
  { key: 'LOST', title: 'Lost / Closed', color: 'bg-rose-100 text-rose-900', border: 'border-rose-300' }
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  vendors,
  selectedDistrict,
  onSelectVendor,
  onUpdateStage
}) => {
  const filtered = selectedDistrict === 'all'
    ? vendors
    : vendors.filter(v => v.district.toLowerCase() === selectedDistrict.toLowerCase());

  const getNextStage = (current: PipelineStage): PipelineStage | null => {
    const order: PipelineStage[] = ['NEW', 'CONTACTED', 'INTERESTED', 'QUOTE_SENT', 'FOLLOW_UP', 'NEGOTIATION', 'WON'];
    const idx = order.indexOf(current);
    if (idx >= 0 && idx < order.length - 1) return order[idx + 1];
    return null;
  };

  const getPrevStage = (current: PipelineStage): PipelineStage | null => {
    const order: PipelineStage[] = ['NEW', 'CONTACTED', 'INTERESTED', 'QUOTE_SENT', 'FOLLOW_UP', 'NEGOTIATION', 'WON'];
    const idx = order.indexOf(current);
    if (idx > 0) return order[idx - 1];
    return null;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Drag or click arrows to move vendors across sales stages. Click phone numbers to call directly.</span>
        <span>Showing pipeline for <b>{selectedDistrict === 'all' ? 'All Districts' : selectedDistrict}</b></span>
      </div>

      <div className="flex space-x-3 overflow-x-auto pb-6 pt-1 items-start min-h-[70vh]">
        {STAGES.map(stage => {
          const stageVendors = filtered.filter(v => v.pipelineStage === stage.key);

          return (
            <div 
              key={stage.key} 
              className="w-72 shrink-0 bg-slate-100/90 rounded-2xl border border-slate-200/90 flex flex-col max-h-[78vh] shadow-sm"
            >
              {/* Column Header */}
              <div className={`p-3 rounded-t-2xl border-b flex items-center justify-between font-bold text-xs ${stage.color} ${stage.border}`}>
                <span>{stage.title}</span>
                <span className="px-2 py-0.5 rounded-full bg-white/70 text-slate-800 text-[11px] font-black">
                  {stageVendors.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2.5">
                {stageVendors.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs italic">
                    No vendors in this stage
                  </div>
                ) : (
                  stageVendors.slice(0, 50).map(v => {
                    const next = getNextStage(v.pipelineStage);
                    const prev = getPrevStage(v.pipelineStage);
                    const telLink = getTelLink(v.contactPersonMobile);
                    const waLink = getWhatsAppLink(v.contactPersonMobile);
                    const outcomeBadge = getCallOutcomeBadge(v.lastCallOutcome);

                    return (
                      <div 
                        key={v.uniqueKey} 
                        className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm hover:shadow-md transition space-y-2 text-xs"
                      >
                        {/* Title & Priority */}
                        <div className="flex items-start justify-between gap-1">
                          <button
                            onClick={() => onSelectVendor(v)}
                            className="font-bold text-slate-900 hover:text-teal-700 text-left line-clamp-1"
                          >
                            {v.vendorName}
                          </button>
                          {v.priority === 'HOT' && (
                            <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded shrink-0">
                              🔥 HOT
                            </span>
                          )}
                        </div>

                        {/* Contact Person & District */}
                        <div className="text-[11px] text-slate-500 flex items-center space-x-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="truncate">{v.contactPersonName || 'No Name'}</span>
                          <span>•</span>
                          <span className="font-semibold text-slate-600">{v.district}</span>
                        </div>

                        {/* Tracked Capacity */}
                        <div className="flex items-center space-x-1 text-[11px] font-bold text-teal-800">
                          <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span>{v.nationwiseInstallationAndCapacity?.installedCapacity ?? 0} kW Base</span>
                        </div>

                        {/* Direct Click-to-Call & WhatsApp */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          <a
                            href={telLink}
                            className="flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1 rounded-md text-[11px]"
                            title="Call vendor"
                          >
                            <Phone className="w-3 h-3 fill-white" />
                            <span>Call</span>
                          </a>

                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 bg-green-50 text-green-700 border border-green-200 rounded-md hover:bg-green-100"
                            title="WhatsApp Pitch"
                          >
                            <MessageSquare className="w-3.5 h-3.5 fill-green-600 text-green-600" />
                          </a>

                          <button
                            onClick={() => onSelectVendor(v)}
                            className="p-1 bg-slate-50 text-slate-600 border border-slate-200 rounded-md hover:bg-slate-100"
                            title="Notes"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Latest Note preview */}
                        {v.notes && v.notes.length > 0 && (
                          <p className="text-[10px] text-slate-500 line-clamp-1 italic bg-slate-50 p-1 rounded">
                            "{v.notes[0].content}"
                          </p>
                        )}

                        {/* Stage Mover Arrows */}
                        <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                          {prev ? (
                            <button
                              onClick={() => onUpdateStage(v.uniqueKey, prev)}
                              className="hover:text-slate-700 flex items-center space-x-0.5"
                            >
                              <ArrowLeft className="w-3 h-3" />
                              <span>Back</span>
                            </button>
                          ) : <span />}

                          {next && (
                            <button
                              onClick={() => onUpdateStage(v.uniqueKey, next)}
                              className="hover:text-teal-700 font-bold text-teal-600 flex items-center space-x-0.5 ml-auto"
                            >
                              <span>Advance</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                      </div>
                    );
                  })
                )}
                {stageVendors.length > 50 && (
                  <p className="text-center text-[11px] text-slate-400 py-2">
                    +{stageVendors.length - 50} more in this stage (use table search)
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
