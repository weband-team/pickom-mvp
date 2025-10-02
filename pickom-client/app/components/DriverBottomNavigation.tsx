'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DriverBottomNavigation() {
    const pathname = usePathname();

    const navItems = [
        {
            name: 'Dashboard',
            href: '/driver-dashboard',
            icon: (active: boolean) => (
                <svg className="nav-icon" viewBox="0 0 24 24" fill={active ? '#fff' : '#666'}>
                    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                </svg>
            )
        },
        {
            name: 'Available',
            href: '/driver-dashboard?tab=available',
            icon: (active: boolean) => (
                <svg className="nav-icon" viewBox="0 0 24 24" fill={active ? '#fff' : '#666'}>
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                </svg>
            )
        },
        {
            name: 'Active',
            href: '/driver-dashboard?tab=active',
            icon: (active: boolean) => (
                <svg className="nav-icon" viewBox="0 0 24 24" fill={active ? '#fff' : '#666'}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
            )
        },
        {
            name: 'Profile',
            href: '/driver-profile',
            icon: (active: boolean) => (
                <svg className="nav-icon" viewBox="0 0 24 24" fill={active ? '#fff' : '#666'}>
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
            )
        }
    ];

    const isActive = (href: string) => {
        if (href === '/driver-dashboard') {
            return pathname === '/driver-dashboard' || pathname.startsWith('/driver-dashboard');
        }
        return pathname === href;
    };

    return (
        <div className="bottom-nav">
            <div className="nav-items">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
                    >
                        {item.icon(isActive(item.href))}
                        <span className="nav-label">{item.name}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
} 