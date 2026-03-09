import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FlowDesk - 물류 운영 어드민",
  description: "실시간 주문 흐름을 한눈에 파악하는 물류 운영 대시보드",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={`${geist.variable} antialiased bg-zinc-50`}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
        </div>
      </body>
    </html>
  );
}
