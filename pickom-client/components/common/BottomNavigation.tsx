'use client'

import { useState, useMemo, useCallback, memo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { BottomNavigation as MuiBottomNavigation, BottomNavigationAction, Paper, Badge } from '@mui/material';
import { LocalShipping, Chat, Person } from '@mui/icons-material';

type NavigationValue = 0 | 1 | 2;

interface BottomNavigationProps {
    className?: string;
    unreadCount?: number;
    activeOrdersCount?: number;
}

function BottomNavigation({ className, unreadCount = 0, activeOrdersCount = 0 }: BottomNavigationProps = {}) {
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
                router.push('/chats');
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
                backgroundColor: 'background.paper',
                borderTop: 1,
                borderColor: 'divider',
                borderRadius: 0,
                boxShadow: 'none',
            }}
            elevation={0}
        >
            <MuiBottomNavigation
                value={value}
                onChange={handleChange}
                sx={{
                    backgroundColor: 'background.paper',
                }}
            >
                <BottomNavigationAction label="Delivery" icon={<LocalShipping />} />
                <BottomNavigationAction
                    label="Chat"
                    icon={
                        <Badge
                            badgeContent={unreadCount}
                            color="error"
                            sx={{
                                '& .MuiBadge-badge': {
                                    backgroundColor: '#FF9500',
                                    color: '#000000',
                                    fontWeight: 600,
                                }
                            }}
                        >
                            <Chat />
                        </Badge>
                    }
                />
                <BottomNavigationAction
                    label="Profile"
                    icon={
                        <Badge
                            badgeContent={activeOrdersCount}
                            color="error"
                            sx={{
                                '& .MuiBadge-badge': {
                                    backgroundColor: '#FF9500',
                                    color: '#000000',
                                    fontWeight: 600,
                                }
                            }}
                        >
                            <Person />
                        </Badge>
                    }
                />
            </MuiBottomNavigation>
        </Paper>
    )
}

export default memo(BottomNavigation);