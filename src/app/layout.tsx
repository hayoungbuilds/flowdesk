import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { ToastContainer } from "@/components/ui/toast";
import { ToastProvider } from "@/components/layout/ToastProvider";

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
      <body className={`${geist.variable} antialiased bg-zinc-50 dark:bg-zinc-950`}>
        <ToastProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
          </div>
          <ToastContainer />
        </ToastProvider>
      </body>
    </html>
  );
}
