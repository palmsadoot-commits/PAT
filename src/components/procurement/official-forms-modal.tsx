'use client';

import React from 'react';
import { X, Printer, Download, ShieldCheck, Scale, FileText } from 'lucide-react';
import { ProcurementGovernanceWorkspace } from '@/types/procurement';
import { formatBudgetFull, formatDate } from '@/lib/utils/format';

interface OfficialFormsModalProps {
  isOpen: boolean;
  onClose: () => void;
  formType: 'APPOINTMENT_ORDER' | 'CONFLICT_DECLARATION' | 'FORM_BK01' | 'EVALUATION_REPORT' | 'NOTICE_175' | 'ACCEPTANCE_CERTIFICATE';
  workspace: ProcurementGovernanceWorkspace;
  selectedCommitteeType?: 'TOR_PRICE' | 'EVALUATION' | 'ACCEPTANCE';
}

export function OfficialFormsModal({
  isOpen,
  onClose,
  formType,
  workspace,
  selectedCommitteeType = 'ACCEPTANCE'
}: OfficialFormsModalProps) {
  if (!isOpen) return null;

  const todayThai = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getCommittee = () => {
    if (selectedCommitteeType === 'TOR_PRICE') return workspace.torPriceCommittee;
    if (selectedCommitteeType === 'EVALUATION') return workspace.evaluationCommittee;
    return workspace.acceptanceCommittee;
  };

  const committee = getCommittee();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-muted)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[var(--radius-md)] bg-blue-600 text-white flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--foreground)]">
                แบบฟอร์มเอกสารราชการมาตรฐาน (Government Official Template)
              </h2>
              <p className="text-[11px] text-[var(--foreground-muted)]">
                สร้างตามพระราชบัญญัติและระเบียบกระทรวงการคลังว่าด้วยการจัดซื้อจัดจ้างฯ พ.ศ. ๒๕๖๐
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-inset)] cursor-pointer text-[var(--foreground)]"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์เอกสาร</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer text-[var(--foreground-muted)]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Paper Container - Realistic Government Document Style */}
        <div className="flex-1 overflow-y-auto p-8 bg-neutral-100 dark:bg-neutral-900 flex justify-center">
          <div className="bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 p-10 max-w-2xl w-full border border-neutral-200 dark:border-neutral-800 shadow-lg rounded-[var(--radius-sm)] space-y-6 text-[13px] leading-relaxed font-serif">
            
            {/* 1. คำสั่งแต่งตั้งคณะกรรมการ (ข้อ ๒๕) */}
            {formType === 'APPOINTMENT_ORDER' && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <p className="font-bold text-base">คำสั่งสำนักงานปลัดกระทรวงแรงงาน</p>
                  <p className="font-semibold text-sm">ที่ {committee?.orderNumber?.replace('คำสั่ง สป.รง. ที่ ', '') || '๑๔/๒๕๖๙'}</p>
                  <p className="font-semibold text-sm">
                    เรื่อง แต่งตั้ง{selectedCommitteeType === 'TOR_PRICE' ? 'คณะกรรมการจัดทำร่างขอบเขตของงานและกำหนดราคากลาง' : selectedCommitteeType === 'EVALUATION' ? 'คณะกรรมการพิจารณาผลการประกวดราคาอิเล็กทรอนิกส์' : 'คณะกรรมการตรวจรับพัสดุ'}
                  </p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">สำหรับ {workspace.projectNameTh}</p>
                </div>

                <div className="text-justify indent-8 pt-2">
                  ด้วย สำนักงานปลัดกระทรวงแรงงาน มีความประสงค์จะดำเนินการจัดซื้อจัดจ้าง {workspace.projectNameTh} วงเงินงบประมาณ {formatBudgetFull(workspace.budgetBaht)} บาท เพื่อให้การปฏิบัติงานเป็นไปด้วยความถูกต้อง เรียบร้อย มีประสิทธิภาพ โปร่งใส และสอดคล้องตามพระราชบัญญัติการจัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐ พ.ศ. ๒๕๖๐ และระเบียบกระทรวงการคลังว่าด้วยการจัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐ พ.ศ. ๒๕๖๐ ข้อ ๒๕ และ ข้อ ๒๖ จึงมีคำสั่งแต่งตั้งคณะกรรมการ โดยมีองค์ประกอบและหน้าที่ดังนี้
                </div>

                <div className="space-y-2 pt-2">
                  <p className="font-bold">องค์ประกอบคณะกรรมการ:</p>
                  <ol className="list-decimal list-inside space-y-1.5 pl-2">
                    {committee?.members.map((m, idx) => (
                      <li key={m.id} className="text-xs">
                        <span className="font-semibold">{m.fullName}</span> {m.position} — <strong>{m.committeeRole === 'CHAIR' ? 'ประธานกรรมการ' : m.committeeRole === 'SECRETARY' ? 'กรรมการและเลขานุการ' : 'กรรมการ'}</strong>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="pt-2">
                  <p className="font-bold">กำหนดระยะเวลาการปฏิบัติหน้าที่ (ตามระเบียบ ข้อ ๒๕):</p>
                  <p className="text-xs indent-8">
                    ให้คณะกรรมการเริ่มปฏิบัติหน้าที่ตั้งแต่วันที่ {committee?.startDate} และดำเนินการให้แล้วเสร็จภายในกรอบเวลา {committee?.allowedDays} {committee?.isBusinessDays ? 'วันทำการ' : 'วัน'} (กำหนดแล้วเสร็จภายในวันที่ {committee?.targetEndDate})
                  </p>
                </div>

                <div className="text-right pt-6 space-y-1">
                  <p>สั่ง ณ วันที่ {todayThai}</p>
                  <div className="pt-8">
                    <p className="font-bold">( {committee?.approvedBy || 'พันตำรวจโท วรรณพงษ์ คชรักษ์'} )</p>
                    <p className="text-xs">{committee?.approvedPosition || 'ปลัดกระทรวงแรงงาน'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. คำรับรองไม่มีผลประโยชน์ทับซ้อน */}
            {formType === 'CONFLICT_DECLARATION' && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <p className="font-bold text-base">หนังสือคำรับรองการไม่มีผลประโยชน์ทับซ้อน (Conflict of Interest Declaration)</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">ตามประมวลจริยธรรมข้าราชการพลเรือน และหลักเกณฑ์ ป.ป.ช.</p>
                </div>

                <div className="text-justify indent-8 pt-2">
                  ข้าพเจ้า ขอให้คำรับรองต่อหัวหน้าหน่วยงานของรัฐว่า ในการปฏิบัติหน้าที่เป็นคณะกรรมการในโครงการ "{workspace.projectNameTh}" ข้าพเจ้าไม่มีส่วนได้เสีย ไม่มีความสัมพันธ์ทางเครือญาติ หรือผลประโยชน์ร่วมกัน ไม่ว่าโดยตรงหรือโดยอ้อม กับผู้ยื่นข้อเสนอ ผู้ประกอบการ หรือคู่สัญญารายใดในการจัดซื้อจัดจ้างครั้งนี้
                </div>

                <div className="space-y-3 pt-4 border-t border-dashed border-neutral-300 dark:border-neutral-700">
                  <p className="font-bold">รายชื่อกรรมการผู้ลงนามรับรอง:</p>
                  {committee?.members.map(m => (
                    <div key={m.id} className="flex items-center justify-between text-xs py-1 border-b border-neutral-100 dark:border-neutral-800">
                      <div>
                        <p className="font-semibold">{m.fullName}</p>
                        <p className="text-[11px] text-neutral-500">{m.position}</p>
                      </div>
                      <span className="text-emerald-700 dark:text-emerald-400 font-medium">✓ ลงนามคำรับรองแล้ว ({m.conflictDeclaredAt ? formatDate(m.conflictDeclaredAt) : 'ระบบบันทึกเรียบร้อย'})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. ตารางเปิดเผยราคากลาง บก.๐๑ */}
            {formType === 'FORM_BK01' && workspace.medianPricePackage && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <p className="font-bold text-base">ตารางแสดงวงเงินงบประมาณที่ได้รับจัดสรรและราคากลาง (ตาราง บก.๐๑)</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">การจัดซื้อจัดจ้างที่มิใช่งานก่อสร้าง (งานจ้างพัฒนาระบบเทคโนโลยีสารสนเทศ)</p>
                </div>

                <div className="border border-neutral-300 dark:border-neutral-700 divide-y divide-neutral-200 dark:divide-neutral-800 text-xs">
                  <div className="p-2.5 grid grid-cols-3">
                    <span className="font-bold">๑. ชื่อโครงการ</span>
                    <span className="col-span-2">{workspace.projectNameTh}</span>
                  </div>
                  <div className="p-2.5 grid grid-cols-3">
                    <span className="font-bold">๒. หน่วยงานเจ้าของโครงการ</span>
                    <span className="col-span-2">ศูนย์เทคโนโลยีสารสนเทศและการสื่อสาร สำนักงานปลัดกระทรวงแรงงาน</span>
                  </div>
                  <div className="p-2.5 grid grid-cols-3">
                    <span className="font-bold">๓. วงเงินงบประมาณที่ได้รับจัดสรร</span>
                    <span className="col-span-2 font-bold">{formatBudgetFull(workspace.budgetBaht)} บาท</span>
                  </div>
                  <div className="p-2.5 grid grid-cols-3 bg-blue-50/50 dark:bg-blue-950/20">
                    <span className="font-bold text-blue-900 dark:text-blue-300">๔. วันที่กำหนดราคากลาง</span>
                    <span className="col-span-2 font-bold text-blue-900 dark:text-blue-300">
                      {workspace.medianPricePackage.certifiedDate} (เป็นเงิน {formatBudgetFull(workspace.medianPricePackage.medianPriceBaht)} บาท)
                    </span>
                  </div>
                  <div className="p-2.5 grid grid-cols-3">
                    <span className="font-bold">๕. แหล่งที่มาของราคากลาง (ราคาอ้างอิง)</span>
                    <div className="col-span-2 space-y-1">
                      {workspace.medianPricePackage.surveys.filter(s => !s.isExcludedAsOutlier).map((s, i) => (
                        <p key={s.id}>๕.{i + 1} {s.sourceName} (สืบราคาเมื่อ {s.surveyDate} เสนอราคา {formatBudgetFull(s.quotedPriceBaht)} บาท)</p>
                      ))}
                    </div>
                  </div>
                  <div className="p-2.5 grid grid-cols-3">
                    <span className="font-bold">๖. รายชื่อผู้รับผิดชอบกำหนดราคากลาง</span>
                    <span className="col-span-2">{workspace.medianPricePackage.certifiedBy} ({workspace.medianPricePackage.certifiedPosition})</span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. รายงานขออนุมัติสั่งซื้อสั่งจ้าง (ข้อ ๕๕) */}
            {formType === 'EVALUATION_REPORT' && workspace.evaluationResolution && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <p className="font-bold text-base">รายงานผลการพิจารณาและขออนุมัติสั่งจ้าง</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">ตามระเบียบกระทรวงการคลังว่าด้วยการจัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐ พ.ศ. ๒๕๖๐ ข้อ ๕๕</p>
                </div>

                <div className="text-justify indent-8 text-xs">
                  ตามที่ สำนักงานปลัดกระทรวงแรงงาน ได้ดำเนินการประกวดราคาอิเล็กทรอนิกส์ (e-Bidding) โครงการ "{workspace.projectNameTh}" คณะกรรมการได้ดำเนินการตรวจสอบคุณสมบัติ ข้อเสนอทางเทคนิค และราคาของผู้ยื่นข้อเสนอ ปรากฏผลการประเมินดังนี้
                </div>

                <div className="border border-neutral-200 dark:border-neutral-800 rounded-sm overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-neutral-100 dark:bg-neutral-800 font-bold border-b">
                      <tr>
                        <th className="p-2">ผู้ยื่นข้อเสนอ</th>
                        <th className="p-2 text-right">ราคาที่เสนอ (บาท)</th>
                        <th className="p-2 text-center">คะแนนเทคนิค</th>
                        <th className="p-2 text-center">คะแนนรวม</th>
                        <th className="p-2 text-center">ผลการพิจารณา</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {workspace.evaluationResolution.bidders.map((b, idx) => (
                        <tr key={b.id}>
                          <td className="p-2 font-medium">{b.bidderNameTh}</td>
                          <td className="p-2 text-right font-mono">{formatBudgetFull(b.quotedPriceBaht)}</td>
                          <td className="p-2 text-center">{b.technicalScore}</td>
                          <td className="p-2 text-center font-bold">{b.totalCombinedScore}</td>
                          <td className="p-2 text-center">
                            {idx === 0 ? <span className="font-bold text-emerald-700">ชนะการเสนอราคา</span> : <span className="text-neutral-500">ลำดับที่ {idx + 1}</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="text-xs space-y-1">
                  <p className="font-bold">ข้อเสนอของคณะกรรมการ:</p>
                  <p className="indent-8">
                    เห็นควรอนุมัติสั่งจ้าง <strong>{workspace.evaluationResolution.winningBidderName}</strong> ในวงเงิน {formatBudgetFull(workspace.evaluationResolution.awardedPriceBaht)} บาท ซึ่งต่ำกว่าราคากลางและเป็นราคาที่เหมาะสมต่อทางราชการ
                  </p>
                </div>
              </div>
            )}

            {/* 5. หนังสือแจ้งผลการตรวจรับพัสดุไม่ถูกต้อง/ไม่ครบถ้วน ภายใน ๓ วันทำการ (ข้อ ๑๗๕) */}
            {formType === 'NOTICE_175' && (
              <div className="space-y-4">
                <div className="flex justify-between items-start text-xs">
                  <div>
                    <p>ที่ รง ๐๒๐๑/ว {Math.floor(100 + Math.random() * 900)}</p>
                  </div>
                  <div className="text-right">
                    <p>สำนักงานปลัดกระทรวงแรงงาน</p>
                    <p>ถนนมิตรไมตรี ดินแดง กทม. ๑๐๔๐๐</p>
                    <p>{todayThai}</p>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <p><strong>เรื่อง</strong> แจ้งผลการตรวจรับพัสดุไม่ถูกต้องหรือไม่ครบถ้วนตามสัญญา (ระเบียบกระทรวงการคลังฯ ข้อ ๑๗๕)</p>
                  <p><strong>เรียน</strong> กรรมการผู้จัดการ {workspace.contractorName || 'คู่สัญญา'}</p>
                  <p><strong>อ้างถึง</strong> สัญญาจ้างเลขที่ {workspace.contractNumber || 'รง. ๑๔/๒๕๖๙'}</p>
                </div>

                <div className="text-justify indent-8 text-xs leading-relaxed">
                  ตามที่ท่านได้ส่งมอบงานจ้างตามสัญญา งวดที่ {workspace.activeMilestoneNo} โครงการ "{workspace.projectNameTh}" เมื่อวันที่ {todayThai} นั้น คณะกรรมการตรวจรับพัสดุได้ร่วมกันทำการตรวจสอบแล้ว ปรากฏว่าสิ่งส่งมอบและผลการดำเนินงานยังไม่ถูกต้องครบถ้วนตามข้อกำหนดแห่งสัญญา ดังนี้
                </div>

                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-sm text-xs text-red-900 dark:text-red-300">
                  <p className="font-bold">รายการข้อบกพร่องที่ต้องแก้ไข:</p>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    <li>การเชื่อมโยงระบบยืนยันตัวตนพบปัญหา Gateway Timeout ระหว่างรับภาระงานสูง</li>
                    <li>เอกสารบันทึกผลการทดสอบ Clean Build ยังไม่ระบุ SHA-256 Checksum ที่ตรงกับ Container Image</li>
                  </ul>
                </div>

                <div className="text-justify indent-8 text-xs leading-relaxed">
                  จึงขอแจ้งให้ท่านดำเนินการแก้ไขปรับปรุงและนำส่งสิ่งส่งมอบที่ถูกต้องครบถ้วนให้แล้วเสร็จโดยเร็ว มิฉะนั้นสำนักงานปลัดกระทรวงแรงงานจะดำเนินการคิดค่าปรับตามเงื่อนไขที่กำหนดไว้ในสัญญาต่อไป
                </div>

                <div className="text-right pt-4 text-xs">
                  <p>ขอแสดงความนับถือ</p>
                  <div className="pt-6">
                    <p className="font-bold">({workspace.acceptanceCommittee?.members[0]?.fullName || 'นางสาวจีระภา บุญรัตน์'})</p>
                    <p>{workspace.acceptanceCommittee?.members[0]?.position || 'ประธานกรรมการตรวจรับพัสดุ'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 6. ใบรับรองผลการปฏิบัติงาน / ใบสำคัญการตรวจรับพัสดุ (๒ ฉบับ) */}
            {formType === 'ACCEPTANCE_CERTIFICATE' && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <p className="font-bold text-base">ใบรับรองผลการปฏิบัติงาน / ใบสำคัญการตรวจรับพัสดุ</p>
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                    [ฉบับที่ ๑: สำหรับส่งฝ่ายการเงินและบัญชีเพื่อประกอบการขออนุมัติเบิกจ่าย]
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    (ตามระเบียบกระทรวงการคลังว่าด้วยการจัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐ พ.ศ. ๒๕๖๐ ข้อ ๑๗๕)
                  </p>
                </div>

                <div className="border border-neutral-300 dark:border-neutral-700 divide-y text-xs">
                  <div className="p-2 grid grid-cols-3">
                    <span className="font-bold">สัญญาเลขที่:</span>
                    <span className="col-span-2 font-mono">{workspace.contractNumber || 'รง. ๑๔/๒๕๖๙'}</span>
                  </div>
                  <div className="p-2 grid grid-cols-3">
                    <span className="font-bold">โครงการ:</span>
                    <span className="col-span-2">{workspace.projectNameTh}</span>
                  </div>
                  <div className="p-2 grid grid-cols-3">
                    <span className="font-bold">คู่สัญญา / ผู้รับจ้าง:</span>
                    <span className="col-span-2">{workspace.contractorName || 'บริษัท ดิจิทัล โซลูชั่นส์ อินโนเวชั่น จำกัด (มหาชน)'}</span>
                  </div>
                  <div className="p-2 grid grid-cols-3">
                    <span className="font-bold">งวดงานที่ส่งมอบ:</span>
                    <span className="col-span-2 font-bold">งวดที่ {workspace.activeMilestoneNo}</span>
                  </div>
                  <div className="p-2 grid grid-cols-3 bg-emerald-50/50 dark:bg-emerald-950/20">
                    <span className="font-bold text-emerald-900 dark:text-emerald-300">จำนวนเงินที่อนุมัติจ่าย:</span>
                    <span className="col-span-2 font-bold text-emerald-900 dark:text-emerald-300 text-sm">
                      {formatBudgetFull(Math.round((workspace.contractValueBaht || 13965000) / 3))} บาท
                    </span>
                  </div>
                  <div className="p-2 grid grid-cols-3">
                    <span className="font-bold">ค่าปรับ / ค่าเสียหาย:</span>
                    <span className="col-span-2">ไม่มี (ส่งมอบภายในกำหนดเวลาตามสัญญา)</span>
                  </div>
                </div>

                <div className="text-justify indent-8 text-xs pt-2">
                  คณะกรรมการตรวจรับพัสดุได้ทำการตรวจรับผลงานของผู้รับจ้างตามรายการใน RTM Matrix และรายการตรวจรับระบบดิจิทัล ๙ มิติเรียบร้อยแล้ว มีมติเห็นชอบว่าผู้รับจ้างได้ส่งมอบงานถูกต้อง ครบถ้วนตามมาตรฐานสัญญา จึงออกใบรับรองผลการปฏิบัติงานนี้ไว้เป็นหลักฐานเพื่อดำเนินการเบิกจ่ายเงินต่อไป
                </div>

                <div className="pt-4 space-y-2">
                  <p className="font-bold text-xs">ลายมือชื่อคณะกรรมการตรวจรับพัสดุ:</p>
                  <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                    {workspace.acceptanceCommittee?.members.map(m => (
                      <div key={m.id} className="text-center p-2 border border-neutral-100 dark:border-neutral-800 rounded">
                        <div className="h-8 border-b border-dashed border-neutral-300 dark:border-neutral-700 mb-1 flex items-center justify-center text-[10px] text-emerald-600">
                          (ลงนามดิจิทัลผ่านระบบ PAT)
                        </div>
                        <p className="font-semibold">{m.fullName}</p>
                        <p className="text-[10px] text-neutral-500">{m.committeeRole === 'CHAIR' ? 'ประธานกรรมการ' : m.committeeRole === 'SECRETARY' ? 'กรรมการและเลขานุการ' : 'กรรมการ'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[var(--border)] bg-[var(--surface-muted)] flex items-center justify-between text-xs text-[var(--foreground-muted)]">
          <span>ระบบสร้างเอกสารราชการอัตโนมัติ — สป.รง. PAT Governance Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-[var(--radius-md)] bg-[var(--surface)] border border-[var(--border)] font-semibold hover:bg-[var(--surface-inset)] cursor-pointer text-[var(--foreground)]"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
