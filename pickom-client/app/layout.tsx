import type { Metadata, Viewport } from "next";
import { ThemeWrapper } from '../components';
import { Toaster } from 'react-hot-toast';
import { CapacitorProvider } from '@/components/providers/CapacitorProvider';
import StripeProvider from './providers/StripeProvider';

export const metadata: Metadata = {
    title: "Pickom",
    description: "People-Powered Delivery",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "Pickom",
    },
    formatDetection: {
        telephone: false,
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#FF9500" },
        { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
    ],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" style={{ margin: 0, padding: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
            <body style={{ margin: 0, padding: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
                <CapacitorProvider>
                    <StripeProvider>
                        <ThemeWrapper>
                            {children}
                        <Toaster
                            position="top-right"
                            toastOptions={{
                                duration: 4000,
                                style: {
                                    background: '#333',
                                    color: '#fff',
                                },
                                success: {
                                    duration: 3000,
                                    iconTheme: {
                                        primary: '#10b981',
                                        secondary: '#fff',
                                    },
                                },
                                error: {
                                    duration: 5000,
                                    iconTheme: {
                                        primary: '#ef4444',
                                        secondary: '#fff',
                                    },
                                },
                            }}
                        />
                        </ThemeWrapper>
                    </StripeProvider>
                </CapacitorProvider>
            </body>
        </html>
    );
} 