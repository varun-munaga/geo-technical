'use client';

import React from 'react';
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
} from 'recharts';
import { SiteLog } from '../types';

interface StratigraphyChartProps {
  logs: SiteLog[];
  selectedBorehole?: string;
}

export const StratigraphyChart: React.FC<StratigraphyChartProps> = ({ logs, selectedBorehole }) => {
  // Filter for chosen borehole or first borehole
  const targetBorehole = selectedBorehole || (logs.length > 0 ? logs[0].borehole?.borehole_no : 'BH-01');
  const boreholeLogs = logs
    .filter((l) => l.borehole?.borehole_no === targetBorehole)
    .sort((a, b) => a.depth_from_m - b.depth_from_m);

  const chartData = boreholeLogs.map((log) => {
    const midDepth = (log.depth_from_m + log.depth_to_m) / 2;
    return {
      depth: midDepth,
      depthLabel: `${log.depth_from_m.toFixed(1)}-${log.depth_to_m.toFixed(1)}m`,
      strata: log.strata_classification,
      sptN: log.spt_n_value || 0,
      coreRecovery: log.core_recovery_pct || 0,
      rqd: log.rqd_pct || 0,
      waterTable: log.water_table_depth_m || null,
      sampleNo: log.sample_no || 'SS',
    };
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>Subsurface Stratigraphy & SPT N-Value Depth Profile</span>
            <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
              {targetBorehole}
            </span>
          </h3>
          <p className="text-xs text-slate-500">
            Penetration Resistance (SPT Blows/30cm) and Rock Core Quality (%) plotted against Subsurface Depth
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
            <span className="text-slate-600 font-medium">SPT N-Value</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-sky-500 inline-block" />
            <span className="text-slate-600 font-medium">Core Recovery (%)</span>
          </div>
        </div>
      </div>

      <div className="h-[280px] w-full pt-4">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No depth data recorded yet for {targetBorehole}.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 20, bottom: 20, left: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="depthLabel"
                tick={{ fontSize: 11, fill: '#64748b' }}
                label={{ value: 'Stratum Depth Interval (m)', position: 'insideBottom', offset: -10, fontSize: 11, fill: '#94a3b8' }}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: '#64748b' }}
                label={{ value: 'SPT N-Value / TCR %', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#94a3b8' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs max-w-xs space-y-1">
                        <div className="font-bold text-blue-400 font-mono">
                          {data.sampleNo}: {data.depthLabel}
                        </div>
                        <div className="text-slate-200 font-medium leading-tight">
                          {data.strata}
                        </div>
                        <div className="pt-1 border-t border-slate-700 grid grid-cols-2 gap-2 font-mono">
                          <div>
                            SPT N-Value:{' '}
                            <span className="text-amber-400 font-bold">{data.sptN || 'Refusal / N/A'}</span>
                          </div>
                          <div>
                            Core Rec:{' '}
                            <span className="text-sky-400 font-bold">{data.coreRecovery ? `${data.coreRecovery}%` : 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                yAxisId="left"
                dataKey="coreRecovery"
                name="Core Recovery (%)"
                fill="#38bdf8"
                radius={[4, 4, 0, 0]}
                barSize={24}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="sptN"
                name="SPT N-Value"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ r: 5, fill: '#d97706', strokeWidth: 2, stroke: '#fff' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

