import React from 'react';
import { 
  Sun, 
  PhoneCall, 
  Columns3, 
  ListFilter, 
  CalendarClock, 
  Sparkles, 
  Upload, 
  Download, 
  BookOpen, 
  MapPin,
  Flame
} from 'lucide-react';
import { DistrictSummary } from '../types/vendor';

interface NavbarProps {
  districts: DistrictSummary[];
  selectedDistrict: string;
  onSelectDistrict: (districtId: string) => void;
  activeView: 'list' | 'kanban' | 'followups';
  setActiveView: (view: 'list' | 'kanban' | 'followups') => void;
  onOpenPowerDialer: () => void;
  onOpenImport: () => void;
  onOpenExport: () => void;
  onOpenPitch: () => void;
  dueFollowUpCount: number;
  hotLeadsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  districts,
  selectedDistrict,
  onSelectDistrict,
  activeView,
  setActiveView,
  onOpenPowerDialer,
  onOpenImport,
  onOpenExport,
  onOpenPitch,
  dueFollowUpCount,
  hotLeadsCount
}) => {
  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white shadow-lg border-b border-teal-800/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-solar-500 to-amber-300 flex items-center justify-center shadow-md shadow-amber-500/20 text-slate-950">
              <Sun className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-200 via-amber-200 to-solar-400">
                  TEJO BHARAT
                </span>
                <span className="text-xs uppercase px-2 py-0.5 rounded-full bg-teal-800/60 text-teal-300 border border-teal-700 font-semibold tracking-wider">
                  Solar B2B CRM
                </span>
              </div>
              <p className="text-xs text-teal-300/80 hidden sm:block">
                Vendor Outreach & Module Sales Platform
              </p>
            </div>
          </div>

          {/* District Selector */}
          <div className="flex items-center space-x-2 bg-slate-800/80 border border-teal-700/50 rounded-lg px-2.5 py-1.5 shadow-inner">
            <MapPin className="w-4 h-4 text-solar-400 shrink-0" />
            <select
              value={selectedDistrict}
              onChange={(e) => onSelectDistrict(e.target.value)}
              className="bg-transparent text-sm text-teal-100 font-medium focus:outline-none cursor-pointer pr-2"
            >
              <option value="all" className="bg-slate-900 text-white">All Districts ({districts.reduce((sum, d) => sum + d.totalVendors, 0)})</option>
              {districts.map((d) => (
                <option key={d.id} value={d.name} className="bg-slate-900 text-white">
                  {d.name} ({d.totalVendors.toLocaleString()})
                </option>
              ))}
            </select>
            <button
              onClick={onOpenImport}
              title="Add / Import More District Vendors JSON"
              className="ml-1 text-xs bg-teal-700/60 hover:bg-teal-600 text-teal-200 hover:text-white px-2 py-0.5 rounded transition flex items-center space-x-1 border border-teal-600/40"
            >
              <Upload className="w-3 h-3" />
              <span className="hidden md:inline">+ Add District</span>
            </button>
          </div>

          {/* View Mode Nav */}
          <div className="hidden lg:flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-teal-900/60">
            <button
              onClick={() => setActiveView('list')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeView === 'list'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ListFilter className="w-4 h-4" />
              <span>Vendors Table</span>
            </button>
            <button
              onClick={() => setActiveView('kanban')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeView === 'kanban'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Columns3 className="w-4 h-4" />
              <span>Sales Pipeline</span>
            </button>
            <button
              onClick={() => setActiveView('followups')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition relative ${
                activeView === 'followups'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <CalendarClock className="w-4 h-4" />
              <span>Follow-ups</span>
              {dueFollowUpCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-bold">
                  {dueFollowUpCount}
                </span>
              )}
            </button>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center space-x-2">
            
            {/* Speed Power Dialer */}
            <button
              onClick={onOpenPowerDialer}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-md shadow-emerald-900/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
              title="Start Rapid Calling Queue"
            >
              <PhoneCall className="w-4 h-4 animate-bounce" />
              <span className="hidden sm:inline">Power Dialer</span>
            </button>

            {/* Sales Pitch Drawer */}
            <button
              onClick={onOpenPitch}
              className="flex items-center space-x-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-medium px-2.5 py-2 rounded-lg transition"
              title="View Telugu & English Pitch Scripts"
            >
              <BookOpen className="w-4 h-4 text-solar-400" />
              <span className="hidden md:inline">Solar Pitch</span>
            </button>

            {/* Export / Backup */}
            <button
              onClick={onOpenExport}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Export CSV / JSON Backup"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Mobile View Toggle Bar */}
        <div className="flex lg:hidden items-center justify-around py-2 border-t border-teal-800/30 text-xs">
          <button
            onClick={() => setActiveView('list')}
            className={`flex items-center space-x-1 px-3 py-1 rounded-md ${
              activeView === 'list' ? 'bg-teal-700 text-white font-bold' : 'text-slate-300'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>
          <button
            onClick={() => setActiveView('kanban')}
            className={`flex items-center space-x-1 px-3 py-1 rounded-md ${
              activeView === 'kanban' ? 'bg-teal-700 text-white font-bold' : 'text-slate-300'
            }`}
          >
            <Columns3 className="w-3.5 h-3.5" />
            <span>Pipeline</span>
          </button>
          <button
            onClick={() => setActiveView('followups')}
            className={`flex items-center space-x-1 px-3 py-1 rounded-md relative ${
              activeView === 'followups' ? 'bg-teal-700 text-white font-bold' : 'text-slate-300'
            }`}
          >
            <CalendarClock className="w-3.5 h-3.5" />
            <span>Follow-ups</span>
            {dueFollowUpCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-bold">
                {dueFollowUpCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
