'use client';

import React, { useEffect, useState } from 'react';
import { DashboardHeader } from '../components/DashboardHeader';
import { OperationsTable } from '../components/OperationsTable';
import { DeepInspectionModal } from '../components/DeepInspectionModal';
import { StratigraphyChart } from '../components/StratigraphyChart';
import { ExportModal } from '../components/ExportModal';
import { SiteLog } from '../types';
import { mockProjects } from '../lib/mockData';
import { subscribeToLogs, addSimulatedSiteLog } from '../lib/supabaseClient';

export default function OperationsDashboard() {
  const [logs, setLogs] = useState<SiteLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<SiteLog | null>(null);
  const [isInspectionOpen, setIsInspectionOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedBoreholeForChart, setSelectedBoreholeForChart] = useState<string>('BH-01');

  // Set up live Supabase Realtime subscription
  useEffect(() => {
    const unsubscribe = subscribeToLogs((updatedLogs) => {
      setLogs(updatedLogs);
      // Keep selectedLog in sync if modal is open
      if (selectedLog) {
        const fresh = updatedLogs.find((l) => l.id === selectedLog.id);
        if (fresh) setSelectedLog(fresh);
      }
    });

    return () => unsubscribe();
  }, [selectedLog]);

  const handleSelectLog = (log: SiteLog) => {
    setSelectedLog(log);
    setIsInspectionOpen(true);
    if (log.borehole?.borehole_no) {
      setSelectedBoreholeForChart(log.borehole.borehole_no);
    }
  };

  const handleSimulateFieldSync = () => {
    const depths = [
      { from: 18.5, to: 21.0, strata: 'Medium Dense Clayey Silt with quartz grains (ML)', n: 28 },
      { from: 21.0, to: 24.0, strata: 'Very Dense Silty Sand with gravel lenses (SM)', n: 46 },
      { from: 24.0, to: 27.5, strata: 'Moderately Weathered Granite bedrock (Grade III)', n: 85 },
    ];
    const pick = depths[Math.floor(Math.random() * depths.length)];

    const created = addSimulatedSiteLog({
      depth_from_m: pick.from,
      depth_to_m: pick.to,
      strata_classification: pick.strata,
      spt_n_value: pick.n,
      notes: 'Real-time payload pushed via Mobile Field App offline-sync queue.',
    });

    // Auto-select newly synced log to showcase live deep inspection modal
    setSelectedLog(created);
    setIsInspectionOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-100">
      <DashboardHeader logs={logs} projects={mockProjects} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stratigraphy & SPT Depth Profile Section */}
        <StratigraphyChart logs={logs} selectedBorehole={selectedBoreholeForChart} />

        {/* Live Operations TanStack Table */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Live Subsurface Logs & Field Telemetry Feed
              </h2>
              <p className="text-xs text-slate-500">
                Click any row for side-by-side verification with high-res physical sheet OCR overlay
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-500">
                Active Borehole: <strong className="text-blue-700">{selectedBoreholeForChart}</strong>
              </span>
            </div>
          </div>

          <OperationsTable
            logs={logs}
            onSelectLog={handleSelectLog}
            onOpenExportModal={() => setIsExportOpen(true)}
            onSimulateNewLog={handleSimulateFieldSync}
          />
        </div>
      </main>

      {/* Deep Inspection Modal (Side-by-Side Dual-Pane Viewer) */}
      <DeepInspectionModal
        log={selectedLog}
        isOpen={isInspectionOpen}
        onClose={() => setIsInspectionOpen(false)}
        onStatusUpdated={(updated) => setSelectedLog(updated)}
      />

      {/* Export Hub Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        logs={logs}
        projects={mockProjects}
      />
    </div>
  );
}

