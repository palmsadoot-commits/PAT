// ============================================================================
// Median Price & Price Survey Engine
// เครื่องมือวิเคราะห์ราคากลางและตรวจสอบความเทียบเคียงของคุณลักษณะเฉพาะ
// ตามแนวทางของ ป.ป.ช. และระเบียบกระทรวงการคลังฯ พ.ศ. ๒๕๖๐
// ============================================================================

import { PriceSurveyItem, MedianPriceEvidencePackage, SpecEquivalenceLevel } from '@/types/procurement';

export interface PriceCalculationResult {
  validSurveys: PriceSurveyItem[];
  excludedSurveys: PriceSurveyItem[];
  minPrice: number;
  maxPrice: number;
  medianPrice: number;
  averagePrice: number;
  calculationMethodUsed: string;
  hasSufficientSources: boolean;
  warningsTh: string[];
}

/**
 * คำนวณราคากลางเชิงสถิติโดยอ้างอิงจากข้อมูลที่เจ้าหน้าที่บันทึกจริงเท่านั้น
 * *หมายเหตุ: ระบบเป็นเพียงเครื่องมือคำนวณทางคณิตศาสตร์ มิได้เป็นผู้ตัดสินความถูกต้องทางกฎหมายแทนเจ้าหน้าที่*
 */
export function calculateMedianPriceStats(surveys: PriceSurveyItem[]): PriceCalculationResult {
  const warningsTh: string[] = [];

  if (!surveys || surveys.length === 0) {
    return {
      validSurveys: [],
      excludedSurveys: [],
      minPrice: 0,
      maxPrice: 0,
      medianPrice: 0,
      averagePrice: 0,
      calculationMethodUsed: 'ไม่มีข้อมูลแหล่งราคาที่สำรวจ',
      hasSufficientSources: false,
      warningsTh: ['ยังไม่มีการบันทึกแหล่งราคาสำรวจ']
    };
  }

  // 1. แยกรายการที่ถูกคัดออกเป็น Outlier หรือคุณลักษณะต่ำกว่าเกณฑ์ (INFERIOR)
  const validSurveys: PriceSurveyItem[] = [];
  const excludedSurveys: PriceSurveyItem[] = [];

  for (const item of surveys) {
    if (item.isExcludedAsOutlier) {
      excludedSurveys.push(item);
      continue;
    }

    // หากคุณลักษณะด้อยกว่าเกณฑ์ (INFERIOR) จะไม่อนุญาตให้นำมาเทียบเคียงราคากลาง
    if (item.specEquivalence === 'INFERIOR') {
      excludedSurveys.push({
        ...item,
        isExcludedAsOutlier: true,
        outlierExclusionReasonTh: item.outlierExclusionReasonTh || 'คุณลักษณะเฉพาะต่ำกว่าเกณฑ์มาตรฐานที่ TOR กำหนด ไม่สามารถนำมาเทียบเคียงราคาได้'
      });
      warningsTh.push(`แหล่งราคา "${item.sourceName}" มีสเปกต่ำกว่าเกณฑ์ (INFERIOR) จึงถูกคัดออกจากฐานคำนวณ`);
      continue;
    }

    validSurveys.push(item);
  }

  if (validSurveys.length < 3) {
    warningsTh.push(`ควรมีแหล่งสืบราคาที่มีคุณลักษณะเทียบเคียงได้ไม่น้อยกว่า ๓ แหล่ง (ปัจจุบันมีที่เข้าเกณฑ์ ${validSurveys.length} แหล่ง)`);
  }

  if (validSurveys.length === 0) {
    return {
      validSurveys: [],
      excludedSurveys,
      minPrice: 0,
      maxPrice: 0,
      medianPrice: 0,
      averagePrice: 0,
      calculationMethodUsed: 'ไม่มีแหล่งราคาที่เทียบเคียงได้',
      hasSufficientSources: false,
      warningsTh
    };
  }

  // 2. จัดเรียงราคาจากน้อยไปมาก
  const sortedPrices = validSurveys.map(s => s.quotedPriceBaht).sort((a, b) => a - b);
  const minPrice = sortedPrices[0];
  const maxPrice = sortedPrices[sortedPrices.length - 1];

  // 3. คำนวณค่าเฉลี่ย (Average)
  const sum = sortedPrices.reduce((acc, p) => acc + p, 0);
  const averagePrice = Math.round((sum / sortedPrices.length) * 100) / 100;

  // 4. คำนวณค่ามัธยฐาน (Median)
  let medianPrice = 0;
  const mid = Math.floor(sortedPrices.length / 2);
  if (sortedPrices.length % 2 === 0) {
    medianPrice = Math.round(((sortedPrices[mid - 1] + sortedPrices[mid]) / 2) * 100) / 100;
  } else {
    medianPrice = sortedPrices[mid];
  }

  // 5. ตรวจสอบความเบี่ยงเบนผิดปกติ (Outlier flag: สูงหรือต่ำกว่าค่าเฉลี่ยเกิน 50%)
  for (const s of validSurveys) {
    if (averagePrice > 0) {
      const diffPercent = Math.abs(s.quotedPriceBaht - averagePrice) / averagePrice;
      if (diffPercent > 0.5) {
        warningsTh.push(`ราคาจาก "${s.sourceName}" (${s.quotedPriceBaht.toLocaleString('th-TH')} บาท) มีความแตกต่างจากค่าเฉลี่ยเกินร้อยละ ๕๐ ควรให้คณะกรรมการพิจารณาความเหมาะสม`);
      }
    }
  }

  return {
    validSurveys,
    excludedSurveys,
    minPrice,
    maxPrice,
    medianPrice,
    averagePrice,
    calculationMethodUsed: `คำนวณตามแนวทางราคาตลาด/สืบราคาจากผู้ประกอบการ (${validSurveys.length} แหล่ง) โดยใช้ค่าเฉลี่ย/มัธยฐานตามมติคณะกรรมการ`,
    hasSufficientSources: validSurveys.length >= 3,
    warningsTh
  };
}

/**
 * สร้างข้อมูลโครงสร้างแบบฟอร์มเปิดเผยราคากลาง (ตาราง บก.๐๑)
 */
export function generateFormBk01Data(params: {
  projectNo: string;
  projectNameTh: string;
  departmentNameTh: string;
  allocatedBudgetBaht: number;
  medianPricePackage: MedianPriceEvidencePackage;
}) {
  const { projectNo, projectNameTh, departmentNameTh, allocatedBudgetBaht, medianPricePackage } = params;

  return {
    formCode: 'ตาราง บก.๐๑',
    titleTh: 'ตารางแสดงวงเงินงบประมาณที่ได้รับจัดสรรและราคากลาง (ราคาอ้างอิง) ในการจัดซื้อจัดจ้างที่มิใช่งานก่อสร้าง',
    agency: departmentNameTh || 'สำนักงานปลัดกระทรวงแรงงาน',
    projectName: projectNameTh,
    projectNumber: projectNo,
    budgetAllocatedBaht: allocatedBudgetBaht,
    medianPriceCalculatedBaht: medianPricePackage.medianPriceBaht,
    calculationDate: medianPricePackage.certifiedDate,
    sourcesList: medianPricePackage.surveys
      .filter(s => !s.isExcludedAsOutlier)
      .map((s, idx) => `${idx + 1}. ${s.sourceName} (${s.quotedPriceBaht.toLocaleString('th-TH')} บาท, สืบราคาเมื่อ ${s.surveyDate})`),
    certifiedBy: medianPricePackage.certifiedBy,
    certifiedPosition: medianPricePackage.certifiedPosition,
    announcementDate: medianPricePackage.announcementDate
  };
}
