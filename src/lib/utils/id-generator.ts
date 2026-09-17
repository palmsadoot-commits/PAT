import crypto from 'crypto';

export function generateProjectId(fiscalYear: number): string {
  const randomStr = Math.floor(1000 + Math.random() * 9000).toString();
  return `PRJ-${fiscalYear}-${randomStr}`;
}

export function generateProjectNo(fiscalYear: number, sequence: number): string {
  const paddedSequence = sequence.toString().padStart(3, '0');
  return `MOL-${fiscalYear}-${paddedSequence}`;
}

export function generateId(prefix: string): string {
  const uuidShort = generateUUID().substring(0, 8);
  return `${prefix}-${uuidShort}`;
}

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
