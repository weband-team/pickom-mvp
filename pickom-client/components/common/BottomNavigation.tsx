'use client'

import { useState, useMemo, useCallback, memo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { BottomNavigation as MuiBottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { LocalShipping, Chat, Person } from '@mui/icons-material';

type NavigationValue = 0 | 1 | 2;

interface BottomNavigationProps {
    className?: string;
}

function BottomNavigation({ className }: BottomNavigationProps = {}) {
    const router = useRouter();
    const pathname = usePathname();

    const currentValue = useMemo((): NavigationValue => {
        if (pathname.startsWith('/delivery-methods')) return 0;
        if (pathname.startsWith('/chat')) return 1;
        if (pathname.startsWith('/profile')) return 2;
        return 0;
    }, [pathname]);

    const [value, setValue] = useState<NavigationValue>(currentValue);

    const handleChange = useCallback((event: React.SyntheticEvent, newValue: NavigationValue) => {
        setValue(newValue)

        switch (newValue) {
            case 0:
                router.push('/delivery-methods');
                break;
            case 1:
                const selectedPickerId = typeof window !== 'undefined'
                    ? localStorage.getItem('selectedPickerId')
                    : null;
                if (selectedPickerId) {
                    router.push(`/chat/${selectedPickerId}`);
                } else {
                    router.push('/picker-results');
                }
                break;
            case 2:
                router.push('/profile');
                break;
            default:
                break;
        }
    }, [router]);
    return (
        <Paper
            className={className}
            sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1200,
                paddingBottom: 'env(safe-area-inset-bottom)',
                backgroundColor: 'transparent',
                borderTop: '1px solid #e0e0e0',
                borderRadius: 0,
                boxShadow: 'none',
            }}
            elevation={0}
        >
            <MuiBottomNavigation value={value} onChange={handleChange}>
                <BottomNavigationAction label="Delivery" icon={<LocalShipping />} />
                <BottomNavigationAction label="Chat" icon={<Chat />} />
                <BottomNavigationAction label="Profile" icon={<Person />} />
            </MuiBottomNavigation>
        </Paper>
    )
}

export default memo(BottomNavigation);