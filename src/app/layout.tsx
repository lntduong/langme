import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import BottomNav from "@/components/layout/BottomNav";
import { Nunito } from "next/font/google";
import { cn } from "@/lib/utils";

const nunito = Nunito({subsets:['latin', 'vietnamese'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "LangMe - Học Tiếng Anh & Tiếng Trung",
  description: "Ứng dụng học tiếng Anh và tiếng Trung cá nhân với AI và SRS",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LangMe",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#F4F5FB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={cn("font-sans", nunito.variable)}>
      <head>
        {/* Removed external Google Fonts link since we use next/font */}
      </head>
      <body>
        <Providers>
          <div className="mobile-shell">
            {children}
            <BottomNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}
