import { put, list, del, head } from '@vercel/blob';
import { StorageAdapter, StorageResult, ConflictError, NotFoundError } from './adapter';
import { ListOptions, PaginationMeta } from '@/types';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Vercel Blob Adapter for production deployment
 * Stores each collection as a JSON file in Vercel Blob (private)
 */
export class VercelBlobAdapter implements StorageAdapter {
  private prefix: string;
  private cache: Map<string, { data: unknown[]; timestamp: number; url: string }> = new Map();
  private cacheTTL = 10000; // 10 seconds cache TTL for production

  constructor(prefix: string = 'pat-data') {
    this.prefix = prefix;
  }

  private getBlobPath(collection: string): string {
    return `${this.prefix}/${collection}.json`;
  }

  private isCacheValid(collection: string): boolean {
    const cached = this.cache.get(collection);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.cacheTTL;
  }

  private invalidateCache(collection: string): void {
    this.cache.delete(collection);
  }

  /**
   * Seed data from local JSON files to Vercel Blob (first-time setup)
   */
  async seedFromLocal(collections: string[]): Promise<void> {
    const dataDir = path.join(process.cwd(), 'data');
    
    for (const collection of collections) {
      const blobPath = this.getBlobPath(collection);
      
      // Check if blob already exists
      try {
        const existing = await list({ prefix: blobPath });
        if (existing.blobs.length > 0) {
          console.log(`[Seed] Collection "${collection}" already exists in Blob, skipping.`);
          continue;
        }
      } catch {
        // Blob doesn't exist, proceed with seeding
      }

      // Read local JSON file
      const filePath = path.join(dataDir, `${collection}.json`);
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(content);
        
        await put(blobPath, JSON.stringify(data), {
          access: 'public', // Using public for simplicity; API routes protect access
          contentType: 'application/json',
          addRandomSuffix: false,
          allowOverwrite: true,
          cacheControlMaxAge: 60,
        });
        
        console.log(`[Seed] Collection "${collection}" seeded to Blob (${data.length} records).`);
      } catch (error) {
        console.warn(`[Seed] Could not seed "${collection}":`, error);
      }
    }
  }

  async get<T>(collection: string): Promise<T[]> {
    if (this.isCacheValid(collection)) {
      return this.cache.get(collection)!.data as T[];
    }

    const blobPath = this.getBlobPath(collection);
    
    try {
      const blobs = await list({ prefix: blobPath });
      if (blobs.blobs.length === 0) {
        return [];
      }
      
      const blobUrl = blobs.blobs[0].url;
      const response = await fetch(blobUrl, { cache: 'no-store' });
      if (!response.ok) {
        return [];
      }
      
      const data = (await response.json()) as T[];
      this.cache.set(collection, { data, timestamp: Date.now(), url: blobUrl });
      return data;
    } catch (error) {
      console.error(`[VercelBlob] Error reading "${collection}":`, error);
      return [];
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
    await this.writeBlob(collection, allData);
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
      id: existing.id,
      version: existing.version + 1,
    };

    allData[index] = updated;
    await this.writeBlob(collection, allData);
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

    await this.writeBlob(collection, allData);
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

    await this.writeBlob(collection, allData);
    return updatedItems;
  }

  async append<T>(collection: string, data: T): Promise<T> {
    const allData = await this.get<T>(collection);
    allData.push(data);
    await this.writeBlob(collection, allData);
    return data;
  }

  async replace<T>(collection: string, data: T[]): Promise<void> {
    await this.writeBlob(collection, data);
  }

  private async writeBlob(collection: string, data: unknown[]): Promise<void> {
    const blobPath = this.getBlobPath(collection);
    
    await put(blobPath, JSON.stringify(data), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 60,
    });

    this.invalidateCache(collection);
  }
}
