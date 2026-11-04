'use client';

import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  MapPin,
  Calendar,
  User,
  CheckCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  Save,
  Layers,
  Droplet,
  Compass,
} from 'lucide-react';
import { SiteLog, VerificationStatus } from '../types';
import { PhotoViewer } from './PhotoViewer';
import { StatusBadge } from './StatusBadge';
import { updateLogVerificationStatus } from '../lib/supabaseClient';
import { triggerExcelDownload } from '../lib/exportUtils';

interface DeepInspectionModalProps {
  log: SiteLog | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated?: (updatedLog: SiteLog) => void;
}

export const DeepInspectionModal: React.FC<DeepInspectionModalProps> = ({
  log,
  isOpen,
  onClose,
  onStatusUpdated,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<VerificationStatus>(
    log?.verification_status || 'Pending Review'
  );
  const [comments, setComments] = useState<string>(log?.review_comments || '');
  const [isSaving, setIsSaving] = useState(false);

  // Sync state if log changes
  React.useEffect(() => {
    if (log) {
      setSelectedStatus(log.verification_status);
      setComments(log.review_comments || '');
    }
  }, [log]);

  if (!isOpen || !log) return null;

  const handleSaveReview = async () => {
    setIsSaving(true);
    try {
      const updated = await updateLogVerificationStatus(log.id, selectedStatus, comments);
      if (updated && onStatusUpdated) {
        onStatusUpdated(updated);
      }
    } catch (err) {
      console.error('Failed to update verification status:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadXlsx = () => {
    const fieldSheetAttachment = log.attachments?.find((a) => a.attachment_type === 'field_sheet');
    triggerExcelDownload(
      log.borehole?.borehole_no || 'BH-01',
      log.project?.project_name || 'Geotech Site',
      fieldSheetAttachment?.generated_xlsx_url
    );
  };

  const fieldSheetAttachment = log.attachments?.find((a) => a.attachment_type === 'field_sheet');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-7xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <span className="bg-blue-600/30 text-blue-400 font-mono text-xs px-2.5 py-1 rounded border border-blue-500/40">
              {log.project?.project_code || 'PROJ'}
            </span>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <span>Inspection & QA Verification:</span>
                <span className="text-blue-400">{log.borehole?.borehole_no || 'BH-01'}</span>
                <span className="text-slate-400 font-normal text-sm">
                  ({log.depth_from_m.toFixed(2)}m – {log.depth_to_m.toFixed(2)}m)
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {log.project?.project_name || 'Geotechnical Site Project'} &bull; Client:{' '}
                {log.project?.client_name || 'Authority'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownloadXlsx}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm"
              title="Download generated Excel matching standard geotechnical ledger format"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Download Generated XLSX
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split 2-Pane Side-by-Side Viewer */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          {/* LEFT PANE: Extracted & Verified Data Fields */}
          <div className="lg:col-span-5 p-5 space-y-5 overflow-y-auto bg-slate-50/70">
            {/* Top Quick Status Pill */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block">
                  Current QA Status
                </span>
                <div className="mt-1">
                  <StatusBadge status={log.verification_status} size="md" />
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block">
                  Sample ID
                </span>
                <span className="text-sm font-bold font-mono text-slate-800">
                  {log.sample_no || 'SS-01'}
                </span>
              </div>
            </div>

            {/* Geological Strata & Visual Classification */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Strata & Lithological Classification</span>
              </div>

              <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100">
                <p className="text-sm font-medium text-slate-900 leading-snug">
                  {log.strata_classification}
                </p>
                {log.color_description && (
                  <p className="text-xs text-slate-600 mt-1">
                    <span className="font-semibold text-slate-700">Mottling & Color:</span>{' '}
                    {log.color_description}
                  </p>
                )}
                {log.density_consistency && (
                  <p className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-700">Consistency:</span>{' '}
                    {log.density_consistency}
                  </p>
                )}
              </div>

              {/* Depth Interval Cards */}
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Depth From</span>
                  <div className="text-base font-bold font-mono text-slate-800">
                    {log.depth_from_m.toFixed(2)} m
                  </div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Depth To</span>
                  <div className="text-base font-bold font-mono text-slate-800">
                    {log.depth_to_m.toFixed(2)} m
                  </div>
                </div>
                <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-[10px] uppercase font-bold text-blue-700">Thickness</span>
                  <div className="text-base font-bold font-mono text-blue-800">
                    {(log.depth_to_m - log.depth_from_m).toFixed(2)} m
                  </div>
                </div>
              </div>
            </div>

            {/* Geotechnical In-Situ Tests (SPT & Rock Core) */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <span className="text-slate-800 font-semibold text-sm block">
                Standard Penetration Test (SPT) & Core Quality
              </span>

              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-semibold text-slate-500 block">0-15cm</span>
                  <span className="text-sm font-bold font-mono text-slate-700">
                    {log.spt_blows_15cm ?? '-'}
                  </span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-semibold text-slate-500 block">15-30cm</span>
                  <span className="text-sm font-bold font-mono text-slate-700">
                    {log.spt_blows_30cm ?? '-'}
                  </span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-semibold text-slate-500 block">30-45cm</span>
                  <span className="text-sm font-bold font-mono text-slate-700">
                    {log.spt_blows_45cm ?? '-'}
                  </span>
                </div>
                <div className="p-2 bg-amber-50 rounded-lg border border-amber-200">
                  <span className="text-[10px] font-bold text-amber-800 block">N-Value</span>
                  <span className="text-sm font-black font-mono text-amber-900">
                    {log.spt_n_value ?? '-'}
                  </span>
                </div>
              </div>

              {/* Core recovery & RQD if rock layer */}
              {(log.core_recovery_pct !== null || log.rqd_pct !== null) && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Core Recovery (TCR)
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      {log.core_recovery_pct ? `${log.core_recovery_pct}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      R.Q.D. Rating
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      {log.rqd_pct ? `${log.rqd_pct}%` : 'N/A'}
                    </span>
                  </div>
                </div>
              )}

              {/* Groundwater Encountered */}
              <div className="p-3 bg-cyan-50/70 rounded-lg border border-cyan-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-cyan-700" />
                  <span className="text-xs font-semibold text-cyan-900">Water Table Observed</span>
                </div>
                <span className="text-xs font-bold font-mono text-cyan-800">
                  {log.water_table_encountered && log.water_table_depth_m
                    ? `${log.water_table_depth_m.toFixed(2)} m below GL`
                    : 'Not encountered'}
                </span>
              </div>
            </div>

            {/* GPS Map Pin & Field Metadata */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span>Device GPS & Field Telemetry</span>
                </div>
                {log.gps_accuracy_m && (
                  <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    Accuracy: ±{log.gps_accuracy_m}m
                  </span>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-lg font-mono text-xs text-slate-700 flex items-center justify-between border border-slate-200">
                <div>
                  <span className="text-slate-400">Lat: </span>
                  <span className="font-semibold">{log.gps_lat ? log.gps_lat.toFixed(6) : '17.443512'}</span>
                  <span className="mx-2 text-slate-300">|</span>
                  <span className="text-slate-400">Long: </span>
                  <span className="font-semibold">{log.gps_long ? log.gps_long.toFixed(6) : '78.377201'}</span>
                </div>
                <a
                  href={`https://www.google.com/maps?q=${log.gps_lat || 17.443512},${log.gps_long || 78.377201}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-[11px] flex items-center gap-1 font-sans font-medium"
                >
                  View on Map <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{log.engineer?.full_name || 'Rahul Verma (Site Geologist)'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{new Date(log.created_at).toLocaleString()}</span>
                </div>
              </div>

              {log.notes && (
                <div className="mt-2 text-xs bg-slate-50 p-2.5 rounded border border-slate-200 text-slate-600">
                  <span className="font-semibold text-slate-700 block mb-0.5">Field Engineer Notes:</span>
                  {log.notes}
                </div>
              )}
            </div>

            {/* QA & Verification Controls */}
            <div className="bg-white p-4 rounded-xl border-2 border-blue-200/80 shadow-md space-y-3">
              <span className="text-slate-900 font-bold text-sm block">
                Office Engineer QA Review & Sign-Off
              </span>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStatus('Approved')}
                  className={`py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
                    selectedStatus === 'Approved'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStatus('Pending Review')}
                  className={`py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
                    selectedStatus === 'Pending Review'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  Pending
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStatus('Flagged for Re-test')}
                  className={`py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
                    selectedStatus === 'Flagged for Re-test'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Flag Re-test
                </button>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Lead Geologist QA Remarks:
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Enter comments, sample verification remarks, or reasons for flagging..."
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[64px]"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveReview}
                disabled={isSaving}
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {isSaving ? 'Updating...' : 'Save QA Verification'}
              </button>
            </div>
          </div>

          {/* RIGHT PANE: High-Resolution Zoomable Photo Viewer */}
          <div className="lg:col-span-7 p-4 bg-slate-900 flex flex-col min-h-[500px]">
            <PhotoViewer
              attachments={log.attachments}
              defaultType="field_sheet"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

