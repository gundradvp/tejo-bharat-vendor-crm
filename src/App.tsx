import React, { useState, useEffect, useMemo } from 'react';
import { 
  initializeCRMData, 
  updateVendor, 
  addVendorNote, 
  importNewDistrict, 
  deleteDistrictFromDB 
} from './services/storageService';
import { Vendor, DistrictSummary, PipelineStage, Priority, CallOutcome } from './types/vendor';
import { Navbar } from './components/Navbar';
import { DashboardMetrics } from './components/DashboardMetrics';
import { VendorList } from './components/VendorList';
import { KanbanBoard } from './components/KanbanBoard';
import { FollowUpQueue } from './components/FollowUpQueue';
import { VendorDetailModal } from './components/VendorDetailModal';
import { PowerDialerModal } from './components/PowerDialerModal';
import { ImportDistrictModal } from './components/ImportDistrictModal';
import { SalesPitchDrawer } from './components/SalesPitchDrawer';
import { ExportBackupModal } from './components/ExportBackupModal';
import { isFollowUpDueToday } from './utils/formatters';
import { Sun, Loader2, CheckCircle2 } from 'lucide-react';

export function App() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [districts, setDistricts] = useState<DistrictSummary[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeView, setActiveView] = useState<'list' | 'kanban' | 'followups'>('list');

  // Modals
  const [selectedVendorKey, setSelectedVendorKey] = useState<string | null>(null);
  const [isPowerDialerOpen, setIsPowerDialerOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isPitchOpen, setIsPitchOpen] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Initial Data Load
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const { vendors: loadedVendors, districts: loadedDistricts } = await initializeCRMData();
        setVendors(loadedVendors);
        setDistricts(loadedDistricts);
        if (loadedDistricts.length > 0) {
          setSelectedDistrict(loadedDistricts[0].name);
        }
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Filtered vendors for currently active district
  const districtVendors = useMemo(() => {
    if (selectedDistrict === 'all') return vendors;
    return vendors.filter(v => v.district.toLowerCase() === selectedDistrict.toLowerCase());
  }, [vendors, selectedDistrict]);

  // Active selected vendor object
  const selectedVendor = useMemo(() => {
    if (!selectedVendorKey) return null;
    return vendors.find(v => v.uniqueKey === selectedVendorKey) || null;
  }, [vendors, selectedVendorKey]);

  // Counts for Badges
  const dueFollowUpCount = useMemo(() => {
    return districtVendors.filter(v => isFollowUpDueToday(v.nextFollowUpDate)).length;
  }, [districtVendors]);

  const hotLeadsCount = useMemo(() => {
    return districtVendors.filter(v => v.priority === 'HOT' || v.pipelineStage === 'INTERESTED').length;
  }, [districtVendors]);

  // Power dialer queue
  const dialerQueue = useMemo(() => {
    const pool = [...districtVendors];
    pool.sort((a, b) => {
      if (a.pipelineStage === 'NEW' && b.pipelineStage !== 'NEW') return -1;
      if (b.pipelineStage === 'NEW' && a.pipelineStage !== 'NEW') return 1;
      if (a.priority === 'HOT' && b.priority !== 'HOT') return -1;
      if (b.priority === 'HOT' && a.priority !== 'HOT') return 1;
      return 0;
    });
    return pool;
  }, [districtVendors]);

  // Modal navigation
  const currentVendorIndex = useMemo(() => {
    if (!selectedVendorKey) return -1;
    return districtVendors.findIndex(v => v.uniqueKey === selectedVendorKey);
  }, [districtVendors, selectedVendorKey]);

  const handleNextVendor = () => {
    if (currentVendorIndex >= 0 && currentVendorIndex < districtVendors.length - 1) {
      setSelectedVendorKey(districtVendors[currentVendorIndex + 1].uniqueKey);
    }
  };

  const handlePrevVendor = () => {
    if (currentVendorIndex > 0) {
      setSelectedVendorKey(districtVendors[currentVendorIndex - 1].uniqueKey);
    }
  };

  // Handlers
  const handleUpdateVendor = async (vendorKey: string, updates: Partial<Vendor>) => {
    const updated = await updateVendor(vendorKey, updates, vendors);
    setVendors(updated);
    showToast('Vendor updated');
  };

  const handleAddNote = async (
    vendorKey: string, 
    noteData: {
      content: string;
      callOutcome?: CallOutcome | string;
      nextFollowUpDate?: string | null;
      stageChange?: PipelineStage;
      priorityChange?: Priority;
      solarRequirement?: Vendor['solarRequirement'];
    }
  ) => {
    const updated = await addVendorNote(vendorKey, noteData, vendors);
    setVendors(updated);
    showToast('Call note logged!');
  };

  const handleUpdateStage = async (vendorKey: string, newStage: PipelineStage) => {
    const updated = await updateVendor(vendorKey, { pipelineStage: newStage }, vendors);
    setVendors(updated);
    showToast(`Lead moved to ${newStage}`);
  };

  const handleQuickCall = async (vendor: Vendor) => {
    if (vendor.pipelineStage === 'NEW') {
      const updated = await updateVendor(vendor.uniqueKey, { 
        pipelineStage: 'CONTACTED',
        lastContactedAt: new Date().toISOString()
      }, vendors);
      setVendors(updated);
    }
    setSelectedVendorKey(vendor.uniqueKey);
  };

  const handleImportDistrict = async (name: string, rawList: any[], fileName: string) => {
    const result = await importNewDistrict(name, rawList, fileName, vendors, districts);
    setVendors(result.updatedVendors);
    setDistricts(result.updatedDistricts);
    setSelectedDistrict(name);
    showToast(`Imported ${result.addedCount} vendors for ${name}`);
  };

  const handleDeleteDistrict = async (name: string) => {
    const result = await deleteDistrictFromDB(name, vendors, districts);
    setVendors(result.updatedVendors);
    setDistricts(result.updatedDistricts);
    setSelectedDistrict('all');
    showToast(`District ${name} removed`);
  };

  const handleDataRestored = (restoredVendors: Vendor[], restoredDistricts: DistrictSummary[]) => {
    setVendors(restoredVendors);
    setDistricts(restoredDistricts);
    if (restoredDistricts.length > 0) {
      setSelectedDistrict(restoredDistricts[0].name);
    }
    showToast('Backup restored successfully!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4 space-y-4">
        <div className="w-20 h-20 rounded-3xl bg-slate-800/80 border border-teal-500/30 flex items-center justify-center p-3 shadow-2xl shadow-teal-900/50">
          <img src="/logo.png" alt="Tejo Bharat" className="w-full h-full object-contain animate-pulse" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-amber-200">
            TEJO BHARAT SOLAR CRM
          </h2>
          <p className="text-xs text-teal-300/80 flex items-center justify-center space-x-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Loading Anakapalli vendor database...</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Toast Notification (Safe from mobile bottom nav bar) */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-teal-600 text-xs font-bold flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top App Bar & Mobile Bottom Navigation */}
      <Navbar
        districts={districts}
        selectedDistrict={selectedDistrict}
        onSelectDistrict={setSelectedDistrict}
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenPowerDialer={() => setIsPowerDialerOpen(true)}
        onOpenImport={() => setIsImportOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenPitch={() => setIsPitchOpen(true)}
        dueFollowUpCount={dueFollowUpCount}
        hotLeadsCount={hotLeadsCount}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-5 flex-1 w-full">
        
        {/* KPI Metrics Dashboard */}
        <DashboardMetrics
          vendors={districtVendors}
          districtName={selectedDistrict === 'all' ? 'All Districts' : selectedDistrict}
        />

        {/* Views */}
        {activeView === 'list' && (
          <VendorList
            vendors={districtVendors}
            selectedDistrict={selectedDistrict}
            onSelectVendor={(v) => setSelectedVendorKey(v.uniqueKey)}
            onQuickCall={handleQuickCall}
            onUpdateStage={handleUpdateStage}
          />
        )}

        {activeView === 'kanban' && (
          <KanbanBoard
            vendors={districtVendors}
            selectedDistrict={selectedDistrict}
            onSelectVendor={(v) => setSelectedVendorKey(v.uniqueKey)}
            onUpdateStage={handleUpdateStage}
          />
        )}

        {activeView === 'followups' && (
          <FollowUpQueue
            vendors={districtVendors}
            onSelectVendor={(v) => setSelectedVendorKey(v.uniqueKey)}
            onQuickCall={handleQuickCall}
          />
        )}

      </main>

      {/* MODALS & BOTTOM SHEETS */}

      {/* 1. Mobile Bottom Sheet / Detail Modal */}
      {selectedVendor && (
        <VendorDetailModal
          vendor={selectedVendor}
          onClose={() => setSelectedVendorKey(null)}
          onUpdateVendor={handleUpdateVendor}
          onAddNote={handleAddNote}
          onNextVendor={handleNextVendor}
          onPrevVendor={handlePrevVendor}
          hasNext={currentVendorIndex < districtVendors.length - 1}
          hasPrev={currentVendorIndex > 0}
        />
      )}

      {/* 2. Fullscreen Mobile Speed Dialer */}
      {isPowerDialerOpen && (
        <PowerDialerModal
          queue={dialerQueue}
          onClose={() => setIsPowerDialerOpen(false)}
          onAddNoteAndAdvance={handleAddNote}
        />
      )}

      {/* 3. Import District Modal */}
      {isImportOpen && (
        <ImportDistrictModal
          districts={districts}
          onClose={() => setIsImportOpen(false)}
          onImportDistrict={handleImportDistrict}
          onDeleteDistrict={handleDeleteDistrict}
        />
      )}

      {/* 4. Sales Pitch Drawer */}
      <SalesPitchDrawer
        isOpen={isPitchOpen}
        onClose={() => setIsPitchOpen(false)}
      />

      {/* 5. Export / Backup Modal */}
      {isExportOpen && (
        <ExportBackupModal
          onClose={() => setIsExportOpen(false)}
          vendors={vendors}
          districts={districts}
          onDataRestored={handleDataRestored}
        />
      )}

      {/* Desktop Footer */}
      <footer className="hidden lg:block bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-4 text-center">
        <p>
          Tejo Bharat Global Energy LLP • Rooftop Solar B2B CRM • 
          <span className="text-teal-400 ml-1 font-semibold">"Go Solar. Pay ₹0 for Electricity"</span>
        </p>
      </footer>

    </div>
  );
}

export default App;
