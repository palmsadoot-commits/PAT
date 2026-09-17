import { NextRequest } from 'next/server';
import { getStorage, COLLECTIONS } from '@/lib/storage/factory';
import { VercelBlobAdapter } from '@/lib/storage/vercel-blob-adapter';
import { successResponse, errorResponse } from '@/lib/utils/api-response';

export async function POST(req: NextRequest) {
  try {
    const storage = getStorage();
    if (storage instanceof VercelBlobAdapter) {
      const collectionsToSeed = Object.values(COLLECTIONS);
      await storage.seedFromLocal(collectionsToSeed);
      return successResponse({ seeded: collectionsToSeed.length }, 'นำเข้าข้อมูลตั้งต้นสู่ Vercel Blob เรียบร้อยแล้ว');
    }

    return successResponse({ message: 'ปัจจุบันใช้งาน JsonFileAdapter อยู่แล้ว ไม่จำเป็นต้อง Seed' });
  } catch (error: any) {
    console.error('Seed error:', error);
    return errorResponse(error.message || 'เกิดข้อผิดพลาดในการนำเข้าข้อมูลตั้งต้น', 'SERVER_ERROR', 500);
  }
}
