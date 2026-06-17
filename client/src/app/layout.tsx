import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/auth-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { ToastProvider } from "@/contexts/toast-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Likho",
  description: "AI-powered notes workspace built with Next.js and Express."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-white focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-slate-950 focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:bg-slate-900 dark:focus:text-white"
        >
          Skip to content
        </a>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>{children}</AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
