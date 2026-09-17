'use client';

import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

interface FilterOptions {
  search: string;
  status: string;
  organization: string;
  fiscalYear: string;
  priority: string;
}

interface ProjectFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
}

export function ProjectFilters({ onFilterChange }: ProjectFiltersProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    status: '',
    organization: '',
    fiscalYear: '',
    priority: '',
  });

  const handleChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      search: '',
      status: '',
      organization: '',
      fiscalYear: '',
      priority: '',
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
      {/* Search Input */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => handleChange('search', e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="ค้นหาชื่อโครงการ, เลขที่โครงการ..."
        />
      </div>

      {/* Dropdowns Container */}
      <div className="flex flex-wrap md:flex-nowrap gap-3 items-center">
        <select
          value={filters.fiscalYear}
          onChange={(e) => handleChange('fiscalYear', e.target.value)}
          className="block w-full md:w-auto py-2 pl-3 pr-10 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg border"
        >
          <option value="">ปีงบประมาณ</option>
          <option value="2567">พ.ศ. 2567</option>
          <option value="2566">พ.ศ. 2566</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => handleChange('status', e.target.value)}
          className="block w-full md:w-auto py-2 pl-3 pr-10 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg border"
        >
          <option value="">ทุกสถานะ</option>
          <option value="DRAFT">ร่าง</option>
          <option value="DOCUMENT_CHECK">รอตรวจสอบเอกสาร</option>
          <option value="PENDING_APPROVAL">รออนุมัติ</option>
          <option value="APPROVED">อนุมัติแล้ว</option>
        </select>

        <select
          value={filters.priority}
          onChange={(e) => handleChange('priority', e.target.value)}
          className="block w-full md:w-auto py-2 pl-3 pr-10 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg border"
        >
          <option value="">ระดับความสำคัญ</option>
          <option value="HIGH">เร่งด่วน</option>
          <option value="MEDIUM">ปกติ</option>
          <option value="LOW">ต่ำ</option>
        </select>

        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors whitespace-nowrap"
          >
            <X className="w-4 h-4" />
            ล้างตัวกรอง
          </button>
        )}
      </div>
    </div>
  );
}
