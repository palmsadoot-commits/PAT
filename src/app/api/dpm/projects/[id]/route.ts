import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getSession } from '@/lib/auth/session';
import { 
  successResponse, 
  notFoundResponse, 
  unauthorizedResponse 
} from '@/lib/utils/api-response';
import { ProjectDPMLifecycle } from '@/types';

const DPM_DATA_PATH = path.join(process.cwd(), 'data', 'dpm-data.json');

function getDpmData(): Record<string, ProjectDPMLifecycle> {
  try {
    if (fs.existsSync(DPM_DATA_PATH)) {
      return JSON.parse(fs.readFileSync(DPM_DATA_PATH, 'utf-8'));
    }
  } catch (err) {
    console.error('Error reading dpm-data.json:', err);
  }
  return {};
}

function saveDpmData(data: Record<string, ProjectDPMLifecycle>) {
  fs.writeFileSync(DPM_DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return unauthorizedResponse('กรุณาเข้าสู่ระบบ');
    }

    const { id } = await params;
    const allDpm = getDpmData();
    let projectDpm = allDpm[id];

    if (!projectDpm) {
      // Return a basic template if not yet initialized
      projectDpm = {
        projectId: id,
        currentPhase: 'UPSTREAM',
        phaseProgress: { upstream: 30, midstream: 0, downstream: 0 },
        stakeholders: [],
        raciMatrix: [],
        compliance: [],
        rtm: [],
        changeRequests: [],
        risks: [],
        defects: [],
        milestones: []
      };
    }

    return successResponse(projectDpm, 'ดึงข้อมูล DPM Lifecycle สำเร็จ');
  } catch (err: any) {
    return notFoundResponse('เกิดข้อผิดพลาดในการดึงข้อมูล DPM');
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return unauthorizedResponse('กรุณาเข้าสู่ระบบ');
    }

    const { id } = await params;
    const body = await req.json();
    const allDpm = getDpmData();

    allDpm[id] = {
      ...(allDpm[id] || { projectId: id }),
      ...body,
      projectId: id
    };

    saveDpmData(allDpm);
    return successResponse(allDpm[id], 'อัปเดตข้อมูล DPM Lifecycle สำเร็จ');
  } catch (err: any) {
    return notFoundResponse(err.message || 'ไม่สามารถบันทึกข้อมูลได้');
  }
}
