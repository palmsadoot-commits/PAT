import { StorageAdapter } from './adapter';
import { JsonFileAdapter } from './json-file-adapter';
import { VercelBlobAdapter } from './vercel-blob-adapter';

let storageInstance: StorageAdapter | null = null;

/**
 * Factory function to create the appropriate storage adapter
 * based on the current environment.
 * 
 * Development: JsonFileAdapter (reads/writes local JSON files)
 * Production: VercelBlobAdapter (reads/writes Vercel Blob storage)
 */
export function createStorageAdapter(): StorageAdapter {
  if (storageInstance) {
    return storageInstance;
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN;

  if (isProduction && hasBlobToken) {
    storageInstance = new VercelBlobAdapter('pat-data');
    console.log('[Storage] Using VercelBlobAdapter (production)');
  } else {
    storageInstance = new JsonFileAdapter();
    console.log('[Storage] Using JsonFileAdapter (development)');
  }

  return storageInstance;
}

/**
 * Get the singleton storage adapter instance
 */
export function getStorage(): StorageAdapter {
  return createStorageAdapter();
}

/**
 * Reset the storage adapter instance (useful for testing)
 */
export function resetStorage(): void {
  storageInstance = null;
}

// Collection names as constants to prevent typos
export const COLLECTIONS = {
  USERS: 'users',
  ORGANIZATIONS: 'organizations',
  DEPARTMENTS: 'departments',
  PROJECT_TYPES: 'project-types',
  PROJECTS: 'projects',
  PROJECT_DOCUMENTS: 'project-documents',
  PROJECT_WORKFLOWS: 'project-workflows',
  PROJECT_HISTORY: 'project-history',
  PROJECT_COMMENTS: 'project-comments',
  NOTIFICATIONS: 'notifications',
  SLA_SETTINGS: 'sla-settings',
  AUDIT_LOGS: 'audit-logs',
  SYSTEM_SETTINGS: 'system-settings',
  DASHBOARD_CONFIG: 'dashboard-config',
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
