import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Bell } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Buchhaltung Dashboard",
    description: "Invoice and accounting dashboard",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body className={inter.className}>
        <SidebarProvider defaultOpen={true}>
            <AppSidebar />
            <SidebarInset className="flex flex-col">
                <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <span className="font-medium">Dashboard</span>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>

                    <div className="ml-auto flex items-center gap-4">
                        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Bell className="h-5 w-5" />
                        </button>
                        <button className="flex items-center gap-2 hover:bg-gray-100 rounded-lg p-1 transition-colors">
                            <div className="relative h-8 w-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                <span className="text-sm font-semibold">AJ</span>
                            </div>
                            <div className="hidden md:block text-left">
                                <div className="text-sm font-medium">Mayuresh</div>
                                <div className="text-xs text-gray-500">Admin</div>
                            </div>
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-4 md:p-8 bg-gray-50">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
        </body>
        </html>
    );
}