export type DocumentType = 
  | 'PROPOSAL' 
  | 'BUDGET' 
  | 'OFFICIAL_LETTER' 
  | 'SUPPORTING' 
  | 'APPROVAL' 
  | 'OTHER';

export interface ProjectDocument {
  id: string;
  projectId: string;
  fileName: string;
  originalName: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
  documentType: DocumentType;
  uploadedBy: string;
  uploadedAt: string;
  version: number;
  blobUrl?: string;
  isDeleted: boolean;
  deletedAt?: string;
  deletedBy?: string;
}
