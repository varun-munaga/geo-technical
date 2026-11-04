'use client';

import React, { useState } from 'react';
import {
  LineChart as LineChartIcon,
  Layers,
  Droplet,
  Compass,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { DashboardHeader } from '../../components/DashboardHeader';
import { mockSiteLogs, mockProjects, mockBoreholes } from '../../lib/mockData';
import { exportLogsToCsv } from '../../lib/exportUtils';

export default function AnalyticsPage() {
  const [selectedBorehole, setSelectedBorehole] = useState<string>('BH-01');

  const filteredLogs = mockSiteLogs.filter(
    (l) => l.borehole?.borehole_no === selectedBorehole
  );

  const profileData = filteredLogs.map((log) => ({
    depth: (log.depth_from_m + log.depth_to_m) / 2,
    depthRange: `${log.depth_from_m.toFixed(1)} - ${log.depth_to_m.toFixed(1)}m`,
    sptN: log.spt_n_value || 0,
    coreRecovery: log.core_recovery_pct || 0,
    rqd: log.rqd_pct || 0,
    waterLevel: log.water_table_depth_m || 0,
    strata: log.strata_classification,
  }));

  // Correlation cross-borehole comparison data
  const correlationData = [
    { depth: '0 - 1.5m', BH01_N: 9, BH02_N: 8, BH03_N: 11, stratum: 'Topsoil / Fill' },
    { depth: '1.5 - 4.5m', BH01_N: 17, BH02_N: 19, BH03_N: 15, stratum: 'Silty Clay' },
    { depth: '4.5 - 9.0m', BH01_N: 37, BH02_N: 42, BH03_N: 35, stratum: 'Dense Silty Sand' },
    { depth: '9.0 - 15.0m', BH01_N: 92, BH02_N: 98, BH03_N: 88, stratum: 'Weathered Granite / Murrum' },
    { depth: '15.0 - 22.0m', BH01_N: 120, BH02_N: 130, BH03_N: 115, stratum: 'Fresh Granite Bedrock' },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-100">
      <DashboardHeader logs={mockSiteLogs} projects={mockProjects} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <LineChartIcon className="w-6 h-6 text-blue-600" />
              <span>Subsurface Stratigraphy & Geotechnical Profiler</span>
            </h1>
            <p className="text-xs text-slate-500">
              Interactive soil mechanics, Standard Penetration Test (SPT) resistance gradients, and Rock Quality Designation (RQD).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedBorehole}
              onChange={(e) => setSelectedBorehole(e.target.value)}
              className="text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg px-3 py-2 shadow-sm text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="BH-01">Borehole BH-01 (Depth: 18.5m)</option>
              <option value="BH-02">Borehole BH-02 (Depth: 25.0m)</option>
              <option value="BH-03">Borehole BH-03 (Depth: 22.0m)</option>
            </select>

            <button
              onClick={() => exportLogsToCsv(mockSiteLogs, 'Geotech_Subsurface_Profile')}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              Export Dataset
            </button>
          </div>
        </div>

        {/* Top 3 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Encountered Water Table
            </span>
            <div className="text-2xl font-black font-mono text-cyan-700 flex items-center gap-2">
              <Droplet className="w-6 h-6 text-cyan-600" />
              3.80 m
              <span className="text-xs font-normal text-slate-500">below ground level</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Seepage stabilized at 3.80m during split spoon sampling.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              SPT Refusal Boundary (N &gt; 50)
            </span>
            <div className="text-2xl font-black font-mono text-amber-600 flex items-center gap-2">
              <Layers className="w-6 h-6 text-amber-500" />
              9.00 m
              <span className="text-xs font-normal text-slate-500">terminal soil depth</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Transition to weathered granite bedrock (Grades V-IV) met at 9.0m.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Peak Core Recovery (TCR) / RQD
            </span>
            <div className="text-2xl font-black font-mono text-emerald-600 flex items-center gap-2">
              <Compass className="w-6 h-6 text-emerald-500" />
              88% / 74%
              <span className="text-xs font-normal text-slate-500">deep granite run</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Sound competent bedrock reached suitable for high-load end-bearing piles.
            </p>
          </div>
        </div>

        {/* Cross Borehole Correlation Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Cross-Borehole Soil Resistance Correlation (BH-01 vs BH-02 vs BH-03)
              </h3>
              <p className="text-xs text-slate-500">
                Comparing SPT blow resistance across lateral borehole stations to identify continuity of bearing strata.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-blue-600 font-bold">● BH-01</span>
              <span className="text-emerald-600 font-bold">● BH-02</span>
              <span className="text-amber-600 font-bold">● BH-03</span>
            </div>
          </div>

          <div className="h-[300px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={correlationData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="depth" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} label={{ value: 'SPT N-Value', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip />
                <Area type="monotone" dataKey="BH01_N" name="BH-01 SPT N" stroke="#2563eb" fill="#93c5fd" fillOpacity={0.3} />
                <Area type="monotone" dataKey="BH02_N" name="BH-02 SPT N" stroke="#059669" fill="#a7f3d0" fillOpacity={0.3} />
                <Area type="monotone" dataKey="BH03_N" name="BH-03 SPT N" stroke="#d97706" fill="#fde68a" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}

