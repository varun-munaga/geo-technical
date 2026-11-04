import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { syncManager } from '../lib/syncManager';

interface SyncBannerProps {
  onOpenQueue?: () => void;
}

export const SyncBanner: React.FC<SyncBannerProps> = ({ onOpenQueue }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = syncManager.subscribe((online, count) => {
      setIsOnline(online);
      setPendingCount(count);
    });
    return () => unsubscribe();
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await syncManager.syncAllQueued();
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        isOnline ? styles.onlineContainer : styles.offlineContainer,
      ]}
    >
      <View style={styles.leftRow}>
        <View
          style={[
            styles.dot,
            isOnline ? styles.onlineDot : styles.offlineDot,
          ]}
        />
        <View>
          <Text style={styles.statusTitle}>
            {isOnline ? 'Online (Realtime Uplink)' : 'Offline Mode (Local Storage)'}
          </Text>
          <Text style={styles.statusSubtitle}>
            {pendingCount === 0
              ? 'All borehole entries synchronized'
              : `${pendingCount} entries queued locally`}
          </Text>
        </View>
      </View>

      <View style={styles.rightActions}>
        {pendingCount > 0 && isOnline && (
          <TouchableOpacity
            style={styles.syncButton}
            onPress={handleManualSync}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.syncButtonText}>Sync Now</Text>
            )}
          </TouchableOpacity>
        )}

        {onOpenQueue && (
          <TouchableOpacity style={styles.queueButton} onPress={onOpenQueue}>
            <Text style={styles.queueButtonText}>Queue ({pendingCount})</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  onlineContainer: {
    backgroundColor: '#f0fdf4',
    borderBottomColor: '#bbf7d0',
  },
  offlineContainer: {
    backgroundColor: '#fffbeb',
    borderBottomColor: '#fde68a',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  onlineDot: {
    backgroundColor: '#16a34a',
  },
  offlineDot: {
    backgroundColor: '#d97706',
  },
  statusTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  statusSubtitle: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 1,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  syncButton: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  syncButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  queueButton: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  queueButtonText: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '600',
  },
});

