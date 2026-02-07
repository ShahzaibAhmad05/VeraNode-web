import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { SmoothScrollProvider } from "@/contexts/SmoothScrollProvider";
import { Toaster } from "react-hot-toast";
import Header from "@/components/layout/Header";
import { FloatingBackground } from "@/components/ui/FloatingBackground";
import AuthDebugLoader from "@/components/debug/AuthDebugLoader";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "VeraNode - Anonymous Campus Rumor System",
  description: "AI-powered anonymous campus rumor verification system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme');
                if (theme === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-white dark:bg-gray-950">
        <FloatingBackground />
        <AuthDebugLoader />
        <AuthProvider>
          <AdminAuthProvider>
            <SmoothScrollProvider>
              <Header />
              <main className="pb-12 relative z-10">
                {children}
              </main>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    icon: '✓',
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                    style: {
                      background: '#fff',
                      color: '#1f2937',
                      border: '1px solid #d1d5db',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </SmoothScrollProvider>
          </AdminAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
