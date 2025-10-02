'use client';

import NotificationList from '../components/NotificationList';

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <NotificationList />
      </div>
    </div>
  );
}