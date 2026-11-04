import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config.js';
import { ExtractionResult } from '../types/geotechnical.js';

export class GeminiVisionService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    if (config.gemini.apiKey) {
      try {
        this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
      } catch (err) {
        console.warn('Failed to initialize GoogleGenerativeAI:', err);
      }
    }
  }

  public isAvailable(): boolean {
    return Boolean(this.genAI && config.gemini.apiKey);
  }

  public async extractFromImage(
    imageBuffer: Buffer,
    mimeType: string,
    promptHint?: string
  ): Promise<ExtractionResult | null> {
    if (!this.genAI) return null;

    try {
      const base64Data = imageBuffer.toString('base64');
      const prompt = `
You are an expert geotechnical engineer and computer vision specialist.
Analyze this uploaded geotechnical document image (which can be a handwritten/printed Physical Field Borehole Log Sheet, a specimen Sample Tag Card, or a Site Rig photo).

Extract structured geotechnical information into STRICT JSON matching this schema:
{
  "docType": "field_sheet" | "sample_card" | "site_photo",
  "metadata": {
    "projectName": string,
    "clientName": string,
    "projectCode": string,
    "boreholeNo": string,
    "date": string,
    "groundElevation": number,
    "waterLevelEncountered": boolean,
    "waterTableDepth": number,
    "rigType": string,
    "engineerName": string
  },
  "rows": [
    {
      "runNo": number,
      "depthFrom": number,
      "depthTo": number,
      "sampleNo": string,
      "strataClassification": string,
      "colorDescription": string,
      "densityConsistency": string,
      "sptBlows15cm": number | null,
      "sptBlows30cm": number | null,
      "sptBlows45cm": number | null,
      "sptNValue": number | null,
      "coreRecoveryPct": number | null,
      "rqdPct": number | null,
      "waterTableDepth": number | null,
      "notes": string
    }
  ],
  "confidence": number between 0.0 and 1.0,
  "rawText": string summary of extracted document text
}

Rules:
- Standard Penetration Test (SPT) N-value is typically sptBlows30cm + sptBlows45cm. If printed or calculated, populate both.
- If it is a Sample Tag Card, populate metadata (projectCode, boreholeNo, sampleId, depth range, date) and 1 row for that sample.
- If it is a physical log sheet, extract all tabular stratum depth intervals, lithology descriptions, and SPT / Core Recovery data.
- Output ONLY pure JSON. No markdown ticks, no preamble.
${promptHint ? `Context Hint: ${promptHint}` : ''}
`;

      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: base64Data,
          },
        },
      ]);

      const response = await result.response;
      const responseText = response.text() || '';
      const cleanedJson = responseText
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

      const parsed: ExtractionResult = JSON.parse(cleanedJson);
      return parsed;
    } catch (error) {
      console.error('Gemini Vision extraction error:', error);
      return null;
    }
  }
}

export const geminiVisionService = new GeminiVisionService();
