export interface Organization {
  id: string;
  name: string;
  nameEn: string;
  code: string;
  isActive: boolean;
  createdAt: string;
}

export interface Department {
  id: string;
  organizationId: string;
  name: string;
  nameEn: string;
  code: string;
  isActive: boolean;
  createdAt: string;
}
