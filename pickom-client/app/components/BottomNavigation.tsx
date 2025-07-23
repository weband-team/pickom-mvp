'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
            name: 'Orders',
            href: '/orders',
            icon: (active: boolean) => (
                <svg className="nav-icon" viewBox="0 0 24 24" fill={active ? '#fff' : '#666'}>
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                </svg>
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