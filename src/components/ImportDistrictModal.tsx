import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileCheck, 
  AlertCircle, 
  MapPin, 
  Users, 
  Phone, 
  CheckCircle2, 
  Trash2,
  FolderOpen
} from 'lucide-react';
import { RawVendorJSON, DistrictSummary } from '../types/vendor';

interface ImportDistrictModalProps {
  onClose: () => void;
  districts: DistrictSummary[];
  onImportDistrict: (districtName: string, vendors: RawVendorJSON[], fileName: string) => Promise<void>;
  onDeleteDistrict: (districtName: string) => Promise<void>;
}

export const ImportDistrictModal: React.FC<ImportDistrictModalProps> = ({
  onClose,
  districts,
  onImportDistrict,
  onDeleteDistrict
}) => {
  const [districtName, setDistrictName] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsedVendors, setParsedVendors] = useState<RawVendorJSON[] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const cleanDistrictNameFromFileName = (name: string): string => {
    let clean = name.replace(/\.json$/i, '').replace(/[-_]/g, ' ');
    return clean
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const guessedName = cleanDistrictNameFromFileName(file.name);
    setDistrictName(guessedName);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (!Array.isArray(parsed)) {
          throw new Error('File does not contain a JSON array of vendors.');
        }
        if (parsed.length === 0) {
          throw new Error('Vendor list is empty.');
        }

        // Quick check of fields
        const sample = parsed[0];
        if (!sample.vendorName && !sample.vendorId) {
          throw new Error('File does not look like a PM Surya Ghar / Vendor JSON file (missing vendorName/vendorId).');
        }

        setParsedVendors(parsed);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to parse JSON file.');
        setParsedVendors(null);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = async () => {
    if (!parsedVendors || !districtName.trim()) {
      setErrorMsg('Please specify a district name and select a valid JSON file.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      await onImportDistrict(districtName.trim(), parsedVendors, fileName);
      setSuccessMsg(`Successfully imported ${parsedVendors.length.toLocaleString()} vendors for ${districtName}!`);
      setParsedVendors(null);
      setDistrictName('');
      setFileName('');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Import failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Import District Vendors JSON
              </h2>
              <p className="text-xs text-teal-300/80">
                Add Anakapalli, Visakhapatnam, Kakinada, or any new district database
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
          
          {/* Upload Zone */}
          <div className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-2xl p-6 text-center bg-slate-50 transition relative group cursor-pointer">
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
              <FolderOpen className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">
              {fileName ? fileName : 'Click to select or drag & drop district JSON file'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports National Portal & PM Surya Ghar vendor JSON files (e.g. anakapalli.json, visakhapatnam.json)
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center space-x-2 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center space-x-2 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* File Preview Card */}
          {parsedVendors && (
            <div className="bg-teal-50/60 border border-teal-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-900 text-sm flex items-center space-x-1.5">
                  <FileCheck className="w-4 h-4 text-teal-600" />
                  <span>Valid Vendor Dataset Detected</span>
                </span>
                <span className="text-xs font-mono font-bold bg-white text-teal-800 px-2 py-0.5 rounded border border-teal-200">
                  {parsedVendors.length.toLocaleString()} Vendors
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  District Name to Assign:
                </label>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-teal-600" />
                  <input
                    type="text"
                    value={districtName}
                    onChange={(e) => setDistrictName(e.target.value)}
                    placeholder="e.g. Anakapalli, Kakinada, Visakhapatnam"
                    className="flex-1 bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Sample vendor snippet */}
              <div className="bg-white p-3 rounded-lg border border-teal-100 text-[11px] text-slate-600 space-y-1">
                <span className="font-semibold text-slate-800 block">Sample Record Preview:</span>
                <div><b>Vendor:</b> {parsedVendors[0]?.vendorName}</div>
                <div><b>Contact:</b> {parsedVendors[0]?.contactPersonName || 'N/A'} (📞 {parsedVendors[0]?.contactPersonMobile || 'N/A'})</div>
                <div><b>Address:</b> {parsedVendors[0]?.address || 'N/A'}</div>
              </div>

              <button
                onClick={handleExecuteImport}
                disabled={isProcessing}
                className="w-full bg-teal-700 hover:bg-teal-600 text-white font-extrabold text-sm py-2.5 rounded-xl shadow-md transition disabled:opacity-50"
              >
                {isProcessing ? 'Importing & Saving...' : `Import ${parsedVendors.length.toLocaleString()} Vendors to ${districtName}`}
              </button>
            </div>
          )}

          {/* Existing Districts List */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Installed Districts ({districts.length})
            </h3>

            <div className="space-y-2">
              {districts.map(d => (
                <div key={d.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-teal-600" />
                    <div>
                      <span className="font-bold text-slate-900">{d.name}</span>
                      <span className="text-slate-400 text-[11px] ml-2">
                        ({d.totalVendors.toLocaleString()} vendors)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {districts.length > 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete all vendors from ${d.name}?`)) {
                            onDeleteDistrict(d.name);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete this district"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 px-4 py-2"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
