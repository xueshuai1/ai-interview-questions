import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import BackToTop from "@/components/BackToTop";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Master - 精通人工智能",
  description: "你的 AI 学习与实践平台。探索最新人工智能技术、工具与教程，从入门到精通。",
  keywords: ["AI", "人工智能", "机器学习", "深度学习", "教程", "工具"],
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "AI Master",
    title: "AI Master - 精通人工智能",
    description: "你的 AI 学习与实践平台。探索最新人工智能技术、工具与教程，从入门到精通。",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Master - 精通人工智能",
    description: "你的 AI 学习与实践平台。探索最新人工智能技术、工具与教程，从入门到精通。",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-64.png", sizes: "64x64", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "dark",
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        {children}
        <BackToTop />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
