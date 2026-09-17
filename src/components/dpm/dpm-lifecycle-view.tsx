'use client';

import React, { useEffect, useState } from 'react';
import { ProjectDPMLifecycle, DPMPhase } from '@/types';
import { LifecycleNavigator } from './lifecycle-navigator';
import { UpstreamPanel } from './upstream-panel';
import { MidstreamPanel } from './midstream-panel';
import { DownstreamPanel } from './downstream-panel';
import { Loader2, AlertCircle } from 'lucide-react';

interface DPMLifecycleViewProps {
  projectId: string;
}

export function DPMLifecycleView({ projectId }: DPMLifecycleViewProps) {
  const [dpm, setDpm] = useState<ProjectDPMLifecycle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activePhase, setActivePhase] = useState<DPMPhase>('UPSTREAM');

  useEffect(() => {
    let isMounted = true;
    const fetchDpm = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/dpm/projects/${projectId}`);
        if (!res.ok) throw new Error('ไม่สามารถดึงข้อมูล DPM Lifecycle ได้');
        const json = await res.json();
        if (isMounted) {
          setDpm(json.data);
          if (json.data?.currentPhase) {
            setActivePhase(json.data.currentPhase);
          }
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDpm();
    return () => { isMounted = false; };
  }, [projectId]);

  if (loading) {
    return (
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-12 text-center shadow-[var(--shadow-card)] space-y-3">
        <Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin mx-auto" />
        <p className="text-xs font-medium text-[var(--foreground-muted)]">กำลังโหลดข้อมูลวงจรชีวิตโครงการดิจิทัล (DPM)...</p>
      </div>
    );
  }

  if (error || !dpm) {
    return (
      <div className="bg-[var(--surface)] border border-red-200 rounded-[var(--radius-xl)] p-8 text-center space-y-2">
        <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
        <h4 className="text-sm font-bold text-red-900">ไม่สามารถแสดงข้อมูล DPM ได้</h4>
        <p className="text-xs text-red-700">{error || 'ไม่พบข้อมูล'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 3-Phase Lifecycle Navigator */}
      <LifecycleNavigator
        currentPhase={dpm.currentPhase}
        activePhase={activePhase}
        onSelectPhase={(phase) => setActivePhase(phase)}
        progress={dpm.phaseProgress || { upstream: 0, midstream: 0, downstream: 0 }}
      />

      {/* Phase Panels */}
      {activePhase === 'UPSTREAM' && (
        <UpstreamPanel dpm={dpm} />
      )}

      {activePhase === 'MIDSTREAM' && (
        <MidstreamPanel dpm={dpm} />
      )}

      {activePhase === 'DOWNSTREAM' && (
        <DownstreamPanel dpm={dpm} />
      )}
    </div>
  );
}
