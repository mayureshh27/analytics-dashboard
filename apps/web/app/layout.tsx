import "./globals.css";
import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Flowchat",
  description: "Analytics Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex flex-col flex-1">
          <Header />
          <main className="flex-1 p-8 bg-gray-50 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
