import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Chess Tracker",
    description: "Office Chess Tracker",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark antialiased">
            <body className={`${inter.className} selection:bg-blue-500/30`}>{children}</body>
        </html>
    );
}

