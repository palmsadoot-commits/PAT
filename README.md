# ระบบติดตามขออนุมัติโครงการ (Project Approval Tracking System - PAT)
### สำนักงานปลัดกระทรวงแรงงาน (Office of the Permanent Secretary, Ministry of Labour)

ระบบดิจิทัลบริหารจัดการและติดตามสถานะการขออนุมัติโครงการภาครัฐแบบครบวงจร ครอบคลุมวงจรชีวิตโครงการตั้งแต่ **ต้นน้ำ (Upstream)**, **กลางน้ำ (Midstream)** จนถึง **ปลายน้ำ (Downstream)** ตามระเบียบกระทรวงการคลังและ พ.ร.บ. การจัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐ พ.ศ. 2560

---

## 🌟 ฟีเจอร์หลัก (Key Features)

1. **Executive Decision Dashboard**
   - แสดงสถิติและภาพรวมงบประมาณโครงการตาม 12 กอง/สำนัก/ศูนย์ ของสำนักงานปลัดกระทรวงแรงงาน
   - กราฟแท่งและ Donut Chart วิเคราะห์สัดส่วนงบประมาณ (Budget Drill-down)
   - แถบคาดการณ์ความเสี่ยง (Risk Overview) และการกำกับติดตามโครงการเร่งด่วน

2. **ระบบบริหารขั้นตอนและการอนุมัติ (Workflow & Stepper)**
   - แสดงความก้าวหน้าโครงการ (Workflow Progress Stepper) พร้อมระบบ Breathing Glow Animation และ Live Beacon Point
   - รองรับ 11 สถานะโครงการตามระเบียบราชการ (ฉบับร่าง, ยื่นเสนอ, ตรวจสอบเอกสาร, กำลังพิจารณา, รออนุมัติ, อนุมัติแล้ว, กำลังดำเนินการ, เสร็จสิ้น, ตีกลับแก้ไข, ไม่อนุมัติ, ยกเลิก)
   - ตรวจสอบสิทธิ์การเปลี่ยนสถานะตามบทบาท (Role-Based Access Control - RBAC)

3. **ธรรมาภิบาลสัญญาและการจัดซื้อจัดจ้าง (Procurement & Governance)**
   - บันทึกและติดตามคำสั่งแต่งตั้งคณะกรรมการ (TOR, e-Bidding, คณะกรรมการตรวจรับพัสดุ)
   - วงจรชีวิต DPM 3 ระยะ (ต้นน้ำ: เสนอโครงการ/งบประมาณ, กลางน้ำ: จัดซื้อจัดจ้าง/บริหารสัญญา, ปลายน้ำ: ส่งมอบ/ประเมินผลสัมฤทธิ์)

4. **ติดตามภาระงานและการจัดสรรทรัพยากร (Workload & Resources)**
   - คำนวณภาระงานจริงตามขั้นตอน (Stage-based Workload)
   - วิเคราะห์ขีดความจุบุคลากร (Capacity vs. Utilization)
   - Heatmap การกระจายตัวของงานรายเดือนตลอดปีงบประมาณ

5. **ระบบความปลอดภัยและบันทึกประวัติ (Audit & Security)**
   - บันทึก Audit Logs ทุกกิจกรรมการเข้าสู่ระบบ การสร้าง แก้ไข ส่งต่อ อนุมัติ และตีกลับ
   - ประวัติโครงการแบบ Timeline ย้อนหลังได้ทุกขั้นตอน

---

## 🛠 เทคโนโลยีที่ใช้ (Tech Stack)

- **Framework**: Next.js 16 (Turbopack, App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4, Lucide React Icons
- **Data Visualization**: Recharts
- **Storage Adapter**: JSON File Storage (Local) / Vercel Blob Storage (Production)

---

## 🚀 การติดตั้งและใช้งาน (Getting Started)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. ตั้งค่า Environment Variables
คัดลอกไฟล์ `.env.example` ไปเป็น `.env.local`:
```bash
cp .env.example .env.local
```

ตั้งค่าตัวแปรสภาพแวดล้อม:
```env
AUTH_SECRET=your-secret-key-min-32-chars
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
# สำหรับ Production บน Vercel (ทางเลือกเมื่อใช้ Vercel Blob):
# BLOB_READ_WRITE_TOKEN=
```

### 3. รันเซิร์ฟเวอร์ในโหมดพัฒนา (Development Mode)
```bash
npm run dev
```
เปิดเบราว์เซอร์ไปที่ [http://localhost:3000](http://localhost:3000)

### 4. คอมไพล์โปรเจกต์ (Build)
```bash
npm run build
```

---

## ☁️ การนำขึ้น Vercel (Deployment to Vercel)

1. นำโค้ดขึ้น GitHub Repository (`PAT`)
2. เข้าสู่ระบบที่ [vercel.com](https://vercel.com)
3. กด **Add New Project** และเลือก Repository `PAT`
4. ตั้งค่า **Environment Variables** ในหน้า Vercel Settings:
   - `AUTH_SECRET`: สตริงสุ่มความยาวไม่น้อยกว่า 32 ตัวอักษร
   - `NODE_ENV`: `production`
5. กด **Deploy**

---

## 👤 บัญชีผู้ใช้สำหรับการทดสอบ (Demo Accounts)

| ชื่อผู้ใช้ (Username) | รหัสผ่าน (Password) | บทบาท (Role) | ตำแหน่งใน สป.รง. |
|---|---|---|---|
| `admin1` | `password123` | SUPER_ADMIN | ผู้อำนวยการศูนย์เทคโนโลยีสารสนเทศและการสื่อสาร (ศสช.) |
| `admin2` | `password123` | ADMIN | หัวหน้ากลุ่มงานพัฒนาระบบงานคอมพิวเตอร์ |
| `officer1` | `password123` | OFFICER | เจ้าหน้าที่ตรวจสอบระบบและสถาปัตยกรรมดิจิทัล |
| `somchai` | `password123` | PROJECT_OWNER | ผู้อำนวยการกลุ่มแรงงานนอกระบบ |
| `reviewer1` | `password123` | REVIEWER | กรรมการกลั่นกรองโครงการ สป.รง. |
| `approver1` | `password123` | APPROVER | รองปลัดกระทรวงแรงงาน (CIO) |
| `executive1` | `password123` | EXECUTIVE | ปลัดกระทรวงแรงงาน |

---

## 📄 ลิขสิทธิ์ (License)
สงวนลิขสิทธิ์ © 2569 สำนักงานปลัดกระทรวงแรงงาน
