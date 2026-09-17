import { promises as fs } from 'fs';
import path from 'path';
import { StorageAdapter, StorageResult, ConflictError, NotFoundError } from './adapter';
import { ListOptions, PaginationMeta } from '@/types';

/**
 * JSON File Adapter for local development
 * Reads and writes JSON files from the /data directory
 */
export class JsonFileAdapter implements StorageAdapter {
  private dataDir: string;
  private cache: Map<string, { data: unknown[]; timestamp: number }> = new Map();
  private cacheTTL = 5000; // 5 seconds cache TTL for dev

  constructor(dataDir?: string) {
    this.dataDir = dataDir || path.join(process.cwd(), 'data');
  }

  private getFilePath(collection: string): string {
    return path.join(this.dataDir, `${collection}.json`);
  }

  private isCacheValid(collection: string): boolean {
    const cached = this.cache.get(collection);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.cacheTTL;
  }

  private invalidateCache(collection: string): void {
    this.cache.delete(collection);
  }

  async get<T>(collection: string): Promise<T[]> {
    if (this.isCacheValid(collection)) {
      return this.cache.get(collection)!.data as T[];
    }

    const filePath = this.getFilePath(collection);
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content) as T[];
      this.cache.set(collection, { data, timestamp: Date.now() });
      return data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'ENOENT') {
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
    allData.push(data);
    await this.writeFile(collection, allData);
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
      version: existing.version + 1,
    };

    allData[index] = updated;
    await this.writeFile(collection, allData);
    return updated;
  }

  async delete(collection: string, id: string, deletedBy: string): Promise<void> {
    const allData = await this.get<Record<string, unknown>>(collection);
    const index = allData.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new NotFoundError(collection, id);
    }

    allData[index] = {
      ...allData[index],
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      deletedBy,
    };

    await this.writeFile(collection, allData);
  }

  async bulkUpdate<T extends { id: string }>(collection: string, items: T[]): Promise<T[]> {
    const allData = await this.get<T>(collection);
    const updatedItems: T[] = [];

    for (const item of items) {
      const index = allData.findIndex((d) => d.id === item.id);
      if (index !== -1) {
        allData[index] = { ...allData[index], ...item };
        updatedItems.push(allData[index]);
      }
    }

    await this.writeFile(collection, allData);
    return updatedItems;
  }

  async append<T>(collection: string, data: T): Promise<T> {
    const allData = await this.get<T>(collection);
    allData.push(data);
    await this.writeFile(collection, allData);
    return data;
  }

  async replace<T>(collection: string, data: T[]): Promise<void> {
    await this.writeFile(collection, data);
  }

  private async writeFile(collection: string, data: unknown[]): Promise<void> {
    const filePath = this.getFilePath(collection);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    this.invalidateCache(collection);
  }
}
