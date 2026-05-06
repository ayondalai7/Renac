import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Recnac — Breast Cancer Classification",
  description: "ML-powered breast tumor classification. Research tool only.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
