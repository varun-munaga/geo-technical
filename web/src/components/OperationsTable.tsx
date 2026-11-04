'use client';

import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
  SortingState,
} from '@tanstack/react-table';
import {
  Search,
  Filter,
  Eye,
  FileSpreadsheet,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Download,
  RefreshCw,
} from 'lucide-react';
import { SiteLog, VerificationStatus } from '../types';
import { StatusBadge } from './StatusBadge';
import { triggerExcelDownload } from '../lib/exportUtils';
import { updateLogVerificationStatus } from '../lib/supabaseClient';

interface OperationsTableProps {
  logs: SiteLog[];
  onSelectLog: (log: SiteLog) => void;
  onOpenExportModal: () => void;
  onSimulateNewLog: () => void;
}

export const OperationsTable: React.FC<OperationsTableProps> = ({
  logs,
  onSelectLog,
  onOpenExportModal,
  onSimulateNewLog,
}) => {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'created_at', desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedBorehole, setSelectedBorehole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedEngineer, setSelectedEngineer] = useState<string>('all');

  // Derive unique filter lists
  const projectOptions = useMemo(() => {
    const map = new Map<string, string>();
    logs.forEach((l) => {
      if (l.project?.id) map.set(l.project.id, l.project.project_name);
    });
    return Array.from(map.entries());
  }, [logs]);

  const boreholeOptions = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => {
      if (l.borehole?.borehole_no) set.add(l.borehole.borehole_no);
    });
    return Array.from(set);
  }, [logs]);

  const engineerOptions = useMemo(() => {
    const map = new Map<string, string>();
    logs.forEach((l) => {
      if (l.engineer?.id) map.set(l.engineer.id, l.engineer.full_name);
    });
    return Array.from(map.entries());
  }, [logs]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return logs.filter((log) => {
      if (selectedProject !== 'all' && log.project?.id !== selectedProject) return false;
      if (selectedBorehole !== 'all' && log.borehole?.borehole_no !== selectedBorehole) return false;
      if (selectedStatus !== 'all' && log.verification_status !== selectedStatus) return false;
      if (selectedEngineer !== 'all' && log.engineer?.id !== selectedEngineer) return false;
      if (globalFilter.trim()) {
        const q = globalFilter.toLowerCase();
        const matchesStrata = log.strata_classification.toLowerCase().includes(q);
        const matchesBorehole = log.borehole?.borehole_no.toLowerCase().includes(q);
        const matchesSample = log.sample_no?.toLowerCase().includes(q);
        const matchesProject = log.project?.project_name.toLowerCase().includes(q);
        if (!matchesStrata && !matchesBorehole && !matchesSample && !matchesProject) return false;
      }
      return true;
    });
  }, [logs, selectedProject, selectedBorehole, selectedStatus, selectedEngineer, globalFilter]);

  const handleQuickApprove = async (e: React.MouseEvent, log: SiteLog) => {
    e.stopPropagation();
    await updateLogVerificationStatus(log.id, 'Approved', 'Quick approved from Operations Console.');
  };

  const columns = useMemo<ColumnDef<SiteLog>[]>(
    () => [
      {
        accessorKey: 'borehole.borehole_no',
        header: 'Borehole',
        cell: ({ row }) => (
          <div>
            <span className="font-bold font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-xs">
              {row.original.borehole?.borehole_no || 'BH-01'}
            </span>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {row.original.project?.project_code || 'PROJ'}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'depth_from_m',
        header: 'Depth Interval',
        cell: ({ row }) => (
          <div className="font-mono text-xs">
            <span className="font-semibold text-slate-800">
              {row.original.depth_from_m.toFixed(2)}m – {row.original.depth_to_m.toFixed(2)}m
            </span>
            <span className="text-[10px] text-slate-400 block">
              Thick: {(row.original.depth_to_m - row.original.depth_from_m).toFixed(2)}m
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'strata_classification',
        header: 'Lithology / Strata Classification',
        cell: ({ row }) => (
          <div className="max-w-[280px]">
            <div className="font-medium text-xs text-slate-900 truncate" title={row.original.strata_classification}>
              {row.original.strata_classification}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
              <span>Sample: <strong className="font-mono text-slate-700">{row.original.sample_no || 'SS'}</strong></span>
              {row.original.water_table_encountered && (
                <span className="text-cyan-700 font-semibold text-[10px] bg-cyan-50 px-1.5 rounded">
                  GW: {row.original.water_table_depth_m}m
                </span>
              )}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'spt_n_value',
        header: 'SPT / Core Rec',
        cell: ({ row }) => (
          <div className="text-xs font-mono">
            {row.original.spt_n_value !== null && row.original.spt_n_value !== undefined ? (
              <span className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                N = {row.original.spt_n_value}
              </span>
            ) : row.original.core_recovery_pct ? (
              <span className="font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                CR: {row.original.core_recovery_pct}%
              </span>
            ) : (
              <span className="text-slate-400">-</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'engineer.full_name',
        header: 'Field Engineer',
        cell: ({ row }) => (
          <div className="text-xs text-slate-700">
            <div className="font-medium">{row.original.engineer?.full_name?.split(' ')[0] || 'Engineer'}</div>
            <div className="text-[10px] text-slate-400">
              {new Date(row.original.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'verification_status',
        header: 'QA Status',
        cell: ({ row }) => (
          <StatusBadge status={row.original.verification_status} size="sm" />
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onSelectLog(row.original)}
              className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition"
              title="Inspect Record & High-Res Field Sheet"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                triggerExcelDownload(
                  row.original.borehole?.borehole_no || 'BH-01',
                  row.original.project?.project_name || 'Geotech',
                  row.original.attachments?.find((a) => a.attachment_type === 'field_sheet')?.generated_xlsx_url
                )
              }
              className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition"
              title="Download Standardized Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>
            {row.original.verification_status === 'Pending Review' && (
              <button
                onClick={(e) => handleQuickApprove(e, row.original)}
                className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition"
                title="Quick Approve"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </button>
            )}
          </div>
        ),
      },
    ],
    [onSelectLog]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Text Search */}
          <div className="relative min-w-[220px] flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search strata, borehole, sample..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Project Filter */}
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-700"
          >
            <option value="all">All Projects</option>
            {projectOptions.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>

          {/* Borehole Filter */}
          <select
            value={selectedBorehole}
            onChange={(e) => setSelectedBorehole(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-700 font-mono"
          >
            <option value="all">All Boreholes</option>
            {boreholeOptions.map((no) => (
              <option key={no} value={no}>
                {no}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Approved">Approved</option>
            <option value="Flagged for Re-test">Flagged for Re-test</option>
          </select>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSimulateNewLog}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition shadow-sm"
            title="Simulate receiving a new borehole test from mobile field sync"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            + Simulate Field Sync
          </button>
          <button
            onClick={onOpenExportModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export Hub
          </button>
        </div>
      </div>

      {/* Main TanStack Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-slate-50/80 border-b border-slate-200">
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const isSorted = header.column.getIsSorted();
                    return (
                      <th
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none ${
                          canSort ? 'cursor-pointer hover:bg-slate-100 transition' : ''
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {canSort && (
                            <span className="text-slate-400">
                              {isSorted === 'asc' ? (
                                <ChevronUp className="w-3.5 h-3.5 text-blue-600" />
                              ) : isSorted === 'desc' ? (
                                <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                              ) : (
                                <ChevronsUpDown className="w-3 h-3 text-slate-300" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-xs text-slate-400">
                    No geotechnical logs matched the active filters.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onSelectLog(row.original)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Record Counts and Pagination */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-700">{filteredData.length}</span> of{' '}
            <span className="font-semibold text-slate-700">{logs.length}</span> total logs
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40 text-xs"
            >
              Previous
            </button>
            <span className="font-mono text-xs">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40 text-xs"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

