export type UserRole = 'admin' | 'manager' | 'field_engineer';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone_number?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Project {
  id: string;
  project_code: string;
  project_name: string;
  client_name: string;
  location_address?: string;
  city?: string;
  state?: string;
  status: 'active' | 'completed';
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Borehole {
  id: string;
  project_id: string;
  borehole_no: string;
  depth_target_m: number;
  depth_drilled_m: number;
  status: 'planned' | 'in_progress' | 'completed' | 'suspended';
  ground_elevation_m?: number;
  latitude?: number;
  longitude?: number;
  rig_type?: string;
  drilling_method?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export type VerificationStatus = 'Pending Review' | 'Approved' | 'Flagged for Re-test';

export interface SiteLog {
  id: string;
  borehole_id: string;
  engineer_id: string;
  depth_from_m: number;
  depth_to_m: number;
  sample_no?: string;
  strata_classification: string;
  color_description?: string;
  density_consistency?: string;
  spt_blows_15cm?: number | null;
  spt_blows_30cm?: number | null;
  spt_blows_45cm?: number | null;
  spt_n_value?: number | null;
  core_recovery_pct?: number | null;
  rqd_pct?: number | null;
  water_table_depth_m?: number | null;
  water_table_encountered: boolean;
  notes?: string;
  gps_lat?: number | null;
  gps_long?: number | null;
  gps_accuracy_m?: number | null;
  verification_status: VerificationStatus;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  review_comments?: string | null;
  created_at: string;
  updated_at: string;

  // Joined relations for table view
  borehole?: Borehole;
  project?: Project;
  engineer?: User;
  attachments?: LogAttachment[];
}

export interface LogAttachment {
  id: string;
  log_id: string;
  attachment_type: 'site_photo' | 'sample_card' | 'field_sheet';
  file_url: string;
  mime_type?: string;
  file_size_bytes?: number;
  extracted_text_json?: any;
  generated_xlsx_url?: string | null;
  ocr_status?: 'pending' | 'processing' | 'completed' | 'failed';
  ocr_processed_at?: string;
  created_at: string;
}

