import { SiteLog } from '../types';

export const exportLogsToCsv = (logs: SiteLog[], filenamePrefix = 'Geotech_Borehole_Logs') => {
  if (logs.length === 0) {
    alert('No records available to export.');
    return;
  }

  const headers = [
    'Log ID',
    'Project Code',
    'Project Name',
    'Client',
    'Borehole No',
    'Sample No',
    'Depth From (m)',
    'Depth To (m)',
    'Layer Thickness (m)',
    'Lithology / Strata Classification',
    'SPT 0-15cm',
    'SPT 15-30cm',
    'SPT 30-45cm',
    'SPT N-Value',
    'Core Recovery (%)',
    'RQD (%)',
    'Water Table Depth (m)',
    'Verification Status',
    'Field Engineer',
    'GPS Latitude',
    'GPS Longitude',
    'Timestamp',
    'Notes',
  ];

  const escapeCsv = (val: any) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = logs.map((log) => [
    escapeCsv(log.id),
    escapeCsv(log.project?.project_code || 'METRO-EXT-A'),
    escapeCsv(log.project?.project_name || ''),
    escapeCsv(log.project?.client_name || ''),
    escapeCsv(log.borehole?.borehole_no || ''),
    escapeCsv(log.sample_no || ''),
    escapeCsv(log.depth_from_m),
    escapeCsv(log.depth_to_m),
    escapeCsv((log.depth_to_m - log.depth_from_m).toFixed(2)),
    escapeCsv(log.strata_classification),
    escapeCsv(log.spt_blows_15cm ?? ''),
    escapeCsv(log.spt_blows_30cm ?? ''),
    escapeCsv(log.spt_blows_45cm ?? ''),
    escapeCsv(log.spt_n_value ?? ''),
    escapeCsv(log.core_recovery_pct ?? ''),
    escapeCsv(log.rqd_pct ?? ''),
    escapeCsv(log.water_table_depth_m ?? 'Not encountered'),
    escapeCsv(log.verification_status),
    escapeCsv(log.engineer?.full_name || ''),
    escapeCsv(log.gps_lat ?? ''),
    escapeCsv(log.gps_long ?? ''),
    escapeCsv(log.created_at),
    escapeCsv(log.notes || ''),
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filenamePrefix}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const triggerExcelDownload = async (
  boreholeNo = 'BH-01',
  projectName = 'Metro Line Extension - Site A',
  directUrl?: string | null
) => {
  if (directUrl && directUrl.startsWith('http')) {
    window.open(directUrl, '_blank');
    return;
  }

  // Trigger backend-ocr API or local generator
  const backendUrl = process.env.NEXT_PUBLIC_OCR_API_URL || 'http://localhost:4000';
  const url = `${backendUrl}/api/export-xlsx?boreholeNo=${encodeURIComponent(boreholeNo)}&projectName=${encodeURIComponent(projectName)}`;
  window.open(url, '_blank');
};

