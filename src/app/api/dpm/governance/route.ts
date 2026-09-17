import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getSession } from '@/lib/auth/session';
import { 
  successResponse, 
  unauthorizedResponse 
} from '@/lib/utils/api-response';
import { ProjectDPMLifecycle, Project } from '@/types';

const DPM_DATA_PATH = path.join(process.cwd(), 'data', 'dpm-data.json');
const PROJECTS_PATH = path.join(process.cwd(), 'data', 'projects.json');

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return unauthorizedResponse('กรุณาเข้าสู่ระบบ');
    }

    let dpmMap: Record<string, ProjectDPMLifecycle> = {};
    if (fs.existsSync(DPM_DATA_PATH)) {
      dpmMap = JSON.parse(fs.readFileSync(DPM_DATA_PATH, 'utf-8'));
    }

    let projects: Project[] = [];
    if (fs.existsSync(PROJECTS_PATH)) {
      projects = JSON.parse(fs.readFileSync(PROJECTS_PATH, 'utf-8'));
    }

    // Portfolio metrics
    const totalProjects = projects.length;
    let upstreamCount = 0;
    let midstreamCount = 0;
    let downstreamCount = 0;

    const allCRs: any[] = [];
    const highRisks: any[] = [];
    let totalTestCases = 0;
    let passedTestCases = 0;
    let totalDefects = 0;
    let openDefects = 0;

    for (const p of projects) {
      const dpm = dpmMap[p.id];
      if (dpm) {
        if (dpm.currentPhase === 'UPSTREAM') upstreamCount++;
        else if (dpm.currentPhase === 'MIDSTREAM') midstreamCount++;
        else if (dpm.currentPhase === 'DOWNSTREAM') downstreamCount++;

        // CCB Requests
        if (dpm.changeRequests) {
          dpm.changeRequests.forEach(cr => {
            allCRs.push({
              ...cr,
              projectId: p.id,
              projectName: p.projectName
            });
          });
        }

        // Risks
        if (dpm.risks) {
          dpm.risks.forEach(r => {
            if (r.severityLevel === 'HIGH' || r.severityLevel === 'EXTREME') {
              highRisks.push({
                ...r,
                projectId: p.id,
                projectName: p.projectName
              });
            }
          });
        }

        // UAT
        if (dpm.atp && dpm.atp.modules) {
          dpm.atp.modules.forEach(m => {
            totalTestCases += m.totalTestCases;
            passedTestCases += m.passedTestCases;
          });
        }

        // Defects
        if (dpm.defects) {
          totalDefects += dpm.defects.length;
          openDefects += dpm.defects.filter(d => d.status === 'OPEN' || d.status === 'IN_PROGRESS').length;
        }
      }
    }

    const pendingCCB = allCRs.filter(cr => cr.ccbDecision === 'PENDING');
    const uatPassRate = totalTestCases > 0 ? ((passedTestCases / totalTestCases) * 100).toFixed(1) : '100.0';

    return successResponse({
      summary: {
        totalProjects,
        upstreamCount,
        midstreamCount,
        downstreamCount,
        pendingCCBCount: pendingCCB.length,
        highRiskCount: highRisks.length,
        uatPassRate: parseFloat(uatPassRate),
        openDefectsCount: openDefects
      },
      pendingChangeRequests: pendingCCB.slice(0, 10),
      topRisks: highRisks.slice(0, 10),
      recentProjectsDpm: projects.slice(0, 15).map(p => ({
        id: p.id,
        projectNo: p.projectNo,
        projectName: p.projectName,
        budget: p.budget,
        status: p.status,
        dpmPhase: dpmMap[p.id]?.currentPhase || 'UPSTREAM',
        phaseProgress: dpmMap[p.id]?.phaseProgress || { upstream: 0, midstream: 0, downstream: 0 }
      }))
    }, 'ดึงข้อมูล DPM Portfolio Governance สำเร็จ');
  } catch (err: any) {
    return unauthorizedResponse(err.message || 'เกิดข้อผิดพลาด');
  }
}
