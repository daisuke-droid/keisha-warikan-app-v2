import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using google font for premium look
import "./globals.css";
import { Layout } from "@/components/layout/Layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Keisha Warikan - 傾斜割り勘アプリ",
  description: "飲み会や食事会での割り勘を、役職や飲酒量に合わせて「いい感じ」に傾斜をつけて計算できるスマートなWebアプリです。",
  keywords: ["割り勘", "傾斜", "飲み会", "幹事", "アプリ", "計算"],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <Layout>
          {children}
        </Layout>
      </body>
    </html>
  );
}
