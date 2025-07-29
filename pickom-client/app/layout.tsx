import type { Metadata } from "next";
import "./globals.css";
import { LoadingProvider } from "./context/LoadingContext";
import { OrderProvider } from "./context/OrderContext";
import LoadingWrapper from "./components/LoadingWrapper";
import { ClientProviders } from "./ClientProviders";

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
                <ClientProviders>
                    <LoadingProvider>
                        <OrderProvider>
                            {children}
                            <LoadingWrapper />
                        </OrderProvider>
                    </LoadingProvider>
                </ClientProviders>
            </body>
        </html>
    );
} 