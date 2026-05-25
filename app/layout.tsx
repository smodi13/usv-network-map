import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "USV Portfolio Network Map",
  description:
    "An interactive force-directed graph mapping Union Square Ventures portfolio companies, their founders, and institutional connections. Built by Sahil Modi for the USV Analyst Program application.",
  openGraph: {
    title: "USV Portfolio Network Map",
    description: "42 companies. 80+ founders. One thesis. Explore the human infrastructure behind Union Square Ventures.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" style={{ background: "#0B1426" }}>
        {children}
      </body>
    </html>
  );
}
