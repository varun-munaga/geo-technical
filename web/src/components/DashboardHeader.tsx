'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Layers,
  Activity,
  FolderGit2,
  LineChart,
  HardHat,
  Bell,
  Radio,
  FileCheck2,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { SiteLog, Project } from '../types';

interface DashboardHeaderProps {
  logs: SiteLog[];
  projects: Project[];
  isRealtimeActive?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  logs,
  projects,
  isRealtimeActive = true,
}) => {
  const pathname = usePathname();

  const pendingCount = logs.filter((l) => l.verification_status === 'Pending Review').length;
  const approvedCount = logs.filter((l) => l.verification_status === 'Approved').length;
  const flaggedCount = logs.filter((l) => l.verification_status === 'Flagged for Re-test').length;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white">
      {/* Top Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-base font-black tracking-tight text-white block">
                  TERRA<span className="text-cyan-400">LOG</span> PRO
                </span>
                <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase block">
                  Geotechnical Operations Hub
                </span>
              </div>
            </Link>

            {/* Nav Tabs */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                href="/"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  pathname === '/'
                    ? 'bg-slate-800 text-cyan-400 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                Live Feed & Operations
              </Link>
              <Link
                href="/projects"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  pathname === '/projects'
                    ? 'bg-slate-800 text-cyan-400 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <FolderGit2 className="w-3.5 h-3.5" />
                Projects & Assignments
              </Link>
              <Link
                href="/analytics"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  pathname === '/analytics'
                    ? 'bg-slate-800 text-cyan-400 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <LineChart className="w-3.5 h-3.5" />
                Subsurface Profiler
              </Link>
            </nav>
          </div>

          {/* User Profile & Realtime Beacon */}
          <div className="flex items-center space-x-4">
            {/* Supabase Realtime Beacon */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-[11px] font-medium">Supabase Realtime Live</span>
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-3 pl-2 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-white">Dr. Rajesh Sharma</div>
                <div className="text-[10px] text-cyan-400 font-mono">Lead Geotechnical PE (Admin)</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                RS
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Quick Bar */}
      <div className="bg-slate-950/80 border-t border-slate-800/80 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Projects</span>
            <span className="text-lg font-black font-mono text-white">{projects.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Borehole Logs</span>
            <span className="text-lg font-black font-mono text-cyan-400">{logs.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-amber-950/20 border border-amber-900/40">
            <span className="text-[10px] uppercase font-bold text-amber-400 block flex items-center gap-1">
              <Clock className="w-3 h-3" /> Pending Review
            </span>
            <span className="text-lg font-black font-mono text-amber-300">{pendingCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block flex items-center gap-1">
              <FileCheck2 className="w-3 h-3" /> Approved Logs
            </span>
            <span className="text-lg font-black font-mono text-emerald-300">{approvedCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-rose-950/20 border border-rose-900/40">
            <span className="text-[10px] uppercase font-bold text-rose-400 block flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Flagged Re-Test
            </span>
            <span className="text-lg font-black font-mono text-rose-300">{flaggedCount}</span>
          </div>
          <div className="hidden lg:block px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">OCR Engine Status</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Vision Online
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

