import fs from 'fs';
import path from 'path';
import os from 'os';
import { ProjectDPMLifecycle } from '@/types';

// In-memory cache preserved across requests in warm serverless container
let dpmMemoryCache: Record<string, ProjectDPMLifecycle> | null = null;

const SEED_DPM_PATH = path.join(process.cwd(), 'data', 'dpm-data.json');
const TMP_DPM_PATH = path.join(os.tmpdir(), 'pat-data', 'dpm-data.json');

export function getDpmData(): Record<string, ProjectDPMLifecycle> {
  if (dpmMemoryCache) {
    return dpmMemoryCache;
  }

  // 1. Try reading from /tmp if previously modified on Vercel
  if (fs.existsSync(TMP_DPM_PATH)) {
    try {
      const content = fs.readFileSync(TMP_DPM_PATH, 'utf-8');
      dpmMemoryCache = JSON.parse(content);
      return dpmMemoryCache!;
    } catch {
      // Fallback
    }
  }

  // 2. Fallback to bundled seed data
  if (fs.existsSync(SEED_DPM_PATH)) {
    try {
      const content = fs.readFileSync(SEED_DPM_PATH, 'utf-8');
      dpmMemoryCache = JSON.parse(content);
      return dpmMemoryCache!;
    } catch (err) {
      console.error('Error reading seed dpm-data.json:', err);
    }
  }

  dpmMemoryCache = {};
  return dpmMemoryCache;
}

export function saveDpmData(data: Record<string, ProjectDPMLifecycle>): void {
  dpmMemoryCache = data;

  // On Vercel / serverless, write to /tmp
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    try {
      fs.mkdirSync(path.dirname(TMP_DPM_PATH), { recursive: true });
      fs.writeFileSync(TMP_DPM_PATH, JSON.stringify(data, null, 2), 'utf-8');
      return;
    } catch (err) {
      console.warn('[DPM] Error writing to /tmp:', err);
    }
  }

  // Local development
  try {
    fs.mkdirSync(path.dirname(SEED_DPM_PATH), { recursive: true });
    fs.writeFileSync(SEED_DPM_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err: any) {
    if (err?.code === 'EROFS' || err?.code === 'EACCES') {
      try {
        fs.mkdirSync(path.dirname(TMP_DPM_PATH), { recursive: true });
        fs.writeFileSync(TMP_DPM_PATH, JSON.stringify(data, null, 2), 'utf-8');
      } catch (tmpErr) {
        console.warn('[DPM] Fallback write to /tmp failed:', tmpErr);
      }
    }
  }
}
