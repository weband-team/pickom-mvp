'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'customer' | 'driver';
    phone?: string;
    profileComplete?: boolean;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string, role?: 'customer' | 'driver') => boolean;
    register: (name: string, email: string, password: string, role: 'customer' | 'driver', phone?: string) => boolean;
    logout: () => void;
    isAuthenticated: boolean;
    isCustomer: boolean;
    isDriver: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    const login = (email: string, password: string, role: 'customer' | 'driver' = 'customer'): boolean => {
        // Мокаповая авторизация - любые данные проходят
        if (email && password) {
            setUser({
                id: '1',
                name: 'John A.',
                email: email,
                role: role,
                profileComplete: true
            });
            return true;
        }
        return false;
    };

    const register = (name: string, email: string, password: string, role: 'customer' | 'driver', phone?: string): boolean => {
        // Мокаповая регистрация
        if (name && email && password && role) {
            setUser({
                id: '1',
                name: name,
                email: email,
                role: role,
                phone: phone,
                profileComplete: !!phone
            });
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
    };

    const isAuthenticated = !!user;
    const isCustomer = user?.role === 'customer';
    const isDriver = user?.role === 'driver';

    return (
        <AuthContext.Provider value={{
            user,
            login,
            register,
            logout,
            isAuthenticated,
            isCustomer,
            isDriver
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
} 