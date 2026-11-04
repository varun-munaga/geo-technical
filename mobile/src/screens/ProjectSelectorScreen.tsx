import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { FieldEngineerProfile, MobileProject, MobileBorehole } from '../types';
import { SyncBanner } from '../components/SyncBanner';

interface ProjectSelectorScreenProps {
  user: FieldEngineerProfile;
  onSelectBorehole: (project: MobileProject, borehole: MobileBorehole) => void;
  onOpenQueue: () => void;
  onLogout: () => void;
}

// Assigned projects matching RLS policy: field engineer only gets active assigned projects
const ASSIGNED_PROJECTS: MobileProject[] = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    project_code: 'METRO-EXT-A',
    project_name: 'Metro Line Extension - Site A (Corridor 3)',
    client_name: 'Hyderabad Metro Rail Corporation (HMRCL)',
    location_address: 'Survey No. 42, Hitec City Phase 2',
    status: 'active',
    boreholes: [
      {
        id: '30000000-0000-0000-0000-000000000001',
        borehole_no: 'BH-01',
        depth_target_m: 30.0,
        depth_drilled_m: 18.5,
        status: 'in_progress',
      },
      {
        id: '30000000-0000-0000-0000-000000000002',
        borehole_no: 'BH-02',
        depth_target_m: 25.0,
        depth_drilled_m: 25.0,
        status: 'completed',
      },
    ],
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    project_code: 'TOWER-GACH-45',
    project_name: 'Commercial Tower - Gachibowli (45 Floors)',
    client_name: 'Phoenix Infocity Real Estate Pvt Ltd',
    location_address: 'Plot 18/A, Financial District',
    status: 'active',
    boreholes: [
      {
        id: '30000000-0000-0000-0000-000000000003',
        borehole_no: 'BH-03',
        depth_target_m: 45.0,
        depth_drilled_m: 22.0,
        status: 'in_progress',
      },
      {
        id: '30000000-0000-0000-0000-000000000004',
        borehole_no: 'TP-01',
        depth_target_m: 5.0,
        depth_drilled_m: 4.5,
        status: 'completed',
      },
    ],
  },
];

export const ProjectSelectorScreen: React.FC<ProjectSelectorScreenProps> = ({
  user,
  onSelectBorehole,
  onOpenQueue,
  onLogout,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(ASSIGNED_PROJECTS[0].id);

  const activeProject = ASSIGNED_PROJECTS.find((p) => p.id === selectedProjectId) || ASSIGNED_PROJECTS[0];

  return (
    <SafeAreaView style={styles.safeContainer}>
      <SyncBanner onOpenQueue={onOpenQueue} />

      {/* Engineer App Bar */}
      <View style={styles.appBar}>
        <View>
          <Text style={styles.appBarSubtitle}>Logged in as Field Engineer:</Text>
          <Text style={styles.appBarTitle}>{user.full_name}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Text style={styles.logoutText}>Switch</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Assigned Active Projects ({ASSIGNED_PROJECTS.length})</Text>
          <Text style={styles.sectionSubtitle}>
            Row-Level Security filtered to active projects allocated to your credentials.
          </Text>
        </View>

        {/* Project Selector Chips */}
        <View style={styles.projectList}>
          {ASSIGNED_PROJECTS.map((proj) => {
            const isSelected = proj.id === selectedProjectId;
            return (
              <TouchableOpacity
                key={proj.id}
                style={[styles.projectCard, isSelected && styles.projectCardSelected]}
                onPress={() => setSelectedProjectId(proj.id)}
              >
                <View style={styles.projectCardHeader}>
                  <Text style={[styles.projectCode, isSelected && styles.projectCodeSelected]}>
                    {proj.project_code}
                  </Text>
                  <Text style={styles.statusBadge}>● Active</Text>
                </View>

                <Text style={styles.projectName}>{proj.project_name}</Text>
                <Text style={styles.clientName}>Client: {proj.client_name}</Text>
                <Text style={styles.locationText}>📍 {proj.location_address}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Boreholes in Selected Project */}
        <View style={styles.boreholeSection}>
          <Text style={styles.sectionTitle}>
            Boreholes in {activeProject.project_code}
          </Text>
          <Text style={styles.sectionSubtitle}>
            Select borehole station to record depth intervals, SPT counts, and capture photos.
          </Text>

          <View style={styles.boreholeGrid}>
            {activeProject.boreholes.map((bh) => {
              const isFinished = bh.status === 'completed';
              return (
                <View key={bh.id} style={styles.boreholeCard}>
                  <View style={styles.boreholeHeader}>
                    <Text style={styles.boreholeNo}>{bh.borehole_no}</Text>
                    <View
                      style={[
                        styles.bhStatusPill,
                        isFinished ? styles.bhStatusCompleted : styles.bhStatusProgress,
                      ]}
                    >
                      <Text
                        style={[
                          styles.bhStatusText,
                          isFinished ? styles.bhStatusTextCompleted : styles.bhStatusTextProgress,
                        ]}
                      >
                        {isFinished ? 'Completed' : 'In Progress'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.depthMetricRow}>
                    <View>
                      <Text style={styles.metricLabel}>Depth Drilled</Text>
                      <Text style={styles.metricVal}>{bh.depth_drilled_m.toFixed(1)} m</Text>
                    </View>
                    <View>
                      <Text style={styles.metricLabel}>Target Depth</Text>
                      <Text style={styles.metricVal}>{bh.depth_target_m.toFixed(1)} m</Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${Math.min(
                            100,
                            Math.round((bh.depth_drilled_m / bh.depth_target_m) * 100)
                          )}%`,
                        },
                      ]}
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.selectBoreholeBtn}
                    onPress={() => onSelectBorehole(activeProject, bh)}
                  >
                    <Text style={styles.selectBoreholeBtnText}>
                      Record Borehole Entry ➔
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  appBar: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appBarSubtitle: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  appBarTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  logoutBtn: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  logoutText: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  projectList: {
    marginBottom: 20,
    gap: 12,
  },
  projectCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    padding: 14,
  },
  projectCardSelected: {
    borderColor: '#0284c7',
    backgroundColor: '#f0f9ff',
  },
  projectCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  projectCode: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '800',
    color: '#0284c7',
  },
  projectCodeSelected: {
    color: '#0369a1',
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16a34a',
  },
  projectName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  clientName: {
    fontSize: 11,
    color: '#475569',
    marginTop: 3,
  },
  locationText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 3,
  },
  boreholeSection: {
    marginTop: 10,
  },
  boreholeGrid: {
    gap: 12,
    marginTop: 10,
  },
  boreholeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  boreholeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  boreholeNo: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: '900',
    color: '#0f172a',
  },
  bhStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  bhStatusProgress: {
    backgroundColor: '#e0f2fe',
  },
  bhStatusCompleted: {
    backgroundColor: '#dcfce7',
  },
  bhStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  bhStatusTextProgress: {
    color: '#0284c7',
  },
  bhStatusTextCompleted: {
    color: '#16a34a',
  },
  depthMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    paddingHorizontal: 4,
  },
  metricLabel: {
    fontSize: 10,
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  metricVal: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: '800',
    color: '#0f172a',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0284c7',
  },
  selectBoreholeBtn: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  selectBoreholeBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});

