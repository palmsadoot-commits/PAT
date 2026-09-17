import React from 'react';

interface LoadingStateProps {
  type?: 'card' | 'table' | 'form';
  count?: number;
}

export function LoadingState({ type = 'card', count = 3 }: LoadingStateProps) {
  if (type === 'table') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="h-12 bg-gray-50 border-b border-gray-200" />
        <div className="divide-y divide-gray-100">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="p-4 flex gap-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-1/6" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'form') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4 animate-pulse" />
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="space-y-2 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/6" />
            <div className="h-10 bg-gray-100 rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${count > 1 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : ''}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm animate-pulse">
          <div className="flex gap-4 mb-4">
            <div className="w-12 h-12 rounded-lg bg-gray-200" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-100 rounded" />
            <div className="h-4 bg-gray-100 rounded w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
}
