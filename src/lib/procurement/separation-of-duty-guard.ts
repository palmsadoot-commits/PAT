// ============================================================================
// Separation of Duties & Conflict-of-Interest Guard
// ตรวจสอบความถูกต้องขององค์ประกอบคณะกรรมการตามระเบียบกระทรวงการคลังฯ ข้อ ๒๖
// "ห้ามแต่งตั้งบุคคลผู้เป็นกรรมการพิจารณาผลเป็นกรรมการตรวจรับพัสดุในงานเดียวกัน"
// ============================================================================

import { CommitteeMember } from '@/types/procurement';

export interface ConflictCheckResult {
  hasViolation: boolean;
  violations: {
    memberName: string;
    position: string;
    evaluationRole: string;
    acceptanceRole: string;
    legalReference: string;
    detailsTh: string;
  }[];
  conflictDeclarationMissing: {
    committeeType: 'EVALUATION' | 'ACCEPTANCE' | 'TOR_PRICE';
    memberName: string;
    position: string;
  }[];
  summaryTh: string;
}

export function validateCommitteeSeparationOfDuties(
  evaluationMembers: CommitteeMember[] = [],
  acceptanceMembers: CommitteeMember[] = [],
  torMembers: CommitteeMember[] = []
): ConflictCheckResult {
  const violations: ConflictCheckResult['violations'] = [];
  const conflictDeclarationMissing: ConflictCheckResult['conflictDeclarationMissing'] = [];

  // 1. ตรวจสอบการลงนามคำรับรองไม่มีผลประโยชน์ทับซ้อน
  for (const m of torMembers) {
    if (!m.conflictDeclared) {
      conflictDeclarationMissing.push({ committeeType: 'TOR_PRICE', memberName: m.fullName, position: m.position });
    }
  }
  for (const m of evaluationMembers) {
    if (!m.conflictDeclared) {
      conflictDeclarationMissing.push({ committeeType: 'EVALUATION', memberName: m.fullName, position: m.position });
    }
  }
  for (const m of acceptanceMembers) {
    if (!m.conflictDeclared) {
      conflictDeclarationMissing.push({ committeeType: 'ACCEPTANCE', memberName: m.fullName, position: m.position });
    }
  }

  // 2. ตรวจสอบความซ้ำซ้อนระหว่าง คณะพิจารณาผล vs คณะตรวจรับพัสดุ
  for (const evalMember of evaluationMembers) {
    const matchedAcceptance = acceptanceMembers.find(
      accMember => (accMember.userId && accMember.userId === evalMember.userId) ||
                   (accMember.fullName.trim().toLowerCase() === evalMember.fullName.trim().toLowerCase())
    );

    if (matchedAcceptance) {
      violations.push({
        memberName: evalMember.fullName,
        position: evalMember.position,
        evaluationRole: evalMember.committeeRole,
        acceptanceRole: matchedAcceptance.committeeRole,
        legalReference: 'ระเบียบกระทรวงการคลังว่าด้วยการจัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐ พ.ศ. ๒๕๖๐ ข้อ ๒๖ วรรคท้าย',
        detailsTh: `พบว่า "${evalMember.fullName}" ได้รับการแต่งตั้งเป็นทั้งกรรมการพิจารณาผล และกรรมการตรวจรับพัสดุในการจัดซื้อจัดจ้างเดียวกัน ซึ่งขัดต่อระเบียบฯ ข้อ ๒๖`
      });
    }
  }

  const hasViolation = violations.length > 0;
  let summaryTh = 'องค์ประกอบคณะกรรมการถูกต้องตามหลักการแยกหน้าที่ (Separation of Duties)';
  if (hasViolation) {
    summaryTh = `พบข้อขัดแย้งทางกฎหมาย ${violations.length} รายการ: ห้ามกรรมการพิจารณาผลปฏิบัติหน้าที่เป็นกรรมการตรวจรับพัสดุในงานเดียวกัน (ระเบียบ กค. ๒๕๖๐ ข้อ ๒๖)`;
  } else if (conflictDeclarationMissing.length > 0) {
    summaryTh = `มีกรรมการ ${conflictDeclarationMissing.length} ท่านที่ยังไม่ได้ลงนามคำรับรองไม่มีผลประโยชน์ทับซ้อน`;
  }

  return {
    hasViolation,
    violations,
    conflictDeclarationMissing,
    summaryTh
  };
}
