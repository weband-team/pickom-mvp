'use client';

import { useSession } from '../hooks/use-session';
import BottomNavigation from './BottomNavigation';
import DriverBottomNavigation from './DriverBottomNavigation';

export default function NavigationWrapper() {
    const { status, user } = useSession();

    if (status !== 'authenticated') {
        return null; // No navigation for unauthenticated users
    }

    if (user && user.role === 'picker') {
        return <DriverBottomNavigation />;
    }

    if (user && user.role === 'sender') {
        return <BottomNavigation />;
    }

    return null; // Fallback
} 