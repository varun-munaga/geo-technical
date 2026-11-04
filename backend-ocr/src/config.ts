import dotenv from 'dotenv';
dotenv.config();

function sanitizeSupabaseUrl(rawUrl?: string): string {
  const fallback = 'https://ribvbiqqbbhiibzcwcag.supabase.co';
  if (!rawUrl) return fallback;

  let url = rawUrl.trim();
  // Strip surrounding quotes if entered in Railway variable input
  if ((url.startsWith('"') && url.endsWith('"')) || (url.startsWith("'") && url.endsWith("'"))) {
    url = url.slice(1, -1).trim();
  }
  if (!url) return fallback;

  // Handle postgres connection strings accidentally pasted as SUPABASE_URL
  if (url.startsWith('postgres://') || url.startsWith('postgresql://')) {
    const match = url.match(/@(?:db\.)?([a-z0-9_-]+)\.supabase\.co/i);
    if (match && match[1]) {
      return `https://${match[1]}.supabase.co`;
    }
  }

  // Handle missing protocol (e.g. ribvbiqqbbhiibzcwcag.supabase.co or db.ribvbiqqbbhiibzcwcag.supabase.co)
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    if (url.startsWith('db.')) {
      url = url.replace(/^db\./, '');
    }
    url = `https://${url}`;
  }

  // Ensure trailing slash is removed
  url = url.replace(/\/+$/, '');

  return url;
}

function cleanEnvString(val?: string, fallback = ''): string {
  if (!val) return fallback;
  let str = val.trim();
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    str = str.slice(1, -1).trim();
  }
  return str || fallback;
}

const DEFAULT_SUPABASE_URL = 'https://ribvbiqqbbhiibzcwcag.supabase.co';
const DEFAULT_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpYnZiaXFxYmJoaWliemN3Y2FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNTA2MzYsImV4cCI6MjA4ODcyNjYzNn0.AWtid5kDDdn2yDEQIfSZFgowOTNaLe3NqrbUNrYYtOE';

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'production',
  supabase: {
    url: sanitizeSupabaseUrl(process.env.SUPABASE_URL),
    serviceRoleKey: cleanEnvString(process.env.SUPABASE_SERVICE_ROLE_KEY),
    anonKey: cleanEnvString(process.env.SUPABASE_ANON_KEY, DEFAULT_ANON_KEY),
    storageBucketExcel: cleanEnvString(process.env.SUPABASE_STORAGE_BUCKET_EXCEL, 'generated-xlsx'),
    storageBucketSheets: cleanEnvString(process.env.SUPABASE_STORAGE_BUCKET_SHEETS, 'field-sheets'),
  },
  gemini: {
    apiKey: cleanEnvString(process.env.GEMINI_API_KEY),
  },
};


