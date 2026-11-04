'use client';

import React, { useState } from 'react';
import { X, FileSpreadsheet, Download, Check, ShieldCheck, Database } from 'lucide-react';
import { SiteLog, Project } from '../types';
import { exportLogsToCsv, triggerExcelDownload } from '../lib/exportUtils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: SiteLog[];
  projects: Project[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  logs,
  projects,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx'>('xlsx');

  if (!isOpen) return null;

  const filteredLogs = selectedProjectId === 'all'
    ? logs
    : logs.filter((l) => l.project?.id === selectedProjectId);

  const handleExport = () => {
    if (exportFormat === 'csv') {
      const selectedProj = projects.find((p) => p.id === selectedProjectId);
      const prefix = selectedProj ? `Geotech_${selectedProj.project_code}` : 'Geotech_All_Projects';
      exportLogsToCsv(filteredLogs, prefix);
    } else {
      // Trigger standardized XLSX generator
      const boreholeNo = filteredLogs[0]?.borehole?.borehole_no || 'BH-01';
      const projectName = filteredLogs[0]?.project?.project_name || 'Geotechnical Project';
      triggerExcelDownload(boreholeNo, projectName);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Geotechnical Data Export Hub</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
              Select Project Scope
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">All Active & Completed Projects ({logs.length} logs)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.project_name} ({p.project_code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2 uppercase tracking-wider">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setExportFormat('xlsx')}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition ${
                  exportFormat === 'xlsx'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  {exportFormat === 'xlsx' && <Check className="w-4 h-4 text-emerald-600" />}
                </div>
                <div className="mt-2">
                  <span className="font-bold text-xs text-slate-900 block">Standardized .XLSX</span>
                  <span className="text-[11px] text-slate-500">
                    Official geotechnical borehole ledger layout with color stratigraphy & SPT tables.
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setExportFormat('csv')}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition ${
                  exportFormat === 'csv'
                    ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Database className="w-5 h-5 text-blue-600" />
                  {exportFormat === 'csv' && <Check className="w-4 h-4 text-blue-600" />}
                </div>
                <div className="mt-2">
                  <span className="font-bold text-xs text-slate-900 block">Universal CSV Data</span>
                  <span className="text-[11px] text-slate-500">
                    Complete tabular raw dump including GPS coordinates, timestamps, and notes.
                  </span>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-start gap-2.5 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              All exports adhere strictly to ASTM D1586 / IS 1892 geotechnical logging standards.
              Includes verified engineer credentials and review signatures.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Selected: <strong className="text-slate-800">{filteredLogs.length}</strong> log entries
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              Download Dataset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

