"use client";
import React, { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

const NotificationItem = ({ title, description, time, type }: {
  title: string;
  description: string;
  time: string;
  type: 'alert' | 'security' | 'info' | 'success' | 'warning' | 'error'
}) => (
  <div className={`flex items-start justify-between p-4 border border-white/5 rounded-md cursor-pointer group`}>
    <div className="flex items-center justify-center gap-4">
      <div className='mt-1 shrink-0 md:w-10 md:h-10 w-6 h-6 rounded-full md:p-2 p-1 bg-[#28282F] flex items-center justify-center'>
        {['alert', 'error', 'warning'].includes(type) ? <img src="/images/alert.png" alt="" /> : <img src="/images/download.png" alt="" />}
      </div>
      <div>
        <h4 className="text-white md:text-sm text-xs font-semibold leading-tight ">{title}</h4>
        <p className="text-[#BDBDC7] md:text-xs text-[10px] mt-1 leading-relaxed max-w-70 md:max-w-md">
          {description}
        </p>
      </div>
    </div>
    <span className="text-[#BDBDC7] md:text-xs text-[10px] font-medium whitespace-nowrap ml-4">{time}</span>
  </div>
);

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await apiRequest("/notifications");
        setNotifications(data);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const today = new Date().setHours(0, 0, 0, 0);
  const todayNodes = notifications.filter(n => new Date(n.createdAt).getTime() >= today);
  const earlierNodes = notifications.filter(n => new Date(n.createdAt).getTime() < today);

  return (
    <div className="min-h-screen bg-[#181818] text-white p-4 md:p-12 font-manrope">
      <div className="max-w-300 mx-auto">
        <h1 className="md:text-2xl text-xl font-semibold md:mb-10 mb-5 tracking-wide">Notifications</h1>

        <div className="bg-[#1D1D1D] border border-white/5 rounded-lg p-4 md:p-8 space-y-10">
          {loading ? (
            <p className="text-gray-400">Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <p className="text-gray-400">No notifications found.</p>
          ) : (
            <>
              {todayNodes.length > 0 && (
                <section>
                  <h2 className="text-gray-50 text-md font-semibold mb-4">Today</h2>
                  <div className="grid grid-cols-1 gap-4">
                    {todayNodes.map((n, i) => (
                      <NotificationItem
                        key={i}
                        title={n.title}
                        description={n.message}
                        time={formatDate(n.createdAt)}
                        type={n.type === 'info' ? 'security' : 'alert'}
                      />
                    ))}
                  </div>
                </section>
              )}

              {earlierNodes.length > 0 && (
                <section>
                  <h2 className="text-gray-50 text-md font-semibold mb-4">Earlier</h2>
                  <div className="grid grid-cols-1 gap-4">
                    {earlierNodes.map((n, i) => (
                      <NotificationItem
                        key={i}
                        title={n.title}
                        description={n.message}
                        time={formatDate(n.createdAt)}
                        type={n.type === 'info' ? 'security' : 'alert'}
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}