import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const merriweather = Merriweather({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "700"],
});

export const metadata: Metadata = {
  title: "ReadHub",
  description: "Track your daily reading progress and compete with friends",
  other: {
    "preload-critical": "/api/dashboard",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload critical resources */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

        {/* Critical CSS for above-the-fold content */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Critical CSS for instant loading */
            body { margin: 0; font-family: var(--font-sans), system-ui, sans-serif; }
            .antialiased { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

            /* Skeleton loading styles to prevent CLS */
            @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
            .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }

            /* Critical layout styles */
            .min-h-screen { min-height: 100vh; }
            .flex { display: flex; }
            .items-center { align-items: center; }
            .justify-center { justify-content: center; }
          `
        }} />

        {/* Optimize favicon loading */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${inter.variable} ${merriweather.variable} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
