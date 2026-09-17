import { ListOptions, PaginationMeta } from '@/types';

export interface StorageResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface StorageAdapter {
  /**
   * Get all records from a collection
   */
  get<T>(collection: string): Promise<T[]>;

  /**
   * Get a single record by ID
   */
  getById<T extends { id: string }>(collection: string, id: string): Promise<T | null>;

  /**
   * List records with pagination, sorting, and filtering
   */
  list<T>(collection: string, options: ListOptions): Promise<StorageResult<T>>;

  /**
   * Create a new record
   */
  create<T extends { id: string }>(collection: string, data: T): Promise<T>;

  /**
   * Update an existing record with optimistic concurrency check
   */
  update<T extends { id: string; version: number }>(
    collection: string,
    id: string,
    data: Partial<T>,
    expectedVersion: number
  ): Promise<T>;

  /**
   * Soft delete a record
   */
  delete(collection: string, id: string, deletedBy: string): Promise<void>;

  /**
   * Bulk update multiple records
   */
  bulkUpdate<T extends { id: string }>(collection: string, items: T[]): Promise<T[]>;

  /**
   * Append a record to a collection (for logs, history, etc.)
   */
  append<T>(collection: string, data: T): Promise<T>;

  /**
   * Replace entire collection data (for seeding/import)
   */
  replace<T>(collection: string, data: T[]): Promise<void>;
}

export class ConflictError extends Error {
  constructor(message?: string) {
    super(message || 'ข้อมูลถูกแก้ไขโดยผู้ใช้งานอื่นแล้ว กรุณารีเฟรชข้อมูลก่อนบันทึกอีกครั้ง');
    this.name = 'ConflictError';
  }
}

export class NotFoundError extends Error {
  constructor(collection: string, id: string) {
    super(`ไม่พบข้อมูล ${collection} รหัส ${id}`);
    this.name = 'NotFoundError';
  }
}
