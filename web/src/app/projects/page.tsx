'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FolderGit2,
  Plus,
  Users,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
  HardHat,
  Search,
} from 'lucide-react';
import { DashboardHeader } from '../../components/DashboardHeader';
import { mockProjects, mockUsers, mockBoreholes, mockSiteLogs } from '../../lib/mockData';
import { Project, User } from '../../types';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Project Form State
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectCode, setNewProjectCode] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const filteredProjects = projects.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.project_name.toLowerCase().includes(q) ||
      p.project_code.toLowerCase().includes(q) ||
      p.client_name.toLowerCase().includes(q)
    );
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !newClientName.trim()) return;

    const newProj: Project = {
      id: `proj-${Date.now()}`,
      project_code: newProjectCode.trim() || `PROJ-${Math.floor(100 + Math.random() * 900)}`,
      project_name: newProjectName.trim(),
      client_name: newClientName.trim(),
      location_address: newLocation.trim() || 'Site Sector 4',
      city: 'Hyderabad',
      state: 'Telangana',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setProjects([newProj, ...projects]);
    setIsCreateModalOpen(false);
    setNewProjectName('');
    setNewProjectCode('');
    setNewClientName('');
    setNewLocation('');
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-100">
      <DashboardHeader logs={mockSiteLogs} projects={projects} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Page Top Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FolderGit2 className="w-6 h-6 text-blue-600" />
              <span>Multi-Project & Field Assignment Engine</span>
            </h1>
            <p className="text-xs text-slate-500">
              Admin & Lead Geologist control center to initialize project scopes, register boreholes, and assign certified field engineers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              Create Project
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by project title, code, client name..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {filteredProjects.length} Projects Configured
          </span>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((proj) => {
            const projectBoreholes = mockBoreholes.filter((b) => b.project_id === proj.id);
            const assignedEngineers = mockUsers.filter((u) => u.role === 'field_engineer');

            return (
              <div
                key={proj.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded border border-blue-200">
                      {proj.project_code}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        proj.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {proj.status === 'active' ? '● Active Operations' : 'Completed'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {proj.project_name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Client: <strong className="text-slate-700 font-medium">{proj.client_name}</strong>
                    </p>
                  </div>

                  {proj.location_address && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{proj.location_address}</span>
                    </div>
                  )}

                  {/* Boreholes summary */}
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Stationed Boreholes:</span>
                      <span className="font-bold text-slate-800 font-mono">
                        {projectBoreholes.length || 2} Points
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {projectBoreholes.length > 0 ? (
                        projectBoreholes.map((b) => (
                          <span
                            key={b.id}
                            className="text-[10px] font-mono font-semibold bg-white px-2 py-0.5 rounded border border-slate-300 text-slate-700"
                          >
                            {b.borehole_no} ({b.depth_drilled_m}m / {b.depth_target_m}m)
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400">BH-01, BH-02 (Allocated)</span>
                      )}
                    </div>
                  </div>

                  {/* Assigned Engineers */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500 block">
                      Assigned Field Engineers:
                    </span>
                    <div className="flex items-center -space-x-1.5 overflow-hidden">
                      {assignedEngineers.map((eng, idx) => (
                        <div
                          key={eng.id}
                          title={eng.full_name}
                          className="w-7 h-7 rounded-full bg-slate-800 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white ring-1 ring-slate-200"
                        >
                          {eng.full_name.slice(0, 2).toUpperCase()}
                        </div>
                      ))}
                      <span className="pl-3 text-xs text-slate-600 font-medium">
                        {assignedEngineers.length} Engineers Synced
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Created {new Date(proj.created_at).toLocaleDateString()}
                  </span>
                  <Link
                    href="/"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                  >
                    View Boreholes & Logs <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Create Project Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">Create Geotechnical Project</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Metro Line Extension - Site A"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Project Code *
                </label>
                <input
                  type="text"
                  required
                  value={newProjectCode}
                  onChange={(e) => setNewProjectCode(e.target.value)}
                  placeholder="e.g. METRO-EXT-A"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Client Organization *
                </label>
                <input
                  type="text"
                  required
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="e.g. Hyderabad Metro Rail Corporation"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Site Location Address
                </label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Survey No. 42, Hitec City Phase 2"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                >
                  Save & Assign Engineers
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

