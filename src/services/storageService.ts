import { get, set, del } from 'idb-keyval';
import { Vendor, RawVendorJSON, VendorNote, DistrictSummary, PipelineStage, Priority, CallOutcome } from '../types/vendor';

const VENDORS_STORAGE_KEY = 'tb_crm_vendors_v1';
const DISTRICTS_STORAGE_KEY = 'tb_crm_districts_v1';

export const DEFAULT_DISTRICT: DistrictSummary = {
  id: 'anakapalli',
  name: 'Anakapalli',
  totalVendors: 1890,
  contactedCount: 0,
  interestedCount: 0,
  fileName: 'anakapalli.json',
  importedAt: new Date().toISOString()
};

function normalizeVendor(raw: RawVendorJSON, districtName: string): Vendor {
  const now = new Date().toISOString();
  return {
    ...raw,
    uniqueKey: `${districtName.toLowerCase()}_${raw.vendorId}`,
    district: districtName,
    pipelineStage: 'NEW',
    priority: (raw.nationwiseInstallationAndCapacity?.installedCapacity ?? 0) > 50 ? 'HOT' : 'NORMAL',
    lastCallOutcome: null,
    lastContactedAt: null,
    nextFollowUpDate: null,
    tags: raw.vendorBrandsList?.map(b => b.brandName) || [],
    notes: [],
    isPinned: false,
    createdAt: now,
    updatedAt: now
  };
}

export async function initializeCRMData(): Promise<{ vendors: Vendor[]; districts: DistrictSummary[] }> {
  try {
    let existingVendors = await get<Vendor[]>(VENDORS_STORAGE_KEY);
    let existingDistricts = await get<DistrictSummary[]>(DISTRICTS_STORAGE_KEY);

    if (!existingVendors || existingVendors.length === 0) {
      console.log('Loading default Anakapalli vendor data from /data/anakapalli.json...');
      const response = await fetch('/data/anakapalli.json');
      if (response.ok) {
        const rawList: RawVendorJSON[] = await response.json();
        const normalized = rawList.map(item => normalizeVendor(item, 'Anakapalli'));
        
        const anakapalliDistrict: DistrictSummary = {
          ...DEFAULT_DISTRICT,
          totalVendors: normalized.length,
          importedAt: new Date().toISOString()
        };

        existingVendors = normalized;
        existingDistricts = [anakapalliDistrict];

        await set(VENDORS_STORAGE_KEY, existingVendors);
        await set(DISTRICTS_STORAGE_KEY, existingDistricts);
      } else {
        existingVendors = [];
        existingDistricts = [];
      }
    }

    if (!existingDistricts) {
      existingDistricts = [];
    }

    return {
      vendors: existingVendors,
      districts: existingDistricts
    };
  } catch (error) {
    console.error('Failed to initialize CRM data from IndexedDB:', error);
    return { vendors: [], districts: [] };
  }
}

export async function saveAllVendors(vendors: Vendor[]): Promise<void> {
  await set(VENDORS_STORAGE_KEY, vendors);
}

export async function saveDistricts(districts: DistrictSummary[]): Promise<void> {
  await set(DISTRICTS_STORAGE_KEY, districts);
}

export async function updateVendor(
  vendorKey: string,
  updates: Partial<Vendor>,
  currentVendors: Vendor[]
): Promise<Vendor[]> {
  const updatedVendors = currentVendors.map(v => {
    if (v.uniqueKey === vendorKey) {
      return {
        ...v,
        ...updates,
        updatedAt: new Date().toISOString()
      };
    }
    return v;
  });

  await saveAllVendors(updatedVendors);
  return updatedVendors;
}

export async function addVendorNote(
  vendorKey: string,
  noteData: {
    content: string;
    callOutcome?: CallOutcome | string;
    nextFollowUpDate?: string | null;
    stageChange?: PipelineStage;
    priorityChange?: Priority;
    solarRequirement?: Vendor['solarRequirement'];
  },
  currentVendors: Vendor[]
): Promise<Vendor[]> {
  const now = new Date().toISOString();
  
  const updatedVendors = currentVendors.map(v => {
    if (v.uniqueKey === vendorKey) {
      const newNote: VendorNote = {
        id: 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        vendorId: v.vendorId,
        district: v.district,
        createdAt: now,
        content: noteData.content,
        callOutcome: noteData.callOutcome,
        nextFollowUpDate: noteData.nextFollowUpDate,
        stageChange: noteData.stageChange,
        author: 'Tejo Bharat Sales'
      };

      const updatedStage = noteData.stageChange || (v.pipelineStage === 'NEW' ? 'CONTACTED' : v.pipelineStage);
      const updatedOutcome = (noteData.callOutcome as CallOutcome) || v.lastCallOutcome;

      return {
        ...v,
        notes: [newNote, ...(v.notes || [])],
        lastContactedAt: now,
        lastCallOutcome: updatedOutcome,
        nextFollowUpDate: noteData.nextFollowUpDate !== undefined ? noteData.nextFollowUpDate : v.nextFollowUpDate,
        pipelineStage: updatedStage,
        priority: noteData.priorityChange || v.priority,
        solarRequirement: noteData.solarRequirement ? { ...v.solarRequirement, ...noteData.solarRequirement } : v.solarRequirement,
        updatedAt: now
      };
    }
    return v;
  });

  await saveAllVendors(updatedVendors);
  return updatedVendors;
}

export async function importNewDistrict(
  districtName: string,
  rawList: RawVendorJSON[],
  fileName: string,
  currentVendors: Vendor[],
  currentDistricts: DistrictSummary[]
): Promise<{ updatedVendors: Vendor[]; updatedDistricts: DistrictSummary[]; addedCount: number }> {
  const normalizedNewVendors = rawList.map(raw => normalizeVendor(raw, districtName));
  
  // Create a map by uniqueKey to avoid duplicates while updating or merging
  const existingMap = new Map(currentVendors.map(v => [v.uniqueKey, v]));
  let addedCount = 0;

  normalizedNewVendors.forEach(nv => {
    if (!existingMap.has(nv.uniqueKey)) {
      existingMap.set(nv.uniqueKey, nv);
      addedCount++;
    }
  });

  const allVendors = Array.from(existingMap.values());
  const districtSlug = districtName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
  
  const existingDistrictIndex = currentDistricts.findIndex(d => d.id === districtSlug);
  let updatedDistricts = [...currentDistricts];

  const districtItem: DistrictSummary = {
    id: districtSlug,
    name: districtName,
    totalVendors: allVendors.filter(v => v.district.toLowerCase() === districtName.toLowerCase()).length,
    contactedCount: allVendors.filter(v => v.district.toLowerCase() === districtName.toLowerCase() && v.pipelineStage !== 'NEW').length,
    interestedCount: allVendors.filter(v => v.district.toLowerCase() === districtName.toLowerCase() && ['INTERESTED', 'QUOTE_SENT', 'NEGOTIATION', 'WON'].includes(v.pipelineStage)).length,
    fileName,
    importedAt: new Date().toISOString()
  };

  if (existingDistrictIndex >= 0) {
    updatedDistricts[existingDistrictIndex] = districtItem;
  } else {
    updatedDistricts.push(districtItem);
  }

  await saveAllVendors(allVendors);
  await saveDistricts(updatedDistricts);

  return {
    updatedVendors: allVendors,
    updatedDistricts,
    addedCount
  };
}

export async function deleteDistrictFromDB(
  districtName: string,
  currentVendors: Vendor[],
  currentDistricts: DistrictSummary[]
): Promise<{ updatedVendors: Vendor[]; updatedDistricts: DistrictSummary[] }> {
  const remainingVendors = currentVendors.filter(v => v.district.toLowerCase() !== districtName.toLowerCase());
  const remainingDistricts = currentDistricts.filter(d => d.name.toLowerCase() !== districtName.toLowerCase());

  await saveAllVendors(remainingVendors);
  await saveDistricts(remainingDistricts);

  return {
    updatedVendors: remainingVendors,
    updatedDistricts: remainingDistricts
  };
}

export function exportVendorsToCSV(vendors: Vendor[]): void {
  const headers = [
    'Vendor ID',
    'Vendor Name',
    'Contact Person',
    'Mobile',
    'Email',
    'District',
    'Address',
    'Pipeline Stage',
    'Priority',
    'Last Call Outcome',
    'Last Contacted At',
    'Next Follow-Up',
    'Installed Capacity (kW)',
    'Installation Count',
    'Estimated Req (kW)',
    'Quoted Price (₹/Wp)',
    'Notes Count',
    'Latest Note'
  ];

  const escapeCSV = (str: any) => {
    if (str === null || str === undefined) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = vendors.map(v => {
    const latestNote = v.notes && v.notes.length > 0 ? v.notes[0].content : '';
    return [
      escapeCSV(v.vendorId),
      escapeCSV(v.vendorName),
      escapeCSV(v.contactPersonName || ''),
      escapeCSV(v.contactPersonMobile || ''),
      escapeCSV(v.contactPersonEmail || ''),
      escapeCSV(v.district),
      escapeCSV(v.address || ''),
      escapeCSV(v.pipelineStage),
      escapeCSV(v.priority),
      escapeCSV(v.lastCallOutcome || 'None'),
      escapeCSV(v.lastContactedAt ? new Date(v.lastContactedAt).toLocaleString() : 'Never'),
      escapeCSV(v.nextFollowUpDate || 'None'),
      escapeCSV(v.nationwiseInstallationAndCapacity?.installedCapacity ?? 0),
      escapeCSV(v.nationwiseInstallationAndCapacity?.installationCount ?? 0),
      escapeCSV(v.solarRequirement?.estimatedMonthlyKW ?? ''),
      escapeCSV(v.solarRequirement?.quotedPricePerWatt ?? ''),
      escapeCSV(v.notes?.length || 0),
      escapeCSV(latestNote)
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `tejo_bharat_solar_vendors_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportBackupJSON(vendors: Vendor[], districts: DistrictSummary[]): void {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    districts,
    vendors
  };
  const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', jsonStr);
  link.setAttribute('download', `tejo_bharat_crm_backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function restoreBackupJSON(
  fileContent: string
): Promise<{ vendors: Vendor[]; districts: DistrictSummary[] }> {
  const parsed = JSON.parse(fileContent);
  if (!parsed.vendors || !Array.isArray(parsed.vendors)) {
    throw new Error('Invalid backup file: missing vendors array.');
  }
  const vendors: Vendor[] = parsed.vendors;
  const districts: DistrictSummary[] = parsed.districts || [];
  
  await saveAllVendors(vendors);
  await saveDistricts(districts);
  return { vendors, districts };
}
