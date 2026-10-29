import React, { useState, useMemo } from 'react';
import { 
  Phone, 
  MessageSquare, 
  FileText, 
  Search, 
  Filter, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Zap, 
  Flame, 
  Star,
  ExternalLink,
  Calendar,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Vendor, PipelineStage, Priority, FilterState } from '../types/vendor';
import { 
  formatPhoneDisplay, 
  getTelLink, 
  getWhatsAppLink, 
  getStageBadgeClass, 
  getStageLabel, 
  getCallOutcomeBadge, 
  formatDate,
  isFollowUpDueToday 
} from '../utils/formatters';

interface VendorListProps {
  vendors: Vendor[];
  selectedDistrict: string;
  onSelectVendor: (vendor: Vendor) => void;
  onQuickCall: (vendor: Vendor) => void;
  onUpdateStage: (vendorKey: string, newStage: PipelineStage) => void;
}

export const VendorList: React.FC<VendorListProps> = ({
  vendors,
  selectedDistrict,
  onSelectVendor,
  onQuickCall,
  onUpdateStage
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [callStatusFilter, setCallStatusFilter] = useState<string>('all'); // all, uncalled, called
  const [minCapacity, setMinCapacity] = useState<number>(0);
  const [onlyFollowUps, setOnlyFollowUps] = useState<boolean>(false);
  
  const [sortBy, setSortBy] = useState<'capacity' | 'name' | 'lastContacted' | 'priority'>('capacity');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Filter logic
  const filteredVendors = useMemo(() => {
    return vendors.filter(v => {
      // District check
      if (selectedDistrict !== 'all' && v.district.toLowerCase() !== selectedDistrict.toLowerCase()) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = v.vendorName?.toLowerCase().includes(query);
        const matchesContact = v.contactPersonName?.toLowerCase().includes(query);
        const matchesPhone = v.contactPersonMobile?.includes(query);
        const matchesEmail = v.contactPersonEmail?.toLowerCase().includes(query);
        const matchesAddress = v.address?.toLowerCase().includes(query);
        const matchesId = String(v.vendorId).includes(query);

        if (!matchesName && !matchesContact && !matchesPhone && !matchesEmail && !matchesAddress && !matchesId) {
          return false;
        }
      }

      // Stage filter
      if (stageFilter !== 'all' && v.pipelineStage !== stageFilter) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== 'all' && v.priority !== priorityFilter) {
        return false;
      }

      // Call status filter
      if (callStatusFilter === 'uncalled' && v.pipelineStage !== 'NEW') {
        return false;
      }
      if (callStatusFilter === 'called' && v.pipelineStage === 'NEW') {
        return false;
      }

      // Min capacity
      const cap = v.nationwiseInstallationAndCapacity?.installedCapacity || 0;
      if (minCapacity > 0 && cap < minCapacity) {
        return false;
      }

      // Follow-ups due
      if (onlyFollowUps && !isFollowUpDueToday(v.nextFollowUpDate)) {
        return false;
      }

      return true;
    });
  }, [vendors, selectedDistrict, searchQuery, stageFilter, priorityFilter, callStatusFilter, minCapacity, onlyFollowUps]);

  // Sort logic
  const sortedVendors = useMemo(() => {
    const sorted = [...filteredVendors];
    sorted.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'capacity') {
        const capA = a.nationwiseInstallationAndCapacity?.installedCapacity || 0;
        const capB = b.nationwiseInstallationAndCapacity?.installedCapacity || 0;
        comparison = capA - capB;
      } else if (sortBy === 'name') {
        comparison = (a.vendorName || '').localeCompare(b.vendorName || '');
      } else if (sortBy === 'lastContacted') {
        const dateA = a.lastContactedAt ? new Date(a.lastContactedAt).getTime() : 0;
        const dateB = b.lastContactedAt ? new Date(b.lastContactedAt).getTime() : 0;
        comparison = dateA - dateB;
      } else if (sortBy === 'priority') {
        const score = (p: Priority) => (p === 'HOT' ? 3 : p === 'WARM' ? 2 : p === 'NORMAL' ? 1 : 0);
        comparison = score(a.priority) - score(b.priority);
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });
    return sorted;
  }, [filteredVendors, sortBy, sortOrder]);

  // Pagination calculation
  const totalItems = sortedVendors.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedVendors = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedVendors.slice(start, start + pageSize);
  }, [sortedVendors, currentPage, pageSize]);

  // Reset page when filters change
  const handleFilterChange = (setter: () => void) => {
    setter();
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      
      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/90 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by vendor name, contact person, mobile, email, address..."
              value={searchQuery}
              onChange={(e) => handleFilterChange(() => setSearchQuery(e.target.value))}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none transition"
            />
            {searchQuery && (
              <button 
                onClick={() => handleFilterChange(() => setSearchQuery(''))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center space-x-2 shrink-0">
            <ArrowUpDown className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-500">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-medium focus:outline-none cursor-pointer"
            >
              <option value="capacity">Installed Capacity (Highest)</option>
              <option value="lastContacted">Recently Contacted</option>
              <option value="name">Vendor Name (A-Z)</option>
              <option value="priority">Priority (Hot first)</option>
            </select>

            <button
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-2 rounded-lg font-bold"
              title="Toggle sort direction"
            >
              {sortOrder === 'desc' ? '⬇ Desc' : '⬆ Asc'}
            </button>
          </div>

        </div>

        {/* Filter Pills Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          
          {/* Pipeline Stage Filter */}
          <div className="flex items-center space-x-1">
            <span className="text-slate-500 font-medium">Stage:</span>
            <select
              value={stageFilter}
              onChange={(e) => handleFilterChange(() => setStageFilter(e.target.value))}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs font-semibold"
            >
              <option value="all">All Stages</option>
              <option value="NEW">New / Uncalled</option>
              <option value="CONTACTED">Contacted</option>
              <option value="INTERESTED">Interested 🔥</option>
              <option value="QUOTE_SENT">Quote Sent</option>
              <option value="FOLLOW_UP">Follow-up</option>
              <option value="NEGOTIATION">Negotiation</option>
              <option value="WON">Deal Won 🎉</option>
              <option value="LOST">Lost</option>
            </select>
          </div>

          {/* Call Status */}
          <div className="flex items-center space-x-1">
            <span className="text-slate-500 font-medium">Call Status:</span>
            <select
              value={callStatusFilter}
              onChange={(e) => handleFilterChange(() => setCallStatusFilter(e.target.value))}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs font-semibold"
            >
              <option value="all">All</option>
              <option value="uncalled">Uncalled Only</option>
              <option value="called">Called / Contacted</option>
            </select>
          </div>

          {/* Priority */}
          <div className="flex items-center space-x-1">
            <span className="text-slate-500 font-medium">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => handleFilterChange(() => setPriorityFilter(e.target.value))}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs font-semibold"
            >
              <option value="all">All Priorities</option>
              <option value="HOT">🔥 Hot Leads</option>
              <option value="WARM">☀️ Warm</option>
              <option value="COLD">❄️ Cold</option>
              <option value="NORMAL">Normal</option>
            </select>
          </div>

          {/* Min Capacity Filter */}
          <div className="flex items-center space-x-1">
            <span className="text-slate-500 font-medium">Capacity:</span>
            <select
              value={minCapacity}
              onChange={(e) => handleFilterChange(() => setMinCapacity(Number(e.target.value)))}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs font-semibold"
            >
              <option value="0">Any Capacity</option>
              <option value="10">&gt; 10 kW</option>
              <option value="50">&gt; 50 kW (Major Vendors)</option>
              <option value="100">&gt; 100 kW (Tier-1 Buyers)</option>
            </select>
          </div>

          {/* Follow-ups toggle */}
          <button
            onClick={() => handleFilterChange(() => setOnlyFollowUps(prev => !prev))}
            className={`px-2.5 py-1 rounded-lg border font-semibold transition flex items-center space-x-1 ${
              onlyFollowUps
                ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Follow-ups Due Today</span>
          </button>

          {/* Clear Filters Button */}
          {(stageFilter !== 'all' || priorityFilter !== 'all' || callStatusFilter !== 'all' || minCapacity > 0 || onlyFollowUps || searchQuery) && (
            <button
              onClick={() => {
                setStageFilter('all');
                setPriorityFilter('all');
                setCallStatusFilter('all');
                setMinCapacity(0);
                setOnlyFollowUps(false);
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="text-xs text-rose-600 hover:underline font-semibold ml-auto"
            >
              Reset Filters
            </button>
          )}

        </div>
      </div>

      {/* Table Results Summary */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-500">
        <span>
          Showing <b>{totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1}</b> -{' '}
          <b>{Math.min(currentPage * pageSize, totalItems)}</b> of <b>{totalItems.toLocaleString()}</b> vendors
        </span>
        <div className="flex items-center space-x-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs font-semibold"
          >
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      {/* Vendor Table View */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-200 uppercase font-bold tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Vendor & Contact</th>
                <th className="py-3 px-4">Direct Calling / Action</th>
                <th className="py-3 px-3">Pipeline Stage</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Tracked Base</th>
                <th className="py-3 px-4">Latest Notes / Call Status</th>
                <th className="py-3 px-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedVendors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="max-w-sm mx-auto space-y-2">
                      <p className="font-semibold text-slate-600 text-sm">No vendors found matching criteria</p>
                      <p className="text-xs">Try clearing some filters or searching with a different term.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedVendors.map((vendor) => {
                  const telLink = getTelLink(vendor.contactPersonMobile);
                  const waLink = getWhatsAppLink(vendor.contactPersonMobile);
                  const latestNote = vendor.notes && vendor.notes.length > 0 ? vendor.notes[0] : null;
                  const outcomeBadge = getCallOutcomeBadge(vendor.lastCallOutcome);

                  return (
                    <tr 
                      key={vendor.uniqueKey} 
                      className="hover:bg-teal-50/40 transition duration-150 group"
                    >
                      
                      {/* Vendor & Contact */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="space-y-0.5">
                          <button
                            onClick={() => onSelectVendor(vendor)}
                            className="font-bold text-slate-900 hover:text-teal-700 text-sm tracking-tight text-left block group-hover:underline"
                          >
                            {vendor.vendorName}
                          </button>
                          
                          <div className="flex items-center space-x-1.5 text-slate-600 font-medium">
                            <span>{vendor.contactPersonName || 'No contact name'}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-semibold">
                              {vendor.district}
                            </span>
                          </div>

                          {vendor.address && (
                            <p className="text-[11px] text-slate-400 truncate max-w-xs" title={vendor.address}>
                              {vendor.address}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* DIRECT CALL ACTION (THE CORE BUTTON) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          
                          {/* Big Click-to-Call Green Dial Button */}
                          <a
                            href={telLink}
                            onClick={() => onQuickCall(vendor)}
                            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition transform active:scale-95"
                            title="Click to dial vendor directly"
                          >
                            <Phone className="w-3.5 h-3.5 fill-white" />
                            <span className="font-mono text-xs">{formatPhoneDisplay(vendor.contactPersonMobile)}</span>
                          </a>

                          {/* WhatsApp Pitch One-Click */}
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-green-50 hover:bg-green-100 text-green-700 border border-green-300 rounded-lg transition"
                            title="Send Solar Pitch on WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4 fill-green-600 text-green-600" />
                          </a>

                        </div>
                      </td>

                      {/* Pipeline Stage */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <select
                          value={vendor.pipelineStage}
                          onChange={(e) => onUpdateStage(vendor.uniqueKey, e.target.value as PipelineStage)}
                          className={`text-xs font-bold rounded-lg px-2 py-1 border focus:outline-none cursor-pointer ${getStageBadgeClass(vendor.pipelineStage)}`}
                        >
                          <option value="NEW">New / Uncalled</option>
                          <option value="CONTACTED">Contacted</option>
                          <option value="INTERESTED">Interested 🔥</option>
                          <option value="QUOTE_SENT">Quote Sent</option>
                          <option value="FOLLOW_UP">Follow-up</option>
                          <option value="NEGOTIATION">Negotiation</option>
                          <option value="WON">Deal Won 🎉</option>
                          <option value="LOST">Lost</option>
                          <option value="DO_NOT_CALL">Do Not Call</option>
                        </select>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {vendor.priority === 'HOT' ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 font-bold border border-rose-300">
                            <Flame className="w-3 h-3 text-rose-600" />
                            <span>HOT</span>
                          </span>
                        ) : vendor.priority === 'WARM' ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-semibold border border-amber-200">
                            Warm
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            Normal
                          </span>
                        )}
                      </td>

                      {/* Tracked Base Capacity */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-teal-800 text-xs flex items-center space-x-1">
                            <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span>{vendor.nationwiseInstallationAndCapacity?.installedCapacity ?? 0} kW</span>
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {vendor.nationwiseInstallationAndCapacity?.installationCount ?? 0} installations
                          </span>
                        </div>
                      </td>

                      {/* Latest Notes / Status */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1.5">
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${outcomeBadge.color}`}>
                              {outcomeBadge.label}
                            </span>
                            {vendor.notes && vendor.notes.length > 0 && (
                              <span className="text-[10px] text-slate-500 font-semibold">
                                ({vendor.notes.length} note{vendor.notes.length > 1 ? 's' : ''})
                              </span>
                            )}
                          </div>

                          {latestNote ? (
                            <p className="text-[11px] text-slate-700 truncate font-medium" title={latestNote.content}>
                              "{latestNote.content}"
                            </p>
                          ) : (
                            <p className="text-[11px] text-slate-400 italic">No notes logged yet</p>
                          )}

                          {vendor.nextFollowUpDate && (
                            <div className="flex items-center space-x-1 text-[10px] text-amber-700 font-semibold">
                              <Calendar className="w-3 h-3" />
                              <span>Follow-up: {vendor.nextFollowUpDate}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Open Card Details */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => onSelectVendor(vendor)}
                          className="bg-slate-100 hover:bg-teal-700 hover:text-white text-slate-700 font-bold px-3 py-1.5 rounded-lg transition text-xs inline-flex items-center space-x-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Notes</span>
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Page <b>{currentPage}</b> of <b>{totalPages}</b>
          </span>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-2 py-1 rounded bg-white border border-slate-300 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
            >
              ⏮ First
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 flex items-center space-x-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            {/* Page number indicators */}
            <span className="px-2 font-bold text-teal-800">
              {currentPage}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 flex items-center space-x-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 rounded bg-white border border-slate-300 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
            >
              Last ⏭
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
