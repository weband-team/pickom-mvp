'use client'

import { useState, useMemo, useCallback, memo, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { BottomNavigation as MuiBottomNavigation, BottomNavigationAction, Paper, Badge } from '@mui/material';
import { LocalShipping, Chat, Person, Notifications } from '@mui/icons-material';

type NavigationValue = 0 | 1 | 2 | 3;

interface BottomNavigationProps {
    className?: string;
    unreadChatsCount?: number;
    activeOrdersCount?: number;
    unreadNotificationsCount?: number;
    userRole?: 'picker' | 'sender';
}

/**
 * Format badge count: show "99+" if count > 99
 */
const formatBadgeCount = (count: number): string | number => {
    if (count > 99) return '99+';
    return count;
};

function BottomNavigation({
    className,
    unreadChatsCount = 0,
    activeOrdersCount = 0,
    unreadNotificationsCount = 0,
    userRole
}: BottomNavigationProps = {}) {
    const router = useRouter();
    const pathname = usePathname();

    // Auto-detect role from pathname if not provided
    const [detectedRole, setDetectedRole] = useState<'picker' | 'sender' | null>(() => {
        // Try to load from localStorage on mount
        if (typeof window !== 'undefined') {
            return localStorage.getItem('userRole') as 'picker' | 'sender' | null;
        }
        return null;
    });

    useEffect(() => {
        if (!userRole && pathname) {
            let newRole: 'picker' | 'sender' | null = null;

            if (pathname.startsWith('/available-deliveries')) {
                newRole = 'picker';
            } else if (pathname.startsWith('/delivery-methods')) {
                newRole = 'sender';
            }

            if (newRole && newRole !== detectedRole) {
                setDetectedRole(newRole);
                localStorage.setItem('userRole', newRole);
            }
        }
    }, [pathname, userRole, detectedRole]);

    const effectiveRole = userRole || detectedRole;

    const currentValue = useMemo((): NavigationValue => {
        if (!pathname) return 0;
        if (pathname.startsWith('/delivery-methods') || pathname.startsWith('/orders') || pathname.startsWith('/available-deliveries')) return 0;
        if (pathname.startsWith('/chat')) return 1;
        if (pathname.startsWith('/notifications')) return 2;
        if (pathname.startsWith('/profile')) return 3;
        return 0;
    }, [pathname]);

    const [value, setValue] = useState<NavigationValue>(currentValue);

    const handleChange = useCallback((_event: React.SyntheticEvent, newValue: NavigationValue) => {
        setValue(newValue)

        switch (newValue) {
            case 0:
                // Route based on user role
                if (effectiveRole === 'picker') {
                    router.push('/available-deliveries');
                } else {
                    router.push('/delivery-methods');
                }
                break;
            case 1:
                router.push('/chats');
                break;
            case 2:
                router.push('/notifications');
                break;
            case 3:
                router.push('/profile');
                break;
            default:
                break;
        }
    }, [router, effectiveRole]);
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
                <BottomNavigationAction
                    label="Orders"
                    icon={
                        <Badge
                            badgeContent={formatBadgeCount(activeOrdersCount)}
                            color="error"
                            max={99}
                            sx={{
                                '& .MuiBadge-badge': {
                                    backgroundColor: '#FF9500',
                                    color: '#000000',
                                    fontWeight: 600,
                                }
                            }}
                        >
                            <LocalShipping />
                        </Badge>
                    }
                />
                <BottomNavigationAction
                    label="Chat"
                    icon={
                        <Badge
                            badgeContent={formatBadgeCount(unreadChatsCount)}
                            color="error"
                            max={99}
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
                    label="Notifications"
                    icon={
                        <Badge
                            badgeContent={formatBadgeCount(unreadNotificationsCount)}
                            color="error"
                            max={99}
                            sx={{
                                '& .MuiBadge-badge': {
                                    backgroundColor: '#FF9500',
                                    color: '#000000',
                                    fontWeight: 600,
                                }
                            }}
                        >
                            <Notifications />
                        </Badge>
                    }
                />
                <BottomNavigationAction
                    label="Profile"
                    icon={<Person />}
                />
            </MuiBottomNavigation>
        </Paper>
    )
}

export default memo(BottomNavigation);