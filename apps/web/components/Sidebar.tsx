"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, BarChart2, Users, Settings, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Invoice", href: "/invoice", icon: FileText },
  { name: "Chat with Data", href: "/chat", icon: Bot },
  { name: "Other files", href: "/other-files", icon: BarChart2 },
  { name: "Departments", href: "/departments", icon: Users },
  { name: "Users", href: "/users", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-gray-50 border-r">
      <div className="flex items-center justify-center h-16 bg-white border-b">
        <h1 className="text-xl font-bold">Buchhaltung</h1>
      </div>
      <nav className="flex-grow px-4 py-4">
        <p className="px-4 text-xs font-semibold text-gray-500 uppercase">General</p>
        <ul className="mt-2 space-y-2">
          {links.slice(0, 3).map((link) => (
            <li key={link.name}>
              <Link
                href={link.href}
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium rounded-md",
                  pathname === link.href
                    ? "bg-gray-200 text-gray-900"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <link.icon className="w-5 h-5 mr-3" />
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-8 px-4 text-xs font-semibold text-gray-500 uppercase">Management</p>
        <ul className="mt-2 space-y-2">
          {links.slice(3).map((link) => (
            <li key={link.name}>
              <Link
                href={link.href}
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium rounded-md",
                  pathname === link.href
                    ? "bg-gray-200 text-gray-900"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <link.icon className="w-5 h-5 mr-3" />
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
