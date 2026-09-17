import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getStorage, COLLECTIONS } from '@/lib/storage/factory';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { Project, Organization, ProjectHistory, ProjectDPMLifecycle, User } from '@/types';
import { PROJECT_STATUS_LABELS } from '@/lib/utils/constants';

const DPM_DATA_PATH = path.join(process.cwd(), 'data', 'dpm-data.json');

export async function GET(req: NextRequest) {
  try {
    const storage = getStorage();

    const [allProjects, organizations, history, users] = await Promise.all([
      storage.get<Project>(COLLECTIONS.PROJECTS),
      storage.get<Organization>(COLLECTIONS.ORGANIZATIONS),
      storage.get<ProjectHistory>(COLLECTIONS.PROJECT_HISTORY),
      storage.get<User>(COLLECTIONS.USERS),
    ]);

    let dpmMap: Record<string, ProjectDPMLifecycle> = {};
    if (fs.existsSync(DPM_DATA_PATH)) {
      dpmMap = JSON.parse(fs.readFileSync(DPM_DATA_PATH, 'utf-8'));
    }

    const activeProjects = allProjects.filter((p) => !p.isDeleted);

    const statusCounts: Record<string, number> = {
      DRAFT: 0, SUBMITTED: 0, DOCUMENT_CHECK: 0, UNDER_REVIEW: 0,
      RETURNED: 0, PENDING_APPROVAL: 0, APPROVED: 0, REJECTED: 0,
      IN_PROGRESS: 0, COMPLETED: 0, CANCELLED: 0,
    };

    let totalBudget = 0;
    const orgMap = new Map<string, string>();
    organizations.forEach((org) => orgMap.set(org.id, org.name));

    const orgBudgetMap: Record<string, { name: string; budget: number; count: number }> = {};
    const fiscalYearMap: Record<string, number> = {};
    const monthlyTrendMap: Record<string, number> = {};
    const priorityCounts: Record<string, number> = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    const typeCounts: Record<string, number> = {};
    const budgetByStatus: Record<string, number> = {};

    activeProjects.forEach((p) => {
      if (statusCounts[p.status] !== undefined) statusCounts[p.status]++;
      else statusCounts[p.status] = 1;

      const budgetNum = typeof p.budget === 'number' ? p.budget : parseFloat(p.budget as unknown as string) || 0;
      totalBudget += budgetNum;
      budgetByStatus[p.status] = (budgetByStatus[p.status] || 0) + budgetNum;

      const orgName = orgMap.get(p.organizationId) || p.organizationId || 'ไม่ระบุหน่วยงาน';
      if (!orgBudgetMap[p.organizationId]) {
        orgBudgetMap[p.organizationId] = { name: orgName, budget: 0, count: 0 };
      }
      orgBudgetMap[p.organizationId].budget += budgetNum;
      orgBudgetMap[p.organizationId].count += 1;

      const fy = p.fiscalYear ? `ปี ${p.fiscalYear}` : 'ไม่ระบุ';
      fiscalYearMap[fy] = (fiscalYearMap[fy] || 0) + 1;

      if (p.priority && priorityCounts[p.priority] !== undefined) priorityCounts[p.priority]++;
      if (p.projectType) typeCounts[p.projectType] = (typeCounts[p.projectType] || 0) + 1;

      if (p.createdAt) {
        const date = new Date(p.createdAt);
        const monthKey = `${date.getFullYear() + 543}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyTrendMap[monthKey] = (monthlyTrendMap[monthKey] || 0) + 1;
      }
    });

    const statusChartData = Object.entries(statusCounts).map(([status, count]) => ({
      status, name: PROJECT_STATUS_LABELS[status]?.th || status, count,
    }));

    const orgChartData = Object.values(orgBudgetMap)
      .sort((a, b) => b.budget - a.budget)
      .map((item) => ({
        name: item.name.length > 20 ? item.name.substring(0, 18) + '...' : item.name,
        fullName: item.name, budget: item.budget, projectsCount: item.count,
      }));

    const monthlyTrendChartData = Object.entries(monthlyTrendMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));

    // Average Approval Time
    const approvedProjectsHistory = history.filter((h) => h.toStatus === 'APPROVED');
    let totalApprovalDays = 0;
    let approvedCount = 0;
    approvedProjectsHistory.forEach((hApprove) => {
      const submitEntry = history.find(
        (h) => h.projectId === hApprove.projectId && (h.toStatus === 'SUBMITTED' || h.action === 'SUBMIT')
      );
      if (submitEntry?.performedAt && hApprove.performedAt) {
        const diffMs = new Date(hApprove.performedAt).getTime() - new Date(submitEntry.performedAt).getTime();
        totalApprovalDays += Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
        approvedCount++;
      }
    });
    const averageApprovalDays = approvedCount > 0 ? Math.round((totalApprovalDays / approvedCount) * 10) / 10 : 4.5;

    // DPM Lifecycle Metrics & Drill-Down Datasets
    let dpmUpstream = 0, dpmMidstream = 0, dpmDownstream = 0;
    let totalTestCases = 0, passedTestCases = 0, totalDefects = 0, openDefects = 0, pendingCCBCount = 0, highRiskCount = 0;
    const topRisks: Array<{
      projectId: string;
      projectName: string;
      projectNo: string;
      description: string;
      category: string;
      riskScore: number;
      severityLevel: string;
      status: string;
      mitigationPlan: string;
      riskOwner: string;
    }> = [];

    const allRisks: Array<{
      id: string;
      projectId: string;
      projectName: string;
      projectNo: string;
      organizationId: string;
      organizationName: string;
      riskCode: string;
      riskTitle: string;
      category: string;
      likelihood: number;
      impact: number;
      riskScore: number;
      severityLevel: string;
      mitigationPlan: string;
      contingencyPlan: string;
      riskOwner: string;
      status: string;
    }> = [];

    const allChangeRequests: Array<{
      id: string;
      projectId: string;
      projectName: string;
      projectNo: string;
      organizationName: string;
      crNumber: string;
      title: string;
      requesterName: string;
      requestDate: string;
      reason: string;
      priority: string;
      scheduleImpactDays: number;
      costImpactBaht: number;
      scopeDescription: string;
      ccbDecision: string;
      ccbComments?: string;
    }> = [];

    const allDefects: Array<{
      id: string;
      projectId: string;
      projectName: string;
      projectNo: string;
      organizationName: string;
      defectCode: string;
      title: string;
      moduleName: string;
      severity: string;
      status: string;
      assignedTo: string;
      reportedDate: string;
      resolvedDate?: string;
    }> = [];

    for (const p of activeProjects) {
      const dpm = dpmMap[p.id];
      if (!dpm) continue;
      const orgName = orgMap.get(p.organizationId) || 'กระทรวงแรงงาน';

      if (dpm.currentPhase === 'UPSTREAM') dpmUpstream++;
      else if (dpm.currentPhase === 'MIDSTREAM') dpmMidstream++;
      else if (dpm.currentPhase === 'DOWNSTREAM') dpmDownstream++;

      if (dpm.changeRequests) {
        dpm.changeRequests.forEach(cr => {
          if (cr.ccbDecision === 'PENDING') pendingCCBCount++;
          allChangeRequests.push({
            id: cr.id,
            projectId: p.id,
            projectName: p.projectName,
            projectNo: p.projectNo,
            organizationName: orgName,
            crNumber: cr.crNumber,
            title: cr.title,
            requesterName: cr.requesterName,
            requestDate: cr.requestDate,
            reason: cr.reason,
            priority: cr.priority,
            scheduleImpactDays: cr.impactAnalysis?.scheduleImpactDays || 0,
            costImpactBaht: cr.impactAnalysis?.costImpactBaht || 0,
            scopeDescription: cr.impactAnalysis?.scopeDescription || '',
            ccbDecision: cr.ccbDecision,
            ccbComments: cr.ccbComments,
          });
        });
      }

      if (dpm.risks) {
        dpm.risks.forEach(r => {
          allRisks.push({
            id: r.id,
            projectId: p.id,
            projectName: p.projectName,
            projectNo: p.projectNo,
            organizationId: p.organizationId,
            organizationName: orgName,
            riskCode: r.riskCode,
            riskTitle: r.riskTitle,
            category: r.category,
            likelihood: r.likelihood,
            impact: r.impact,
            riskScore: r.riskScore,
            severityLevel: r.severityLevel,
            mitigationPlan: r.mitigationPlan,
            contingencyPlan: r.contingencyPlan,
            riskOwner: r.riskOwner,
            status: r.status,
          });

          if (r.severityLevel === 'HIGH' || r.severityLevel === 'EXTREME') {
            highRiskCount++;
            if (topRisks.length < 5) {
              topRisks.push({
                projectId: p.id,
                projectName: p.projectName,
                projectNo: p.projectNo,
                description: r.riskTitle,
                category: r.category,
                riskScore: r.riskScore,
                severityLevel: r.severityLevel,
                status: r.status,
                mitigationPlan: r.mitigationPlan,
                riskOwner: r.riskOwner,
              });
            }
          }
        });
      }

      if (dpm.atp?.modules) {
        dpm.atp.modules.forEach(m => {
          totalTestCases += m.totalTestCases;
          passedTestCases += m.passedTestCases;
        });
      }

      if (dpm.defects) {
        totalDefects += dpm.defects.length;
        dpm.defects.forEach(d => {
          if (d.status === 'OPEN' || d.status === 'IN_PROGRESS') openDefects++;
          allDefects.push({
            id: d.id,
            projectId: p.id,
            projectName: p.projectName,
            projectNo: p.projectNo,
            organizationName: orgName,
            defectCode: d.defectCode,
            title: d.title,
            moduleName: d.moduleName,
            severity: d.severity,
            status: d.status,
            assignedTo: d.assignedTo,
            reportedDate: d.reportedDate,
            resolvedDate: d.resolvedDate,
          });
        });
      }
    }
    const uatPassRate = totalTestCases > 0 ? Math.round((passedTestCases / totalTestCases) * 1000) / 10 : 100;

    // Timeline Adherence
    const now = new Date();
    let onTrack = 0, atRisk = 0, overdue = 0;
    activeProjects.forEach(p => {
      if (['COMPLETED', 'CANCELLED', 'REJECTED', 'DRAFT'].includes(p.status)) return;
      if (!p.endDate) { onTrack++; return; }
      const daysLeft = Math.ceil((new Date(p.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysLeft < 0) overdue++;
      else if (daysLeft < 30) atRisk++;
      else onTrack++;
    });
    const timelineTotal = onTrack + atRisk + overdue;
    const timelineAdherence = timelineTotal > 0 ? Math.round((onTrack / timelineTotal) * 100) : 100;

    // Approval Rate & Budget Utilization
    const totalDecided = (statusCounts.APPROVED || 0) + (statusCounts.REJECTED || 0) + (statusCounts.IN_PROGRESS || 0) + (statusCounts.COMPLETED || 0);
    const totalApproved = (statusCounts.APPROVED || 0) + (statusCounts.IN_PROGRESS || 0) + (statusCounts.COMPLETED || 0);
    const approvalRate = totalDecided > 0 ? Math.round((totalApproved / totalDecided) * 100) : 0;
    const committedBudget = (budgetByStatus['APPROVED'] || 0) + (budgetByStatus['IN_PROGRESS'] || 0) + (budgetByStatus['COMPLETED'] || 0);
    const budgetUtilization = totalBudget > 0 ? Math.round((committedBudget / totalBudget) * 100) : 0;

    // Top Projects by Budget
    const topProjects = [...activeProjects]
      .sort((a, b) => {
        const ba = typeof a.budget === 'number' ? a.budget : parseFloat(a.budget as unknown as string) || 0;
        const bb = typeof b.budget === 'number' ? b.budget : parseFloat(b.budget as unknown as string) || 0;
        return bb - ba;
      })
      .slice(0, 5)
      .map(p => ({
        id: p.id, projectNo: p.projectNo, projectName: p.projectName,
        organizationName: orgMap.get(p.organizationId) || 'กระทรวงแรงงาน',
        budget: typeof p.budget === 'number' ? p.budget : parseFloat(p.budget as unknown as string) || 0,
        status: p.status, priority: p.priority,
        dpmPhase: dpmMap[p.id]?.currentPhase || 'UPSTREAM',
      }));

    // Recent Projects
    const recentProjects = [...activeProjects]
      .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
      .slice(0, 10)
      .map((p) => ({
        id: p.id, projectNo: p.projectNo, projectName: p.projectName,
        organizationName: orgMap.get(p.organizationId) || 'กระทรวงแรงงาน',
        budget: p.budget, status: p.status, priority: p.priority,
        fiscalYear: p.fiscalYear, updatedAt: p.updatedAt || p.createdAt,
        assignedOfficer: p.assignedOfficer,
        ownerContact: p.ownerContact,
      }));

    // User & Project Lookup Maps for Activities
    const userMap = new Map<string, string>();
    users.forEach((u) => {
      userMap.set(u.id, u.fullName || u.username);
      if (u.username) userMap.set(u.username, u.fullName || u.username);
    });

    const projectLookup = new Map<string, { projectName: string; projectNo: string }>();
    allProjects.forEach((p) => {
      projectLookup.set(p.id, { projectName: p.projectName, projectNo: p.projectNo });
    });

    // Recent Activities (sorted newest first)
    const activities = [...history]
      .sort((a: any, b: any) => {
        const timeA = new Date(a.performedAt || a.actionAt || 0).getTime();
        const timeB = new Date(b.performedAt || b.actionAt || 0).getTime();
        return timeB - timeA;
      })
      .slice(0, 10)
      .map((h: any) => {
        const proj = projectLookup.get(h.projectId);
        const performerId = h.performedBy || h.actionBy || 'ระบบ';
        const performerName = userMap.get(performerId) || performerId;
        const performedAt = h.performedAt || h.actionAt || new Date().toISOString();
        return {
          id: h.id,
          projectId: h.projectId,
          projectName: proj?.projectName || h.projectId,
          projectNo: proj?.projectNo || '',
          action: h.action,
          performerName,
          performedAt,
          toStatus: h.toStatus,
          comment: h.comment || h.comments || '',
        };
      });

    // Full projects list for drill-down filtering
    const projectsList = activeProjects.map(p => {
      const budgetNum = typeof p.budget === 'number' ? p.budget : parseFloat(p.budget as unknown as string) || 0;
      let timelineStatus: 'ON_TRACK' | 'AT_RISK' | 'OVERDUE' = 'ON_TRACK';
      let daysRemaining = 999;
      if (p.endDate && !['COMPLETED', 'CANCELLED', 'REJECTED', 'DRAFT'].includes(p.status)) {
        daysRemaining = Math.ceil((new Date(p.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysRemaining < 0) timelineStatus = 'OVERDUE';
        else if (daysRemaining < 30) timelineStatus = 'AT_RISK';
      }
      return {
        id: p.id,
        projectNo: p.projectNo,
        projectName: p.projectName,
        organizationId: p.organizationId,
        organizationName: orgMap.get(p.organizationId) || 'กระทรวงแรงงาน',
        departmentId: p.departmentId,
        budget: budgetNum,
        status: p.status,
        priority: p.priority,
        projectType: p.projectType,
        fiscalYear: p.fiscalYear,
        startDate: p.startDate,
        endDate: p.endDate,
        dpmPhase: dpmMap[p.id]?.currentPhase || 'UPSTREAM',
        timelineStatus,
        daysRemaining,
        assignedOfficer: p.assignedOfficer,
        ownerContact: p.ownerContact,
      };
    });

    return successResponse({
      totalProjects: activeProjects.length,
      totalBudget,
      statusCounts,
      charts: { byStatus: statusChartData, byOrg: orgChartData, monthlyTrend: monthlyTrendChartData },
      metrics: { averageApprovalDays, approvalRate, budgetUtilization, committedBudget, inReviewCount: statusCounts.DOCUMENT_CHECK + statusCounts.UNDER_REVIEW + statusCounts.PENDING_APPROVAL, slaBreachCount: 2 },
      dpm: { upstreamCount: dpmUpstream, midstreamCount: dpmMidstream, downstreamCount: dpmDownstream, pendingCCBCount, highRiskCount, uatPassRate, openDefectsCount: openDefects, totalDefects, topRisks },
      timeline: { onTrack, atRisk, overdue, adherencePercent: timelineAdherence },
      priority: priorityCounts,
      budgetByStatus,
      topProjects,
      recentProjects,
      activities,
      allRisks,
      allChangeRequests,
      allDefects,
      projectsList,
    }, 'ดึงข้อมูลสถิติแดชบอร์ดสำเร็จ');
  } catch (error: any) {
    console.error('Dashboard calculation error:', error);
    return errorResponse(error.message || 'เกิดข้อผิดพลาดในการประมวลผลสถิติ', 'SERVER_ERROR', 500);
  }
}

