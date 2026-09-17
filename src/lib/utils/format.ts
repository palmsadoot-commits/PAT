const THAI_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

export function formatBudget(amount: number): string {
  return amount.toLocaleString('en-US');
}

export function formatBudgetFull(amount: number): string {
  return `${formatBudget(amount)} บาท`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = THAI_MONTHS[date.getMonth()];
  const year = toThaiYear(date.getFullYear());
  return `${day} ${month} ${year}`;
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  const formattedDate = formatDate(dateString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${formattedDate} ${hours}:${minutes}`;
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'เมื่อสักครู่';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `เมื่อ ${diffInMinutes} นาทีที่แล้ว`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `เมื่อ ${diffInHours} ชั่วโมงที่แล้ว`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `เมื่อ ${diffInDays} วันที่แล้ว`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `เมื่อ ${diffInMonths} เดือนที่แล้ว`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `เมื่อ ${diffInYears} ปีที่แล้ว`;
}

export function toThaiYear(year: number): number {
  return year + 543;
}

export function fromThaiYear(thaiYear: number): number {
  return thaiYear - 543;
}
