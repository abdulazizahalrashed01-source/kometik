import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Kometik",
  description: "Beauty & Skincare Store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-white text-gray-900">
        
        {children}
      </body>
    </html>
  );
}