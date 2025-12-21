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
    // Preload critical assets
    'link[rel="preload"][href="/favicon.ico"][as="image"]': '',
    'link[rel="dns-prefetch"][href="//fonts.googleapis.com"]': '',
    'link[rel="preconnect"][href="//fonts.gstatic.com"][crossorigin]': '',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${merriweather.variable} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
