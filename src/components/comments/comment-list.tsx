'use client';

import React from 'react';

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    name: string;
    avatarUrl?: string;
  };
}

interface CommentListProps {
  comments: Comment[];
}

export function CommentList({ comments }: CommentListProps) {
  if (!comments || comments.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
        ยังไม่มีความคิดเห็น
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-4">
          <div className="flex-shrink-0">
            {comment.user.avatarUrl ? (
              <img 
                src={comment.user.avatarUrl} 
                alt={comment.user.name} 
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                {comment.user.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 bg-gray-50 p-4 rounded-xl rounded-tl-none border border-gray-100">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-gray-900 text-sm">{comment.user.name}</span>
              <span className="text-xs text-gray-500">
                {new Date(comment.createdAt).toLocaleString('th-TH', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
