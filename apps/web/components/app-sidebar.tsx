"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home, FileText, BarChart2, Users, Settings, Bot
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar";

const navData = {
    general: [
        { title: "Dashboard", href: "/", icon: Home },
        { title: "Invoice", href: "/invoice", icon: FileText },
        { title: "Chat with Data", href: "/chat", icon: Bot },
    ],
    management: [
        { title: "Other files", href: "/other-files", icon: BarChart2 },
        { title: "Departments", href: "/departments", icon: Users },
        { title: "Users", href: "/users", icon: Users },
        { title: "Settings", href: "/settings", icon: Settings },
    ],
};

function VersionSwitcher() {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton size="lg">
                    <div className="bg-yellow-400 text-black flex aspect-square size-8 items-center justify-center rounded-lg font-bold">
                        B
                    </div>
                    <div className="flex flex-col gap-0.5 leading-none">
                        <span className="font-semibold">Buchhaltung</span>
                        <span className="text-xs text-muted-foreground">12 members</span>
                    </div>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}

export function AppSidebar({ ...props }) {
    const pathname = usePathname();

    return (
        <Sidebar {...props}>
            <SidebarHeader>
                <VersionSwitcher />
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>GENERAL</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navData.general.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                                        <Link href={item.href}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>MANAGEMENT</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navData.management.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                                        <Link href={item.href}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    );
}