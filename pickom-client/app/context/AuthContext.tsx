'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => boolean;
    register: (name: string, email: string, password: string) => boolean;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    const login = (email: string, password: string): boolean => {
        // Мокаповая авторизация - любые данные проходят
        if (email && password) {
            setUser({
                id: '1',
                name: 'John A.',
                email: email
            });
            return true;
        }
        return false;
    };

    const register = (name: string, email: string, password: string): boolean => {
        // Мокаповая регистрация
        if (name && email && password) {
            setUser({
                id: '1',
                name: name,
                email: email
            });
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
    };

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{
            user,
            login,
            register,
            logout,
            isAuthenticated
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