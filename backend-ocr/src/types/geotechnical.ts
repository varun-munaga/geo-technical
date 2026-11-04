export interface GeotechnicalLogRow {
  runNo?: number;
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
  waterTableDepth?: number | null;
  notes?: string;
}

export interface SampleCardMetadata {
  projectCode?: string;
  projectName?: string;
  boreholeNo?: string;
  sampleId?: string;
  depthFrom?: number;
  depthTo?: number;
  date?: string;
  samplerType?: string;
  fieldEngineer?: string;
  remarks?: string;
}

export interface ExtractionResult {
  docType: 'field_sheet' | 'sample_card' | 'site_photo';
  metadata: {
    projectName?: string;
    clientName?: string;
    projectCode?: string;
    boreholeNo?: string;
    date?: string;
    groundElevation?: number;
    waterLevelEncountered?: boolean;
    waterTableDepth?: number;
    rigType?: string;
    engineerName?: string;
  };
  rows: GeotechnicalLogRow[];
  confidence: number;
  rawText?: string;
}

export interface ExcelGenerationOptions {
  projectName: string;
  clientName: string;
  boreholeNo: string;
  projectCode?: string;
  location?: string;
  groundElevation?: number;
  rigType?: string;
  drillingMethod?: string;
  dateStarted?: string;
  dateCompleted?: string;
  fieldEngineer?: string;
  waterTableDepth?: number | null;
  rows: GeotechnicalLogRow[];
}

