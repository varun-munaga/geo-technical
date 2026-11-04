import { Request, Response } from 'express';
import { ocrExtractorService } from '../services/ocrExtractor.js';
import { excelGeneratorService } from '../services/excelGenerator.js';
import { supabaseService } from '../services/supabaseService.js';
import { geminiVisionService } from '../services/geminiVisionService.js';
import { GeotechnicalLogRow } from '../types/geotechnical.js';

export class ExtractionController {
  /**
   * Process an uploaded physical field log sheet or specimen card.
   * Extracts tabular geotechnical records, creates XLSX, uploads to storage, and persists to DB.
   */
  public async uploadAndExtract(req: Request, res: Response): Promise<void> {
    try {
      const file = req.file;
      const {
        attachment_id,
        borehole_id,
        engineer_id,
        project_name,
        borehole_no,
        attachment_type = 'field_sheet',
      } = req.body;

      if (!file) {
        res.status(400).json({ error: 'No image or document file was uploaded in request field "file".' });
        return;
      }

      console.log(`[OCR Engine] Processing ${file.originalname} (${file.size} bytes, type: ${attachment_type})...`);

      // 1. Run extraction pipeline
      const extracted = await ocrExtractorService.processDocument(file.buffer, file.mimetype, {
        documentType: attachment_type as any,
        projectName: project_name || 'Metro Line Extension - Site A',
        boreholeNo: borehole_no || 'BH-01',
        fileName: file.originalname,
      });

      // 2. Generate Standardized Geotechnical Excel (.xlsx)
      const xlsxFileName = `${(extracted.metadata.projectCode || 'GEOTECH').replace(/[^a-zA-Z0-9_-]/g, '_')}_${(extracted.metadata.boreholeNo || 'BH').replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}.xlsx`;

      const xlsxBuffer = await excelGeneratorService.generateBoreholeLog({
        projectName: extracted.metadata.projectName || project_name || 'Geotechnical Site Investigation',
        clientName: extracted.metadata.clientName || 'Infrastructure Authority',
        projectCode: extracted.metadata.projectCode || 'SITE-A',
        boreholeNo: extracted.metadata.boreholeNo || borehole_no || 'BH-01',
        waterTableDepth: extracted.metadata.waterTableDepth,
        fieldEngineer: extracted.metadata.engineerName,
        rows: extracted.rows,
      });

      // 3. Save Excel to Supabase Storage
      const xlsxUrl = await supabaseService.uploadExcel(xlsxFileName, xlsxBuffer);

      // 4. Update Supabase DB records if IDs are provided
      let savedLogCount = 0;
      if (attachment_id) {
        await supabaseService.updateAttachmentOcr(attachment_id, extracted, xlsxUrl);
      }

      if (borehole_id && engineer_id && extracted.rows.length > 0) {
        savedLogCount = await supabaseService.syncExtractedLogsToDatabase(
          borehole_id,
          engineer_id,
          extracted.rows
        );
      }

      res.status(200).json({
        success: true,
        message: 'Physical document successfully parsed and standardized Excel created.',
        data: {
          docType: extracted.docType,
          confidence: extracted.confidence,
          metadata: extracted.metadata,
          rowCount: extracted.rows.length,
          rows: extracted.rows,
          generatedXlsxUrl: xlsxUrl,
          dbRecordsInserted: savedLogCount,
          rawTextSummary: extracted.rawText,
        },
      });
    } catch (error: any) {
      console.error('[OCR Engine] Error processing document:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'An unexpected error occurred during OCR extraction.',
      });
    }
  }

  /**
   * Direct trigger to download standardized Excel for a given project or borehole.
   */
  public async downloadStandardXlsx(req: Request, res: Response): Promise<void> {
    try {
      const {
        projectName = 'Metro Line Extension - Site A',
        clientName = 'Hyderabad Metro Rail Corporation (HMRCL)',
        boreholeNo = 'BH-01',
        projectCode = 'METRO-EXT-A',
        rowsJson,
      } = req.query;

      let rows: GeotechnicalLogRow[] = [];
      if (typeof rowsJson === 'string') {
        try {
          rows = JSON.parse(rowsJson);
        } catch {
          // ignore parsing error, use default
        }
      }

      const buffer = await excelGeneratorService.generateBoreholeLog({
        projectName: String(projectName),
        clientName: String(clientName),
        boreholeNo: String(boreholeNo),
        projectCode: String(projectCode),
        rows,
      });

      const fileName = `Borehole_Log_${boreholeNo}_${Date.now()}.xlsx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.status(200).send(buffer);
    } catch (error: any) {
      console.error('Error generating direct Excel download:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Health Check and Engine Diagnostics
   */
  public getHealth(_req: Request, res: Response): void {
    res.status(200).json({
      status: 'online',
      service: 'Geotechnical OCR & Excel Generator Pipeline',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      engines: {
        geminiVisionAvailable: geminiVisionService.isAvailable(),
        heuristicGeotechParserActive: true,
        excelJsEngine: 'Ready',
        supabaseConfigured: Boolean(supabaseService.getClient()),
      },
    });
  }
}

export const extractionController = new ExtractionController();

