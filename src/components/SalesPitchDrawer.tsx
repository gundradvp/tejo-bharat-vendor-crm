import React from 'react';
import { X, Sparkles, Copy, Check, MessageSquare, Phone, ShieldCheck, Zap } from 'lucide-react';
import { SOLAR_PITCH_SCRIPTS } from '../utils/solarPitch';

interface SalesPitchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SalesPitchDrawer: React.FC<SalesPitchDrawerProps> = ({ isOpen, onClose }) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col border-l border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-5 flex items-center justify-between border-b border-teal-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-solar-500/20 text-solar-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-solar-400" />
            </div>
            <div>
              <h2 className="text-base font-black">Tejo Bharat Solar Sales Guide</h2>
              <p className="text-xs text-teal-300/80">Scripts, Objections & Module Specifications</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Highlights Bar */}
        <div className="bg-teal-50 border-b border-teal-100 p-3.5 text-xs text-teal-900 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 font-bold">
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            <span>ALMM & BIS Approved Tier-1 Panels</span>
          </div>
          <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-teal-200 text-teal-800 font-bold">
            +91 94797 97947
          </span>
        </div>

        {/* Scrollable Pitch Cards */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1.5">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
              Tejo Bharat Value Proposition
            </span>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li><b>Ready Stock in Andhra Pradesh:</b> Fast dispatch to Anakapalli, Vizag, Kakinada, etc.</li>
              <li><b>PM Surya Ghar Compliance:</b> Certified DCR Mono PERC for full customer DBT subsidy.</li>
              <li><b>High Dealer Margins:</b> Direct wholesale factory rate without intermediaries.</li>
              <li><b>25-Year Performance Warranty:</b> Guaranteed long-term peace of mind.</li>
            </ul>
          </div>

          {SOLAR_PITCH_SCRIPTS.map(script => (
            <div key={script.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    script.language === 'Telugu' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {script.language}
                  </span>
                  <span>{script.title}</span>
                </span>

                <button
                  onClick={() => handleCopy(script.id, script.content)}
                  className="text-xs text-teal-700 hover:text-teal-900 font-bold flex items-center space-x-1"
                >
                  {copiedId === script.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg text-slate-700 whitespace-pre-wrap font-sans leading-relaxed text-xs">
                {script.content}
              </div>
            </div>
          ))}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="text-xs font-bold bg-teal-700 text-white px-5 py-2 rounded-xl hover:bg-teal-600 transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
