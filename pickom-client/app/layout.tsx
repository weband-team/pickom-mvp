import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { LoadingProvider } from "./context/LoadingContext";
import { OrderProvider } from "./context/OrderContext";
import LoadingWrapper from "./components/LoadingWrapper";

export const metadata: Metadata = {
    title: "Pickom",
    description: "People-Powered Delivery",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <LoadingProvider>
                    <AuthProvider>
                        <OrderProvider>
                            {children}
                            <LoadingWrapper />
                        </OrderProvider>
                    </AuthProvider>
                </LoadingProvider>
            </body>
        </html>
    );
} 