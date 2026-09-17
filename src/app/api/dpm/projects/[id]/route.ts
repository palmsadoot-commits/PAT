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

import { getDpmData, saveDpmData } from '@/lib/storage/dpm-store';

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
