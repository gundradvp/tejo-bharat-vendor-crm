import React from 'react';
import { 
  Sun, 
  PhoneCall, 
  Columns3, 
  ListFilter, 
  CalendarClock, 
  Upload, 
  Download, 
  BookOpen, 
  MapPin,
  Flame,
  Search,
  Plus
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
    <>
      {/* 1. TOP APP BAR (Compact & Sticky for Mobile + Desktop) */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white shadow-md border-b border-teal-800/50 pt-safe">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            
            {/* Logo & Brand */}
            <div className="flex items-center space-x-2.5">
              <img 
                src="/logo.png" 
                alt="Tejo Bharat Logo" 
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded-xl p-0.5 bg-white/10 shrink-0 border border-teal-500/30 shadow-md shadow-teal-900/30" 
              />
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-black text-sm sm:text-base tracking-tight text-white">
                    TEJO BHARAT
                  </span>
                  <span className="text-[10px] uppercase px-1.5 py-0.2 rounded bg-teal-800 text-teal-300 font-bold border border-teal-700">
                    Solar CRM
                  </span>
                </div>
                <p className="text-[10px] text-teal-300/80 hidden sm:block">
                  Vendor Calling & Module Sales
                </p>
              </div>
            </div>

            {/* District Selector Pill */}
            <div className="flex items-center space-x-1 bg-slate-800/90 border border-teal-700/60 rounded-xl px-2 py-1 shadow-inner">
              <MapPin className="w-3.5 h-3.5 text-solar-400 shrink-0" />
              <select
                value={selectedDistrict}
                onChange={(e) => onSelectDistrict(e.target.value)}
                className="bg-transparent text-xs text-teal-100 font-bold focus:outline-none cursor-pointer max-w-[110px] sm:max-w-none truncate"
              >
                <option value="all" className="bg-slate-900 text-white">All Districts</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.name} className="bg-slate-900 text-white">
                    {d.name} ({d.totalVendors})
                  </option>
                ))}
              </select>
              <button
                onClick={onOpenImport}
                title="Add new district JSON"
                className="p-1 text-teal-300 hover:text-white hover:bg-teal-700/60 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Desktop Navigation Links (Hidden on Mobile) */}
            <div className="hidden lg:flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-teal-900/60">
              <button
                onClick={() => setActiveView('list')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeView === 'list' ? 'bg-teal-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                <ListFilter className="w-4 h-4" />
                <span>Vendor Cards</span>
              </button>
              <button
                onClick={() => setActiveView('kanban')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeView === 'kanban' ? 'bg-teal-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Columns3 className="w-4 h-4" />
                <span>Sales Pipeline</span>
              </button>
              <button
                onClick={() => setActiveView('followups')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeView === 'followups' ? 'bg-teal-600 text-white' : 'text-slate-300 hover:text-white'
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

            {/* Quick Header Actions */}
            <div className="flex items-center space-x-1.5">
              
              {/* Power Dialer CTA */}
              <button
                onClick={onOpenPowerDialer}
                className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-black px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl shadow-md transition"
                title="Start Speed Calling Queue"
              >
                <PhoneCall className="w-3.5 h-3.5 animate-bounce" />
                <span className="hidden xs:inline">Speed Call</span>
              </button>

              {/* Pitch Guide */}
              <button
                onClick={onOpenPitch}
                className="p-1.5 sm:px-2.5 sm:py-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition flex items-center space-x-1"
                title="Telugu & English Pitch Scripts"
              >
                <BookOpen className="w-4 h-4 text-solar-400" />
                <span className="hidden md:inline">Pitch</span>
              </button>

              {/* Export / Backup */}
              <button
                onClick={onOpenExport}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
                title="Export Excel / Backup"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* 2. MOBILE BOTTOM NAVIGATION DOCK (Thumb-First for Smartphones) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-1 shadow-2xl flex items-center justify-around pb-safe">
        
        {/* Leads */}
        <button
          onClick={() => setActiveView('list')}
          className={`flex-1 py-1 flex flex-col items-center justify-center space-y-0.5 transition ${
            activeView === 'list' ? 'text-teal-400 font-extrabold' : 'text-slate-400 font-medium'
          }`}
        >
          <div className={`p-1 rounded-xl transition ${activeView === 'list' ? 'bg-teal-500/20' : ''}`}>
            <ListFilter className="w-5 h-5" />
          </div>
          <span className="text-[10px]">Leads</span>
        </button>

        {/* Speed Dialer (Center Highlight) */}
        <button
          onClick={onOpenPowerDialer}
          className="flex-1 py-1 flex flex-col items-center justify-center space-y-0.5 group"
        >
          <div className="w-10 h-10 -mt-5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-900/50 group-active:scale-95 transition">
            <PhoneCall className="w-5 h-5" />
          </div>
          <span className="text-[10px] text-emerald-400 font-extrabold">Dialer</span>
        </button>

        {/* Follow-ups */}
        <button
          onClick={() => setActiveView('followups')}
          className={`flex-1 py-1 flex flex-col items-center justify-center space-y-0.5 transition relative ${
            activeView === 'followups' ? 'text-teal-400 font-extrabold' : 'text-slate-400 font-medium'
          }`}
        >
          <div className={`p-1 rounded-xl relative transition ${activeView === 'followups' ? 'bg-teal-500/20' : ''}`}>
            <CalendarClock className="w-5 h-5" />
            {dueFollowUpCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center">
                {dueFollowUpCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">Reminders</span>
        </button>

        {/* Pipeline Kanban */}
        <button
          onClick={() => setActiveView('kanban')}
          className={`flex-1 py-1 flex flex-col items-center justify-center space-y-0.5 transition ${
            activeView === 'kanban' ? 'text-teal-400 font-extrabold' : 'text-slate-400 font-medium'
          }`}
        >
          <div className={`p-1 rounded-xl transition ${activeView === 'kanban' ? 'bg-teal-500/20' : ''}`}>
            <Columns3 className="w-5 h-5" />
          </div>
          <span className="text-[10px]">Pipeline</span>
        </button>

        {/* Solar Pitch */}
        <button
          onClick={onOpenPitch}
          className="flex-1 py-1 flex flex-col items-center justify-center space-y-0.5 text-solar-400 font-medium"
        >
          <div className="p-1 rounded-xl hover:bg-amber-500/10">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-[10px]">Pitch</span>
        </button>

      </nav>
    </>
  );
};
