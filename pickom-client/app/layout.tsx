import type { Metadata } from "next";
import { ThemeWrapper } from '../components';

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
                <ThemeWrapper>
                    {children}
                </ThemeWrapper>
            </body>
        </html>
    );
} 