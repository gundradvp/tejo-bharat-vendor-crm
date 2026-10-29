import React from 'react';
import { 
  Users, 
  PhoneOutgoing, 
  Flame, 
  Calendar, 
  Trophy, 
  Zap,
  TrendingUp,
  Percent
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      
      {/* 1. Total Vendors */}
      <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200/80 hover:shadow-md transition">
        <div className="flex items-center justify-between text-slate-500 mb-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider">Total Vendors</span>
          <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl font-extrabold text-slate-900">{total.toLocaleString()}</span>
          <span className="text-[11px] text-slate-500 font-medium truncate">in {districtName}</span>
        </div>
      </div>

      {/* 2. Contacted / Call Progress */}
      <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200/80 hover:shadow-md transition">
        <div className="flex items-center justify-between text-slate-500 mb-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider">Contacted</span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
            <PhoneOutgoing className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-extrabold text-blue-700">{contacted.toLocaleString()}</span>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">
            {contactedPercent}%
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
          <div 
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" 
            style={{ width: `${contactedPercent}%` }}
          />
        </div>
      </div>

      {/* 3. Hot Leads */}
      <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200/80 hover:shadow-md transition">
        <div className="flex items-center justify-between text-slate-500 mb-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider">Hot / Interested</span>
          <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <Flame className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl font-extrabold text-rose-600">{hotLeads.toLocaleString()}</span>
          <span className="text-[11px] text-rose-500 font-medium">high intent</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1 truncate">Ready for solar quote</p>
      </div>

      {/* 4. Follow-ups Due */}
      <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200/80 hover:shadow-md transition">
        <div className="flex items-center justify-between text-slate-500 mb-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider">Follow-ups Due</span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-1">
          <span className={`text-2xl font-extrabold ${followUpsDue > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
            {followUpsDue}
          </span>
          <span className="text-[11px] text-slate-500">pending today</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1 truncate">Scheduled callbacks</p>
      </div>

      {/* 5. Deals Won */}
      <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200/80 hover:shadow-md transition">
        <div className="flex items-center justify-between text-slate-500 mb-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider">Deals Won</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Trophy className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl font-extrabold text-emerald-600">{dealsWon}</span>
          <span className="text-[11px] text-emerald-600 font-medium">partners</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1 truncate">Module sales closed</p>
      </div>

      {/* 6. Total Market Capacity */}
      <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200/80 hover:shadow-md transition">
        <div className="flex items-center justify-between text-slate-500 mb-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider">Installed Base</span>
          <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-1">
          <span className="text-xl font-extrabold text-purple-700">
            {totalInstalledCapacity > 1000 ? `${(totalInstalledCapacity / 1000).toFixed(1)} MW` : `${totalInstalledCapacity} kW`}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1 truncate">Tracked on Portal</p>
      </div>

    </div>
  );
};
