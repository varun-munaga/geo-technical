import AsyncStorage from '@react-native-async-storage/async-storage';
import { MobileQueuedLog, MobileProject, SyncStatus } from '../types';

const STORAGE_KEYS = {
  QUEUED_LOGS: '@terralog_queued_logs_v1',
  ASSIGNED_PROJECTS: '@terralog_assigned_projects_v1',
  ACTIVE_DRAFT: '@terralog_active_draft_v1',
  USER_PROFILE: '@terralog_user_profile_v1',
};

export class OfflineStorageService {
  /**
   * Save or append a new borehole site log payload to local offline queue
   */
  public async queueLog(log: MobileQueuedLog): Promise<void> {
    const existing = await this.getQueuedLogs();
    const updated = [log, ...existing.filter((item) => item.localId !== log.localId)];
    await AsyncStorage.setItem(STORAGE_KEYS.QUEUED_LOGS, JSON.stringify(updated));
  }

  /**
   * Retrieve all locally stored site logs
   */
  public async getQueuedLogs(): Promise<MobileQueuedLog[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.QUEUED_LOGS);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (err) {
      console.error('Error reading queued logs:', err);
      return [];
    }
  }

  /**
   * Update sync status of a specific queued log
   */
  public async updateLogSyncStatus(
    localId: string,
    status: SyncStatus,
    errorMsg?: string,
    remoteLogId?: string,
    remoteXlsxUrl?: string
  ): Promise<void> {
    const logs = await this.getQueuedLogs();
    const updated = logs.map((item) => {
      if (item.localId === localId) {
        return {
          ...item,
          syncStatus: status,
          syncError: errorMsg || undefined,
          remoteLogId: remoteLogId || item.remoteLogId,
          remoteXlsxUrl: remoteXlsxUrl || item.remoteXlsxUrl,
        };
      }
      return item;
    });
    await AsyncStorage.setItem(STORAGE_KEYS.QUEUED_LOGS, JSON.stringify(updated));
  }

  /**
   * Delete a log from local queue
   */
  public async deleteQueuedLog(localId: string): Promise<void> {
    const logs = await this.getQueuedLogs();
    const updated = logs.filter((item) => item.localId !== localId);
    await AsyncStorage.setItem(STORAGE_KEYS.QUEUED_LOGS, JSON.stringify(updated));
  }

  /**
   * Cache assigned projects offline for zero-network startup
   */
  public async cacheAssignedProjects(projects: MobileProject[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.ASSIGNED_PROJECTS, JSON.stringify(projects));
  }

  public async getCachedAssignedProjects(): Promise<MobileProject[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.ASSIGNED_PROJECTS);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  /**
   * Active form draft autosave so engineer never loses unsaved inputs if app backgrounds
   */
  public async saveFormDraft(draftData: any): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_DRAFT, JSON.stringify(draftData));
  }

  public async getFormDraft(): Promise<any | null> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_DRAFT);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  public async clearFormDraft(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_DRAFT);
  }
}

export const offlineStorage = new OfflineStorageService();

