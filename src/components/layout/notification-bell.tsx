'use client';

import React, { useState } from 'react';
import { Bell, Check, Info, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface NotificationBellProps {
  unreadCount: number;
}

export function NotificationBell({ unreadCount }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Mock notifications
  const notifications = [
    { id: 1, type: 'info', title: 'โครงการใหม่รอการตรวจสอบ', time: '10 นาทีที่แล้ว', isRead: false },
    { id: 2, type: 'success', title: 'อนุมัติโครงการปรับปรุงอาคารแล้ว', time: '1 ชั่วโมงที่แล้ว', isRead: false },
    { id: 3, type: 'warning', title: 'โครงการถูกตีกลับเพื่อแก้ไข', time: '2 ชั่วโมงที่แล้ว', isRead: true },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-xl shadow-lg z-50 flex flex-col max-h-[80vh]">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-medium text-gray-900">การแจ้งเตือน</h3>
              <button className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                <Check className="w-3 h-3" /> ทำเครื่องหมายอ่านแล้ว
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {notifications.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`p-4 flex gap-3 hover:bg-gray-50 transition-colors cursor-pointer ${notif.isRead ? 'opacity-70' : 'bg-blue-50/30'}`}
                    >
                      <div className="mt-0.5">
                        {notif.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
                        {notif.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                        {notif.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-500" />}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${notif.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                      </div>
                      {!notif.isRead && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">ไม่มีการแจ้งเตือนใหม่</p>
                </div>
              )}
            </div>

            <div className="px-4 py-2 border-t border-gray-100 text-center">
              <Link 
                href="/notifications" 
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                onClick={() => setIsOpen(false)}
              >
                ดูการแจ้งเตือนทั้งหมด
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
