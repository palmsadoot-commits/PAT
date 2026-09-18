import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { successResponse, unauthorizedResponse, errorResponse, notFoundResponse } from '@/lib/utils/api-response';
import { getProcurementWorkspace, addPriceSurveyItem, updateProcurementWorkspace } from '@/lib/storage/procurement-store';
import { lintTorText } from '@/lib/procurement/tor-linter';
import { TorRequirementItem } from '@/types/procurement';

export async function POST(
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
    const { action } = body;

    const ws = getProcurementWorkspace(id);
    if (!ws) {
      return notFoundResponse(`ไม่พบโครงการ ${id}`);
    }

    if (action === 'LINT_TEXT') {
      const textToLint = body.text || '';
      const warnings = lintTorText(textToLint);
      return successResponse({ warnings }, 'ตรวจสอบคำกำกวมสำเร็จ');
    }

    if (action === 'ADD_REQUIREMENT') {
      const { sectionKey, titleTh, specificationTh, acceptanceCriteriaTh, testMethod, evidenceRequiredTh, passFailThresholdTh } = body;
      
      const warnings = [
        ...lintTorText(specificationTh || ''),
        ...lintTorText(acceptanceCriteriaTh || '')
      ];

      const newItem: TorRequirementItem = {
        id: `REQ-${Date.now()}`,
        reqCode: `TOR-REQ-${Math.floor(100 + Math.random() * 900)}`,
        section: sectionKey,
        titleTh: titleTh || '',
        specificationTh: specificationTh || '',
        acceptanceCriteriaTh: acceptanceCriteriaTh || '',
        testMethod: testMethod || 'INSPECTION',
        evidenceRequiredTh: evidenceRequiredTh || '',
        responsibleRole: 'คณะกรรมการจัดทำ TOR',
        passFailThresholdTh: passFailThresholdTh || 'ผ่านเกณฑ์มาตรฐาน ๑๐๐%',
        ambiguityWarnings: warnings,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (!ws.torSpecification) {
        ws.torSpecification = {
          id: `TOR-${id}`,
          projectId: id,
          version: 1,
          status: 'DRAFT',
          sections: [
            { key: 'OBJECTIVES', titleTh: '๑. วัตถุประสงค์และผลสัมฤทธิ์', items: [] },
            { key: 'SCOPE_DELIVERABLES', titleTh: '๒. ขอบเขตงานและสิ่งส่งมอบ', items: [] },
            { key: 'SPECS_STANDARDS_SECURITY', titleTh: '๓. คุณลักษณะ มาตรฐาน และความปลอดภัย', items: [] },
            { key: 'EVALUATION_CRITERIA', titleTh: '๔. เกณฑ์การประเมินข้อเสนอ', items: [] },
            { key: 'MILESTONES_PAYMENT_ACCEPTANCE', titleTh: '๕. งวดงาน งวดเงิน และเกณฑ์ตรวจรับ', items: [] },
            { key: 'TRAINING_IP_SOURCECODE', titleTh: '๖. การอบรม ทรัพย์สินทางปัญญา และซอร์สโค้ด', items: [] },
            { key: 'WARRANTY_DEFECT_PENALTY', titleTh: '๗. การรับประกัน ค่าปรับ และ Defect', items: [] }
          ]
        };
      }

      const secIndex = ws.torSpecification.sections.findIndex(s => s.key === sectionKey);
      if (secIndex !== -1) {
        ws.torSpecification.sections[secIndex].items.push(newItem);
      } else {
        ws.torSpecification.sections[0].items.push(newItem);
      }

      updateProcurementWorkspace(id, { torSpecification: ws.torSpecification });
      return successResponse(newItem, 'เพิ่มข้อกำหนด TOR สำเร็จ');
    }

    if (action === 'ADD_PRICE_SURVEY') {
      const surveyItem = addPriceSurveyItem(id, {
        sourceName: body.sourceName,
        sourceType: body.sourceType,
        documentRefOrUrl: body.documentRefOrUrl,
        surveyDate: body.surveyDate || new Date().toISOString().split('T')[0],
        surveyorName: body.surveyorName || session.fullName || session.username,
        surveyorPosition: body.surveyorPosition || (session as any).position || 'เจ้าหน้าที่ผู้สืบราคา',
        quotedPriceBaht: Number(body.quotedPriceBaht) || 0,
        specEquivalence: body.specEquivalence || 'EQUIVALENT',
        specComparisonNotesTh: body.specComparisonNotesTh || '',
        isExcludedAsOutlier: !!body.isExcludedAsOutlier,
        outlierExclusionReasonTh: body.outlierExclusionReasonTh || ''
      });

      return successResponse(surveyItem, 'บันทึกแหล่งสืบราคาสำเร็จ');
    }

    return errorResponse('Invalid action', 'BAD_REQUEST', 400);
  } catch (error: any) {
    console.error('Procurement POST [id]/tor error:', error);
    return errorResponse(error.message || 'เกิดข้อผิดพลาดในการจัดการ TOR', 'SERVER_ERROR', 500);
  }
}
