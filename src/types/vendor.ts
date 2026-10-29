export type PipelineStage = 
  | 'NEW'
  | 'CONTACTED'
  | 'INTERESTED'
  | 'QUOTE_SENT'
  | 'FOLLOW_UP'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST'
  | 'DO_NOT_CALL';

export type Priority = 'HOT' | 'WARM' | 'COLD' | 'NORMAL';

export type CallOutcome = 
  | 'ANSWERED'
  | 'BUSY'
  | 'NO_ANSWER'
  | 'SWITCHED_OFF'
  | 'CALLBACK_REQUESTED'
  | 'WRONG_NUMBER';

export interface VendorBrand {
  brandName: string;
  brandId?: number;
  documentUrl?: string | null;
}

export interface CapacityStat {
  vendorId?: number;
  installationCount: number;
  installedCapacity: number;
}

export interface SolarRequirement {
  estimatedMonthlyKW?: number;
  preferredPanelType?: string;
  quotedPricePerWatt?: number;
  currentSupplier?: string;
}

export interface VendorNote {
  id: string;
  vendorId: number;
  district: string;
  createdAt: string;
  callOutcome?: CallOutcome | string;
  content: string;
  nextFollowUpDate?: string | null;
  stageChange?: PipelineStage;
  author?: string;
}

export interface RawVendorJSON {
  id?: number;
  vendorId: number;
  vendorName: string;
  previousVendorName?: string | null;
  contactPersonName?: string;
  contactPersonEmail?: string | null;
  contactPersonMobile?: string;
  address?: string;
  websiteUrl?: string | null;
  rating?: number | null;
  consumerRatingCount?: number;
  vendorBrandsList?: VendorBrand[];
  nationwiseInstallationAndCapacity?: CapacityStat;
  statewiseInstallationAndCapacity?: CapacityStat;
  districtwiseInstallationAndCapacity?: CapacityStat;
}

export interface Vendor extends RawVendorJSON {
  // Composite unique ID to support multiple districts cleanly
  uniqueKey: string;
  district: string;
  
  // CRM States
  pipelineStage: PipelineStage;
  priority: Priority;
  lastCallOutcome?: CallOutcome | null;
  lastContactedAt?: string | null;
  nextFollowUpDate?: string | null;
  solarRequirement?: SolarRequirement;
  tags: string[];
  notes: VendorNote[];
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DistrictSummary {
  id: string;
  name: string;
  totalVendors: number;
  contactedCount: number;
  interestedCount: number;
  fileName: string;
  importedAt: string;
}

export interface FilterState {
  searchQuery: string;
  district: string; // 'all' or district id
  pipelineStage: string; // 'all' or PipelineStage
  priority: string; // 'all' or Priority
  callStatus: string; // 'all' | 'called' | 'uncalled'
  onlyFollowUpsToday: boolean;
  minCapacity: number;
  sortBy: 'name' | 'capacity' | 'rating' | 'lastContacted' | 'priority';
  sortOrder: 'asc' | 'desc';
}
