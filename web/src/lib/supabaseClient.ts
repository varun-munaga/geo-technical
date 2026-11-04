import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SiteLog, VerificationStatus } from '../types';
import { mockSiteLogs, mockProjects, mockBoreholes, mockUsers } from './mockData';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseAnonKey &&
  supabaseAnonKey !== 'your-anon-key'
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Local In-Memory Reactive Store for Realtime simulation when Supabase backend is offline
let activeLogs: SiteLog[] = [...mockSiteLogs];
type LogListener = (logs: SiteLog[]) => void;
const listeners: Set<LogListener> = new Set();

export const notifyListeners = () => {
  listeners.forEach((fn) => fn([...activeLogs]));
};

export const subscribeToLogs = (listener: LogListener): (() => void) => {
  listeners.add(listener);
  // Send initial data immediately
  listener([...activeLogs]);

  // If real Supabase is configured, fetch initial records and set up Supabase Realtime channel
  let channel: any = null;
  if (supabase) {
    supabase
      .from('site_logs')
      .select(`
        *,
        borehole:boreholes(*),
        engineer:users(*),
        attachments:log_attachments(*)
      `)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          activeLogs = data.map((d: any) => ({
            ...d,
            project: mockProjects.find((p) => p.id === d.borehole?.project_id) || mockProjects[0],
          }));
          notifyListeners();
        }
      });

    channel = supabase
      .channel('realtime_site_logs')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_logs' },
        (payload) => {
          console.log('[Supabase Realtime] Event received:', payload);
          // If INSERT
          if (payload.eventType === 'INSERT') {
            const newLog = payload.new as any;
            const existing = activeLogs.find((l) => l.id === newLog.id);
            if (!existing) {
              const matchedBorehole = mockBoreholes.find((b) => b.id === newLog.borehole_id);
              const matchedProject = matchedBorehole ? mockProjects.find((p) => p.id === matchedBorehole.project_id) : undefined;
              const matchedEngineer = mockUsers.find((u) => u.id === newLog.engineer_id);
              activeLogs = [
                {
                  ...newLog,
                  borehole: matchedBorehole,
                  project: matchedProject,
                  engineer: matchedEngineer,
                  attachments: [],
                },
                ...activeLogs,
              ];
              notifyListeners();
            }
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as any;
            activeLogs = activeLogs.map((l) => (l.id === updated.id ? { ...l, ...updated } : l));
            notifyListeners();
          } else if (payload.eventType === 'DELETE') {
            activeLogs = activeLogs.filter((l) => l.id !== payload.old.id);
            notifyListeners();
          }
        }
      )
      .subscribe();
  }

  return () => {
    listeners.delete(listener);
    if (channel && supabase) {
      supabase.removeChannel(channel);
    }
  };
};

export const updateLogVerificationStatus = async (
  logId: string,
  status: VerificationStatus,
  comments?: string
): Promise<SiteLog | null> => {
  if (supabase) {
    const { data, error } = await supabase
      .from('site_logs')
      .update({
        verification_status: status,
        review_comments: comments || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', logId)
      .select()
      .single();

    if (error) {
      console.warn('Supabase DB update failed, updating in-memory store:', error);
    } else if (data) {
      activeLogs = activeLogs.map((l) => (l.id === logId ? { ...l, ...data } : l));
      notifyListeners();
      return activeLogs.find((l) => l.id === logId) || null;
    }
  }

  // Fallback update
  activeLogs = activeLogs.map((l) => {
    if (l.id === logId) {
      return {
        ...l,
        verification_status: status,
        review_comments: comments ?? l.review_comments,
        reviewed_at: new Date().toISOString(),
        reviewed_by: mockUsers[0].id,
      };
    }
    return l;
  });
  notifyListeners();
  return activeLogs.find((l) => l.id === logId) || null;
};

export const addSimulatedSiteLog = (newLog: Partial<SiteLog>): SiteLog => {
  const borehole = mockBoreholes.find((b) => b.id === newLog.borehole_id) || mockBoreholes[0];
  const project = mockProjects.find((p) => p.id === borehole.project_id) || mockProjects[0];
  const engineer = mockUsers.find((u) => u.id === newLog.engineer_id) || mockUsers[2];

  const fullRecord: SiteLog = {
    id: `log-${Date.now()}`,
    borehole_id: borehole.id,
    engineer_id: engineer.id,
    depth_from_m: newLog.depth_from_m ?? 18.5,
    depth_to_m: newLog.depth_to_m ?? 21.0,
    sample_no: newLog.sample_no ?? `SPT-${activeLogs.length + 1}`,
    strata_classification: newLog.strata_classification ?? 'Dense Fine to Medium Sand (SP)',
    spt_n_value: newLog.spt_n_value ?? 42,
    water_table_encountered: newLog.water_table_encountered ?? true,
    water_table_depth_m: newLog.water_table_depth_m ?? 3.8,
    gps_lat: newLog.gps_lat ?? 17.44354,
    gps_long: newLog.gps_long ?? 78.37723,
    verification_status: 'Pending Review',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    project,
    borehole,
    engineer,
    notes: newLog.notes || 'Submitted from field mobile app offline-sync queue.',
    attachments: [
      {
        id: `att-${Date.now()}-1`,
        log_id: `log-${Date.now()}`,
        attachment_type: 'site_photo',
        file_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=1200&q=80',
        created_at: new Date().toISOString(),
      },
      {
        id: `att-${Date.now()}-2`,
        log_id: `log-${Date.now()}`,
        attachment_type: 'sample_card',
        file_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
        created_at: new Date().toISOString(),
      },
      {
        id: `att-${Date.now()}-3`,
        log_id: `log-${Date.now()}`,
        attachment_type: 'field_sheet',
        file_url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80',
        generated_xlsx_url: '/api/export-xlsx?boreholeNo=BH-01',
        created_at: new Date().toISOString(),
      },
    ],
  };

  activeLogs = [fullRecord, ...activeLogs];
  notifyListeners();
  return fullRecord;
};

