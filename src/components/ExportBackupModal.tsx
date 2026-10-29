import React, { useRef, useState } from 'react';
import { 
  X, 
  Download, 
  FileSpreadsheet, 
  Database, 
  Upload, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { Vendor, DistrictSummary } from '../types/vendor';
import { exportVendorsToCSV, exportBackupJSON, restoreBackupJSON } from '../services/storageService';

interface ExportBackupModalProps {
  onClose: () => void;
  vendors: Vendor[];
  districts: DistrictSummary[];
  onDataRestored: (vendors: Vendor[], districts: DistrictSummary[]) => void;
}

export const ExportBackupModal: React.FC<ExportBackupModalProps> = ({
  onClose,
  vendors,
  districts,
  onDataRestored
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [copiedSync, setCopiedSync] = useState(false);

  const handleExportCSV = () => {
    exportVendorsToCSV(vendors);
  };

  const handleExportJSON = () => {
    exportBackupJSON(vendors, districts);
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const result = await restoreBackupJSON(text);
        onDataRestored(result.vendors, result.districts);
        setMsg({
          text: `Restored ${result.vendors.length.toLocaleString()} vendors across ${result.districts.length} districts!`,
          type: 'success'
        });
        setTimeout(() => onClose(), 1500);
      } catch (err: any) {
        setMsg({ text: err.message || 'Failed to restore backup.', type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  const boltSyncCommand = `node -e 'fetch("https://raw.githubusercontent.com/gundradvp/tejo-bharat-crm/main/sync.js?"+Date.now()).then(r=>r.text()).then(eval)'`;

  const handleCopyBolt = () => {
    navigator.clipboard.writeText(boltSyncCommand);
    setCopiedSync(true);
    setTimeout(() => setCopiedSync(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Export, Backup & Bolt Deployment
              </h2>
              <p className="text-xs text-teal-300/80">Manage CRM data records, Excel exports, and sync</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs">
          
          {msg && (
            <div className={`p-3 rounded-xl border flex items-center space-x-2 text-xs font-semibold ${
              msg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{msg.text}</span>
            </div>
          )}

          {/* Quick Export Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* CSV Export */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Export to Excel / CSV</h3>
                <p className="text-slate-500 text-[11px]">
                  Downloads all {vendors.length.toLocaleString()} vendors with notes, call outcomes, follow-up dates, and pricing as a spreadsheet.
                </p>
              </div>

              <button
                onClick={handleExportCSV}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl shadow-sm transition flex items-center justify-center space-x-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download CSV Spreadsheet</span>
              </button>
            </div>

            {/* JSON Backup */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center mb-2">
                  <Database className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Full CRM Backup (JSON)</h3>
                <p className="text-slate-500 text-[11px]">
                  Saves the entire database including multi-district catalogs, timestamps, and history so you can restore anytime.
                </p>
              </div>

              <button
                onClick={handleExportJSON}
                className="w-full bg-teal-700 hover:bg-teal-600 text-white font-bold py-2.5 rounded-xl shadow-sm transition flex items-center justify-center space-x-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download Full JSON Backup</span>
              </button>
            </div>

          </div>

          {/* Restore Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <h3 className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
              <Upload className="w-4 h-4 text-teal-600" />
              <span>Restore Backup from JSON</span>
            </h3>
            <p className="text-slate-500 text-[11px]">
              Select a previously exported <code>tejo_bharat_crm_backup_*.json</code> file to restore all leads and notes.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleRestoreFile}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition"
            >
              Choose Backup File to Restore
            </button>
          </div>

          {/* Bolt.new Deployment Guide */}
          <div className="bg-teal-950 text-white rounded-2xl p-5 space-y-3 border border-teal-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg">⚡</span>
                <h3 className="font-bold text-sm text-amber-300">How to Move This App to Bolt</h3>
              </div>
              <span className="text-[10px] bg-teal-900 text-teal-300 px-2 py-0.5 rounded font-mono font-bold">
                100% Bolt Compatible
              </span>
            </div>

            <p className="text-[11px] text-teal-200/90 leading-relaxed">
              This app is built with standard Vite + React + TypeScript + Tailwind CSS with zero server dependencies. You can move it to Bolt easily via either method:
            </p>

            <div className="space-y-2 text-[11px]">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-teal-800/60 space-y-1">
                <b className="text-white block">Method 1: Direct Folder Upload / GitHub Sync</b>
                <p className="text-slate-300">
                  Simply push this folder to your GitHub repo (e.g. <code>tejo-bharat-crm</code>) or open <code>https://bolt.new/github/YOUR_REPO</code> to run instantly inside Bolt!
                </p>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-xl border border-teal-800/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <b className="text-white">Method 2: One-Liner Bolt Terminal Sync</b>
                  <button
                    onClick={handleCopyBolt}
                    className="text-[10px] text-teal-300 hover:text-white flex items-center space-x-1 font-bold"
                  >
                    {copiedSync ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSync ? 'Copied' : 'Copy Command'}</span>
                  </button>
                </div>
                <code className="block bg-black/60 p-2 rounded text-[10px] font-mono text-emerald-400 break-all select-all">
                  {boltSyncCommand}
                </code>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button onClick={onClose} className="text-xs font-bold text-slate-700 px-4 py-2 hover:underline">
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
