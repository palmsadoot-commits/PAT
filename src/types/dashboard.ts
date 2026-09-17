export interface ProjectStatusCounts {
  [status: string]: number;
}

export interface DashboardStats {
  totalProjects: number;
  byStatus: ProjectStatusCounts;
  totalBudget: number;
}

export interface ChartSeries {
  name: string;
  data: number[];
}

export interface ChartData {
  labels: string[];
  series: ChartSeries[];
}

export interface FilterOptions {
  fiscalYear?: string;
  organizationId?: string;
  departmentId?: string;
  projectType?: string;
  status?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}
