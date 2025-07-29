'use client';

import { useAuth } from '../context/AuthContext';
import BottomNavigation from './BottomNavigation';
import DriverBottomNavigation from './DriverBottomNavigation';

export default function NavigationWrapper() {
    const { isAuthenticated, isDriver, isCustomer } = useAuth();

    if (!isAuthenticated) {
        return null; // No navigation for unauthenticated users
    }

    if (isDriver) {
        return <DriverBottomNavigation />;
    }

    if (isCustomer) {
        return <BottomNavigation />;
    }

    return null; // Fallback
} 