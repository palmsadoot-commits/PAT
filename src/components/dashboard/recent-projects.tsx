'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { StatusBadge } from '../projects/status-badge';
import type { ProjectStatus } from '@/types';

interface Project {
  id: string;
  code: string;
  name: string;
  status: any;
  updatedAt: string;
}

interface RecentProjectsProps {
  projects: Project[];
}

export function RecentProjects({ projects }: RecentProjectsProps) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">โครงการล่าสุด</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 font-medium">เลขที่</th>
              <th className="px-6 py-3 font-medium">ชื่อโครงการ</th>
              <th className="px-6 py-3 font-medium">สถานะ</th>
              <th className="px-6 py-3 font-medium text-right">วันที่ปรับปรุง</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {projects.map((project) => (
              <tr 
                key={project.id}
                onClick={() => router.push(`/projects/${project.id}`)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {project.code}
                </td>
                <td className="px-6 py-4 text-gray-700 min-w-[300px]">
                  {project.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={project.status} />
                </td>
                <td className="px-6 py-4 text-right text-gray-500 whitespace-nowrap">
                  {new Date(project.updatedAt).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  ไม่พบข้อมูลโครงการ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
