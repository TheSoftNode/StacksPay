import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ConditionalNavbar from "@/components/layout/ConditionalNavbar";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/lib/providers/query-provider"; // Restored
import { Toaster } from "@/components/ui/toaster";
import dynamic from 'next/dynamic'; // Restored
import ClientOnly from "@/components/providers/client-only";

// Dynamically import ChatBot with no SSR to prevent hydration issues
const ChatBot = dynamic(() => import('@/components/shared/ChatBot'), {
  ssr: false,
}); // Restored

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "StacksPay Payment Gateway",
  description: "Secure sBTC payment processing for modern businesses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientOnly fallback={<div className="min-h-screen bg-background" />}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              <ConditionalNavbar />
              {children}
              <ChatBot />
              <Toaster />
            </QueryProvider>
          </ThemeProvider>
        </ClientOnly>
      </body>
    </html>
  );
}
