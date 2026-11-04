import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  supabase: {
    url: process.env.SUPABASE_URL || 'http://localhost:54321',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    storageBucketExcel: 'generated-xlsx',
    storageBucketSheets: 'field-sheets',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
  },
};

