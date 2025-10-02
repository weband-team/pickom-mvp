'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import NotificationBadge from './NotificationBadge';

export default function BottomNavigation() {
    const pathname = usePathname();

    const navItems = [
        {
            name: 'Home',
            href: '/',
            icon: (active: boolean) => (
                <svg className="nav-icon" viewBox="0 0 24 24" fill={active ? '#fff' : '#666'}>
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
            )
        },
        {
            name: 'Send',
            href: '/send-package',
            icon: (active: boolean) => (
                <svg className="nav-icon" viewBox="0 0 24 24" fill={active ? '#fff' : '#666'}>
                    <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
                </svg>
            )
        },
        {
            name: 'Notifications',
            href: '/notifications',
            icon: (active: boolean) => (
                <div className="relative">
                    <svg className="nav-icon" viewBox="0 0 24 24" fill={active ? '#fff' : '#666'}>
                        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                    </svg>
                    <NotificationBadge />
                </div>
            )
        },
        {
            name: 'Profile',
            href: '/profile',
            icon: (active: boolean) => (
                <svg className="nav-icon" viewBox="0 0 24 24" fill={active ? '#fff' : '#666'}>
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9M19 21H5V3H13V9H19V21Z" />
                </svg>
            )
        }
    ];

    return (
        <div className="bottom-nav">
            <div className="nav-items">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                        >
                            {item.icon(isActive)}
                            <span className="nav-label">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
} 