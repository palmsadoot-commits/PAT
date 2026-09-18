// ============================================================================
// TOR Ambiguity & Measurability Linter
// ระบบตรวจสอบข้อกำหนดที่กำกวมและไม่มีเกณฑ์วัดเชิงประจักษ์
// ============================================================================

import { AmbiguityWarning } from '@/types/procurement';

interface AmbiguityRule {
  keyword: string;
  severity: 'WARNING' | 'CRITICAL';
  suggestedMeasurementTh: string;
}

const AMBIGUITY_RULES: AmbiguityRule[] = [
  {
    keyword: 'ใช้งานง่าย',
    severity: 'WARNING',
    suggestedMeasurementTh: 'ระบุเกณฑ์การทดสอบการใช้งาน (Usability Test) เช่น ผู้ใช้สามารถทำรายการเสร็จสิ้นได้ภายใน ๓ นาทีโดยไม่ต้องเปิดคู่มือ หรือคะแนนความพึงพอใจ UAT เฉลี่ยไม่น้อยกว่าร้อยละ ๘๕'
  },
  {
    keyword: 'รวดเร็ว',
    severity: 'CRITICAL',
    suggestedMeasurementTh: 'ระบุเวลาตอบสนองเชิงปริมาณ (Response Time) เช่น หน้าจอประมวลผลและแสดงผลลัพธ์ไม่เกิน ๒.๐ วินาที ที่ระดับการใช้งานพร้อมกัน ๑๐๐ Concurrent Users'
  },
  {
    keyword: 'มีคุณภาพ',
    severity: 'CRITICAL',
    suggestedMeasurementTh: 'ระบุตัวชี้วัดคุณภาพซอฟต์แวร์ เช่น อัตราข้อผิดพลาด (Defect Density) ต่ำกว่า ๐.๕ ข้อผิดพลาดต่อ KLOC หรือไม่มีข้อผิดพลาดระดับ Critical คงค้าง'
  },
  {
    keyword: 'ทันสมัย',
    severity: 'WARNING',
    suggestedMeasurementTh: 'ระบุเวอร์ชันและเทคโนโลยีมาตรฐานขั้นต่ำ เช่น รองรับ HTML5, TLS 1.3, สถาปัตยกรรม Microservices หรือ Framework ที่มี Long-Term Support (LTS)'
  },
  {
    keyword: 'เสถียรภาพสูง',
    severity: 'CRITICAL',
    suggestedMeasurementTh: 'ระบุเป้าหมายความพร้อมใช้งาน (System Availability) เช่น ไม่น้อยกว่าร้อยละ ๙๙.๕ ต่อเดือน (Uptime >= 99.5%) และค่า MTTR ไม่เกิน ๒ ชั่วโมง'
  },
  {
    keyword: 'ปลอดภัย',
    severity: 'CRITICAL',
    suggestedMeasurementTh: 'ระบุมาตรฐานความมั่นคงปลอดภัย เช่น ผ่านการทดสอบ VAPT โดยไม่พบช่องโหว่ระดับ Critical และ High ตามเกณฑ์ OWASP Top 10 และสอดคล้องตาม พ.ร.บ. ไซเบอร์ฯ'
  },
  {
    keyword: 'เป็นที่น่าพอใจ',
    severity: 'CRITICAL',
    suggestedMeasurementTh: 'ระบุเกณฑ์การประเมิน UAT Exit Criteria ที่เป็นรูปธรรม เช่น ผ่านการลงนามยอมรับจากผู้แทนกลุ่มผู้ใช้งานจริงไม่น้อยกว่า ๓ กอง/สำนัก'
  },
  {
    keyword: 'มีประสิทธิภาพสูง',
    severity: 'WARNING',
    suggestedMeasurementTh: 'ระบุตัวเลข Throughput และ Resource Utilization เช่น รองรับธุรกรรมไม่น้อยกว่า ๕๐๐ รายการต่อวินาที (TPS) และใช้ CPU ไม่เกินร้อยละ ๗๕ ในช่วงพีค'
  }
];

export function lintTorText(text: string): AmbiguityWarning[] {
  if (!text) return [];

  const warnings: AmbiguityWarning[] = [];

  for (const rule of AMBIGUITY_RULES) {
    if (text.includes(rule.keyword)) {
      // Find context snippet around the keyword
      const idx = text.indexOf(rule.keyword);
      const start = Math.max(0, idx - 25);
      const end = Math.min(text.length, idx + rule.keyword.length + 35);
      const snippet = (start > 0 ? '...' : '') + text.substring(start, end).trim() + (end < text.length ? '...' : '');

      warnings.push({
        keyword: rule.keyword,
        contextSnippet: snippet,
        suggestedMeasurementTh: rule.suggestedMeasurementTh,
        severity: rule.severity
      });
    }
  }

  return warnings;
}

export function validateTorRequirements(items: { id: string; specificationTh: string; acceptanceCriteriaTh: string }[]) {
  return items.map(item => {
    const specWarnings = lintTorText(item.specificationTh);
    const criteriaWarnings = lintTorText(item.acceptanceCriteriaTh);
    
    // Check if acceptanceCriteria is empty or trivially short
    const isCriteriaMeasurable = item.acceptanceCriteriaTh && item.acceptanceCriteriaTh.trim().length >= 15;
    
    return {
      itemId: item.id,
      warnings: [...specWarnings, ...criteriaWarnings],
      isCriteriaMeasurable,
      needsAttention: specWarnings.length > 0 || criteriaWarnings.length > 0 || !isCriteriaMeasurable
    };
  });
}
