import React from 'react';
import { 
  Users, 
  PhoneOutgoing, 
  Flame, 
  Calendar, 
  Trophy, 
  Zap
} from 'lucide-react';
import { Vendor } from '../types/vendor';
import { isFollowUpDueToday } from '../utils/formatters';

interface DashboardMetricsProps {
  vendors: Vendor[];
  districtName: string;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ vendors, districtName }) => {
  const total = vendors.length;
  const contacted = vendors.filter(v => v.pipelineStage !== 'NEW').length;
  const contactedPercent = total > 0 ? Math.round((contacted / total) * 100) : 0;
  
  const hotLeads = vendors.filter(v => v.priority === 'HOT' || v.pipelineStage === 'INTERESTED').length;
  const followUpsDue = vendors.filter(v => isFollowUpDueToday(v.nextFollowUpDate)).length;
  const dealsWon = vendors.filter(v => v.pipelineStage === 'WON').length;
  
  const totalInstalledCapacity = vendors.reduce(
    (sum, v) => sum + (v.nationwiseInstallationAndCapacity?.installedCapacity || 0),
    0
  );

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 mb-3 sm:mb-5">
      
      {/* 1. Total Vendors */}
      <div className="bg-white rounded-xl p-2.5 sm:p-3.5 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between text-slate-500 mb-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider">Vendors</span>
          <Users className="w-3.5 h-3.5 text-teal-600 hidden sm:block" />
        </div>
        <div className="text-lg sm:text-2xl font-black text-slate-900 leading-tight">
          {total.toLocaleString()}
        </div>
        <p className="text-[10px] text-slate-400 truncate">{districtName}</p>
      </div>

      {/* 2. Contacted / Call Progress */}
      <div className="bg-white rounded-xl p-2.5 sm:p-3.5 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between text-slate-500 mb-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider">Called</span>
          <PhoneOutgoing className="w-3.5 h-3.5 text-blue-600 hidden sm:block" />
        </div>
        <div className="flex items-baseline space-x-1">
          <span className="text-lg sm:text-2xl font-black text-blue-700 leading-tight">
            {contacted}
          </span>
          <span className="text-[10px] font-bold text-blue-600">
            ({contactedPercent}%)
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1 mt-1 overflow-hidden">
          <div 
            className="bg-blue-600 h-1 rounded-full" 
            style={{ width: `${contactedPercent}%` }}
          />
        </div>
      </div>

      {/* 3. Hot Leads */}
      <div className="bg-white rounded-xl p-2.5 sm:p-3.5 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between text-slate-500 mb-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Hot Leads</span>
          <Flame className="w-3.5 h-3.5 text-rose-500 hidden sm:block" />
        </div>
        <div className="text-lg sm:text-2xl font-black text-rose-600 leading-tight">
          {hotLeads}
        </div>
        <p className="text-[10px] text-rose-500 font-semibold truncate">High intent</p>
      </div>

      {/* 4. Follow-ups Due */}
      <div className="bg-white rounded-xl p-2.5 sm:p-3.5 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between text-slate-500 mb-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider">Follow-up</span>
          <Calendar className="w-3.5 h-3.5 text-amber-600 hidden sm:block" />
        </div>
        <div className={`text-lg sm:text-2xl font-black leading-tight ${followUpsDue > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
          {followUpsDue}
        </div>
        <p className="text-[10px] text-slate-400 truncate">Due today</p>
      </div>

      {/* 5. Deals Won */}
      <div className="bg-white rounded-xl p-2.5 sm:p-3.5 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between text-slate-500 mb-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Won</span>
          <Trophy className="w-3.5 h-3.5 text-emerald-600 hidden sm:block" />
        </div>
        <div className="text-lg sm:text-2xl font-black text-emerald-600 leading-tight">
          {dealsWon}
        </div>
        <p className="text-[10px] text-emerald-600 font-semibold truncate">Partners</p>
      </div>

      {/* 6. Market Base */}
      <div className="bg-white rounded-xl p-2.5 sm:p-3.5 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between text-slate-500 mb-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">Capacity</span>
          <Zap className="w-3.5 h-3.5 text-purple-600 hidden sm:block" />
        </div>
        <div className="text-base sm:text-xl font-black text-purple-700 leading-tight truncate">
          {totalInstalledCapacity > 1000 ? `${(totalInstalledCapacity / 1000).toFixed(1)} MW` : `${totalInstalledCapacity} kW`}
        </div>
        <p className="text-[10px] text-slate-400 truncate">District base</p>
      </div>

    </div>
  );
};
