import { getStorage, COLLECTIONS } from '@/lib/storage/factory';
import { AuditLog, AuditAction } from '@/types';
import { nowISO } from '@/lib/utils/date-utils';

export async function createAuditLog(params: {
  userId: string;
  action: AuditAction;
  module: string;
  recordId?: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, any>;
}): Promise<AuditLog> {
  try {
    const storage = getStorage();
    const log: AuditLog = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      userId: params.userId,
      action: params.action,
      module: params.module,
      recordId: params.recordId,
      description: params.description,
      ipAddress: params.ipAddress || '127.0.0.1',
      userAgent: params.userAgent || 'Unknown',
      metadata: params.metadata,
      createdAt: nowISO(),
    };

    await storage.append(COLLECTIONS.AUDIT_LOGS, log);
    return log;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Return the log object even if append fails so calling flow doesn't break
    return {
      id: `AUD-${Date.now()}`,
      userId: params.userId,
      action: params.action,
      module: params.module,
      recordId: params.recordId,
      description: params.description,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      createdAt: nowISO(),
    };
  }
}
