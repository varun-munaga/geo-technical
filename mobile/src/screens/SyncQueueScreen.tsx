import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MobileQueuedLog } from '../types';
import { offlineStorage } from '../lib/offlineStorage';
import { syncManager } from '../lib/syncManager';

interface SyncQueueScreenProps {
  onBack: () => void;
}

export const SyncQueueScreen: React.FC<SyncQueueScreenProps> = ({ onBack }) => {
  const [logs, setLogs] = useState<MobileQueuedLog[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadQueuedLogs = async () => {
    const list = await offlineStorage.getQueuedLogs();
    setLogs(list);
  };

  useEffect(() => {
    loadQueuedLogs();
  }, []);

  const handleSyncAll = async () => {
    setIsSyncing(true);
    try {
      await syncManager.syncAllQueued();
      await loadQueuedLogs();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteItem = async (localId: string) => {
    await offlineStorage.deleteQueuedLog(localId);
    await loadQueuedLogs();
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>◀ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Offline Storage Queue</Text>
        <TouchableOpacity
          style={styles.syncBtn}
          onPress={handleSyncAll}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.syncBtnText}>Sync All</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.summaryBar}>
          <Text style={styles.summaryText}>
            Total Local Records: <Text style={styles.bold}>{logs.length}</Text>
          </Text>
          <Text style={styles.summaryHint}>
            Stored locally on device flash storage.
          </Text>
        </View>

        {logs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Queue is Clear</Text>
            <Text style={styles.emptySubtitle}>
              All borehole logs and photos are currently synchronized with the cloud backend.
            </Text>
          </View>
        ) : (
          <FlatList
            data={logs}
            keyExtractor={(item) => item.localId}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const isSynced = item.syncStatus === 'synced';
              const isFailed = item.syncStatus === 'failed';
              const isSyncingItem = item.syncStatus === 'syncing';

              return (
                <View style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <View>
                      <Text style={styles.bhCode}>
                        {item.boreholeNo} &bull; {item.projectCode}
                      </Text>
                      <Text style={styles.depthRange}>
                        Depth: {item.depthFrom.toFixed(2)}m – {item.depthTo.toFixed(2)}m
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusPill,
                        isSynced
                          ? styles.statusSynced
                          : isFailed
                          ? styles.statusFailed
                          : styles.statusPending,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusPillText,
                          isSynced
                            ? styles.statusSyncedText
                            : isFailed
                            ? styles.statusFailedText
                            : styles.statusPendingText,
                        ]}
                      >
                        {isSyncingItem
                          ? 'Syncing...'
                          : isSynced
                          ? '✓ Synced'
                          : isFailed
                          ? '! Failed'
                          : '● Pending'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.strataName} numberOfLines={2}>
                    {item.strataClassification}
                  </Text>

                  <View style={styles.detailsRow}>
                    <Text style={styles.detailText}>
                      Sample: <Text style={styles.bold}>{item.sampleNo}</Text>
                    </Text>
                    {item.sptNValue !== null && (
                      <Text style={styles.detailText}>
                        SPT N: <Text style={styles.bold}>{item.sptNValue}</Text>
                      </Text>
                    )}
                    <Text style={styles.detailText}>
                      Photos:{' '}
                      <Text style={styles.bold}>
                        {[item.photos.sitePhotoUri, item.photos.sampleCardUri, item.photos.fieldSheetUri].filter(Boolean).length} / 3
                      </Text>
                    </Text>
                  </View>

                  {item.syncError && (
                    <Text style={styles.errorText}>Error: {item.syncError}</Text>
                  )}

                  <View style={styles.itemActions}>
                    <Text style={styles.timestamp}>
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleDeleteItem(item.localId)}
                      style={styles.deleteBtn}
                    >
                      <Text style={styles.deleteBtnText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    paddingVertical: 4,
  },
  backBtnText: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '700',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  syncBtn: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  syncBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  summaryBar: {
    marginBottom: 14,
  },
  summaryText: {
    fontSize: 13,
    color: '#0f172a',
  },
  bold: {
    fontWeight: '800',
  },
  summaryHint: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  listContent: {
    gap: 12,
    paddingBottom: 40,
  },
  itemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bhCode: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: '800',
    color: '#0284c7',
  },
  depthRange: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0f172a',
    marginTop: 1,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusSynced: {
    backgroundColor: '#dcfce7',
  },
  statusFailed: {
    backgroundColor: '#fee2e2',
  },
  statusPending: {
    backgroundColor: '#fef3c7',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusSyncedText: {
    color: '#16a34a',
  },
  statusFailedText: {
    color: '#b91c1c',
  },
  statusPendingText: {
    color: '#b45309',
  },
  strataName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginTop: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 6,
  },
  detailText: {
    fontSize: 11,
    color: '#64748b',
  },
  errorText: {
    fontSize: 10,
    color: '#dc2626',
    marginTop: 6,
    fontWeight: '600',
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  timestamp: {
    fontSize: 10,
    color: '#94a3b8',
  },
  deleteBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  deleteBtnText: {
    fontSize: 11,
    color: '#94a3b8',
  },
});

