import { Router } from 'express';
import multer from 'multer';
import { extractionController } from '../controllers/extractionController.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 30 * 1024 * 1024, // 30 MB max
  },
});

export const apiRouter = Router();

// Health check
apiRouter.get('/health', (req, res) => extractionController.getHealth(req, res));

// Upload field sheet / sample card / site photo -> OCR -> Excel -> Database sync
apiRouter.post('/extract', upload.single('file'), (req, res) =>
  extractionController.uploadAndExtract(req, res)
);

// Download standardized borehole log (.xlsx) directly
apiRouter.get('/export-xlsx', (req, res) =>
  extractionController.downloadStandardXlsx(req, res)
);

