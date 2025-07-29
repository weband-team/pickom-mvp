'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingContextType {
    isLoading: boolean;
    message: string;
    showLoading: (message?: string) => void;
    hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("Finding the best pickers nearby...");

    const showLoading = (customMessage?: string) => {
        if (customMessage) {
            setMessage(customMessage);
        }
        setIsLoading(true);
    };

    const hideLoading = () => {
        setIsLoading(false);
        // Reset to default message
        setMessage("Finding the best pickers nearby...");
    };

    return (
        <LoadingContext.Provider value={{
            isLoading,
            message,
            showLoading,
            hideLoading
        }}>
            {children}
        </LoadingContext.Provider>
    );
}

export function useLoading() {
    const context = useContext(LoadingContext);
    if (context === undefined) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
} 