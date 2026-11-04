export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed';

export interface MobileQueuedLog {
  localId: string;
  projectId: string;
  projectName: string;
  projectCode: string;
  boreholeId: string;
  boreholeNo: string;
  engineerId: string;
  engineerName: string;
  depthFrom: number;
  depthTo: number;
  sampleNo: string;
  strataClassification: string;
  colorDescription?: string;
  densityConsistency?: string;
  sptBlows15cm?: number | null;
  sptBlows30cm?: number | null;
  sptBlows45cm?: number | null;
  sptNValue?: number | null;
  coreRecoveryPct?: number | null;
  rqdPct?: number | null;
  waterTableEncountered: boolean;
  waterTableDepth?: number | null;
  notes?: string;
  gpsLat: number;
  gpsLong: number;
  gpsAccuracy?: number;
  timestamp: string;
  photos: {
    sitePhotoUri?: string;
    sampleCardUri?: string;
    fieldSheetUri?: string;
  };
  syncStatus: SyncStatus;
  syncError?: string;
  remoteLogId?: string;
  remoteXlsxUrl?: string;
}

export interface MobileProject {
  id: string;
  project_code: string;
  project_name: string;
  client_name: string;
  location_address?: string;
  status: 'active' | 'completed';
  boreholes: MobileBorehole[];
}

export interface MobileBorehole {
  id: string;
  borehole_no: string;
  depth_target_m: number;
  depth_drilled_m: number;
  status: 'planned' | 'in_progress' | 'completed';
}

export interface FieldEngineerProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'field_engineer' | 'manager' | 'admin';
}

