'use client';

import { useRouter, usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface PhoneWrapperProps {
    children: ReactNode;
}

export default function PhoneWrapper({ children }: PhoneWrapperProps) {
    const router = useRouter();
    const pathname = usePathname();

    const handleHomePress = () => {
        // Если уже на главной, ничего не делаем
        if (pathname === '/') return;

        // Иначе возвращаемся на главную
        router.push('/');
    };

    return (
        <div className="phone-container">
            <div className="phone-frame">
                {children}

                {/* Home Indicator - работает как кнопка */}
                <div
                    className={`home-indicator ${pathname === '/' ? 'active' : ''}`}
                    onClick={handleHomePress}
                    title="Home"
                />
            </div>
        </div>
    );
} 