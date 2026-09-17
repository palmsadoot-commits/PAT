import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { StorageAdapter, StorageResult, ConflictError, NotFoundError } from './adapter';
import { ListOptions, PaginationMeta } from '@/types';

// Global in-memory cache shared across requests in the warm serverless container
const globalMemoryStore = new Map<string, unknown[]>();

/**
 * JSON File Adapter for development and serverless deployment
 * Uses hybrid storage: In-memory + Writable /tmp (Vercel) + Bundled Seed Data
 */
export class JsonFileAdapter implements StorageAdapter {
  private seedDir: string;
  private writableDir: string;

  constructor(seedDir?: string, writableDir?: string) {
    this.seedDir = seedDir || path.join(process.cwd(), 'data');
    
    // In Vercel serverless / AWS Lambda, use os.tmpdir() for writes
    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      this.writableDir = writableDir || path.join(os.tmpdir(), 'pat-data');
    } else {
      this.writableDir = writableDir || this.seedDir;
    }
  }

  private getSeedPath(collection: string): string {
    return path.join(this.seedDir, `${collection}.json`);
  }

  private getWritablePath(collection: string): string {
    return path.join(this.writableDir, `${collection}.json`);
  }

  async get<T>(collection: string): Promise<T[]> {
    // 1. Check in-memory store
    if (globalMemoryStore.has(collection)) {
      return globalMemoryStore.get(collection) as T[];
    }

    // 2. Check writable directory (if previously written in /tmp)
    const writablePath = this.getWritablePath(collection);
    try {
      const content = await fs.readFile(writablePath, 'utf-8');
      const data = JSON.parse(content) as T[];
      globalMemoryStore.set(collection, data as unknown[]);
      return data;
    } catch {
      // Not in writable dir yet, proceed to seed
    }

    // 3. Read bundled seed data
    const seedPath = this.getSeedPath(collection);
    try {
      const content = await fs.readFile(seedPath, 'utf-8');
      const data = JSON.parse(content) as T[];
      globalMemoryStore.set(collection, data as unknown[]);
      return data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'ENOENT') {
        globalMemoryStore.set(collection, []);
        return [];
      }
      throw error;
    }
  }

  async getById<T extends { id: string }>(collection: string, id: string): Promise<T | null> {
    const data = await this.get<T>(collection);
    return data.find((item) => item.id === id) || null;
  }

  async list<T>(collection: string, options: ListOptions): Promise<StorageResult<T>> {
    let data = await this.get<T>(collection);

    // Filter out soft-deleted items
    data = data.filter((item) => !(item as { isDeleted?: boolean }).isDeleted);

    // Apply search
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      data = data.filter((item) => {
        return Object.values(item as Record<string, unknown>).some(
          (value) => typeof value === 'string' && value.toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply filters
    if (options.filters) {
      for (const [key, value] of Object.entries(options.filters)) {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            data = data.filter((item) => value.includes((item as Record<string, unknown>)[key]));
          } else {
            data = data.filter((item) => (item as Record<string, unknown>)[key] === value);
          }
        }
      }
    }

    // Apply sorting
    if (options.sortBy) {
      const sortOrder = options.sortOrder === 'desc' ? -1 : 1;
      data.sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[options.sortBy!];
        const bVal = (b as Record<string, unknown>)[options.sortBy!];
        if (aVal === bVal) return 0;
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return aVal.localeCompare(bVal) * sortOrder;
        }
        return ((aVal as number) < (bVal as number) ? -1 : 1) * sortOrder;
      });
    }

    // Apply pagination
    const page = options.page || 1;
    const pageSize = options.pageSize || 10;
    const total = data.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginatedData = data.slice(startIndex, startIndex + pageSize);

    const pagination: PaginationMeta = {
      page,
      pageSize,
      total,
      totalPages,
    };

    return { data: paginatedData, pagination };
  }

  async create<T extends { id: string }>(collection: string, data: T): Promise<T> {
    const allData = await this.get<T>(collection);
    const updatedData = [...allData, data];
    await this.writeFile(collection, updatedData);
    return data;
  }

  async update<T extends { id: string; version: number }>(
    collection: string,
    id: string,
    updates: Partial<T>,
    expectedVersion: number
  ): Promise<T> {
    const allData = await this.get<T>(collection);
    const index = allData.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new NotFoundError(collection, id);
    }

    const existing = allData[index] as T & { version: number };
    if (existing.version !== expectedVersion) {
      throw new ConflictError();
    }

    const updated = {
      ...existing,
      ...updates,
      id: existing.id, // Prevent ID change
      version: (existing.version || 1) + 1,
    };

    const updatedData = [...allData];
    updatedData[index] = updated;
    await this.writeFile(collection, updatedData);
    return updated;
  }

  async delete(collection: string, id: string, deletedBy: string): Promise<void> {
    const allData = await this.get<Record<string, unknown>>(collection);
    const index = allData.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new NotFoundError(collection, id);
    }

    const updatedData = [...allData];
    updatedData[index] = {
      ...updatedData[index],
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      deletedBy,
    };

    await this.writeFile(collection, updatedData);
  }

  async bulkUpdate<T extends { id: string }>(collection: string, items: T[]): Promise<T[]> {
    const allData = await this.get<T>(collection);
    const updatedData = [...allData];
    const updatedItems: T[] = [];

    for (const item of items) {
      const index = updatedData.findIndex((d) => (d as any).id === item.id);
      if (index !== -1) {
        updatedData[index] = { ...updatedData[index], ...item };
        updatedItems.push(updatedData[index] as T);
      }
    }

    await this.writeFile(collection, updatedData);
    return updatedItems;
  }

  async append<T>(collection: string, data: T): Promise<T> {
    const allData = await this.get<T>(collection);
    const updatedData = [...allData, data];
    await this.writeFile(collection, updatedData);
    return data;
  }

  async replace<T>(collection: string, data: T[]): Promise<void> {
    await this.writeFile(collection, [...data]);
  }

  private async writeFile(collection: string, data: unknown[]): Promise<void> {
    // 1. Immediately update in-memory store so all queries in this instance see the new state
    globalMemoryStore.set(collection, data);

    // 2. Persist to disk
    const targetPath = this.getWritablePath(collection);
    try {
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.writeFile(targetPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err: any) {
      // If writing to repo directory failed with EROFS or permission error (e.g. Vercel serverless)
      if (err?.code === 'EROFS' || err?.code === 'EACCES') {
        const tmpPath = path.join(os.tmpdir(), 'pat-data', `${collection}.json`);
        try {
          await fs.mkdir(path.dirname(tmpPath), { recursive: true });
          await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
        } catch (tmpErr) {
          console.warn(`[JsonFileAdapter] Failed fallback write to /tmp for "${collection}":`, tmpErr);
        }
      } else {
        console.warn(`[JsonFileAdapter] Write warning for "${collection}":`, err);
      }
    }
  }
}
