import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config.js';
import { GeotechnicalLogRow } from '../types/geotechnical.js';

export class SupabaseService {
  private client: SupabaseClient | null = null;

  constructor() {
    if (config.supabase.url && (config.supabase.serviceRoleKey || config.supabase.anonKey)) {
      this.client = createClient(
        config.supabase.url,
        config.supabase.serviceRoleKey || config.supabase.anonKey,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        }
      );
    }
  }

  public getClient(): SupabaseClient | null {
    return this.client;
  }

  public async uploadExcel(fileName: string, fileBuffer: Buffer): Promise<string> {
    if (!this.client) {
      // Return a local/mock URL if Supabase is offline
      return `/storage/v1/object/public/${config.supabase.storageBucketExcel}/${fileName}`;
    }

    const { data, error } = await this.client.storage
      .from(config.supabase.storageBucketExcel)
      .upload(fileName, fileBuffer, {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        upsert: true,
      });

    if (error) {
      console.warn(`Storage upload warning (${error.message}), returning computed URL.`);
      const { data: pubData } = this.client.storage
        .from(config.supabase.storageBucketExcel)
        .getPublicUrl(fileName);
      return pubData.publicUrl;
    }

    const { data: pubData } = this.client.storage
      .from(config.supabase.storageBucketExcel)
      .getPublicUrl(data.path);

    return pubData.publicUrl;
  }

  public async updateAttachmentOcr(
    attachmentId: string,
    extractedData: any,
    generatedXlsxUrl?: string
  ): Promise<boolean> {
    if (!this.client) return false;

    const { error } = await this.client
      .from('log_attachments')
      .update({
        extracted_text_json: extractedData,
        generated_xlsx_url: generatedXlsxUrl || null,
        ocr_status: 'completed',
        ocr_processed_at: new Date().toISOString(),
      })
      .eq('id', attachmentId);

    if (error) {
      console.error('Failed to update attachment record:', error);
      return false;
    }
    return true;
  }

  public async syncExtractedLogsToDatabase(
    boreholeId: string,
    engineerId: string,
    rows: GeotechnicalLogRow[]
  ): Promise<number> {
    if (!this.client || rows.length === 0) return 0;

    const payload = rows.map((r) => ({
      borehole_id: boreholeId,
      engineer_id: engineerId,
      depth_from_m: r.depthFrom,
      depth_to_m: r.depthTo,
      sample_no: r.sampleNo,
      strata_classification: r.strataClassification,
      color_description: r.colorDescription || null,
      density_consistency: r.densityConsistency || null,
      spt_blows_15cm: r.sptBlows15cm ?? null,
      spt_blows_30cm: r.sptBlows30cm ?? null,
      spt_blows_45cm: r.sptBlows45cm ?? null,
      spt_n_value: r.sptNValue ?? (r.sptBlows30cm && r.sptBlows45cm ? r.sptBlows30cm + r.sptBlows45cm : null),
      core_recovery_pct: r.coreRecoveryPct ?? null,
      rqd_pct: r.rqdPct ?? null,
      water_table_depth_m: r.waterTableDepth ?? null,
      water_table_encountered: Boolean(r.waterTableDepth && r.waterTableDepth > 0),
      notes: r.notes || 'Parsed from physical site log sheet via OCR pipeline',
      verification_status: 'Pending Review',
    }));

    const { data, error } = await this.client.from('site_logs').insert(payload).select('id');
    if (error) {
      console.error('Error inserting extracted site logs to DB:', error);
      return 0;
    }
    return data?.length || 0;
  }
}

export const supabaseService = new SupabaseService();

