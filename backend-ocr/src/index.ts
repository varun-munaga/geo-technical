import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { apiRouter } from './routes/apiRoutes.js';

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Mount API routes
app.use('/api', apiRouter);

// Root greeting
app.get('/', (_req, res) => {
  res.json({
    platform: 'Geotechnical Operations Platform OCR & Excel API',
    status: 'Operational',
    endpoints: {
      health: 'GET /api/health',
      extract: 'POST /api/extract (form-data: file, borehole_id, engineer_id, attachment_type)',
      exportXlsx: 'GET /api/export-xlsx?boreholeNo=BH-01',
    },
  });
});

app.listen(config.port, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Geotechnical OCR & Excel Service listening on port ${config.port}`);
  console.log(`📊 Mode: ${config.nodeEnv}`);
  console.log(`📡 Health Check: http://localhost:${config.port}/api/health`);
  console.log(`=======================================================`);
});

