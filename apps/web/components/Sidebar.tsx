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
    <div className="flex flex-col w-64 bg-slate-800 text-white">
      <div className="flex items-center justify-between h-16 px-6 border-b border-slate-700">
        <div>
          <h1 className="text-xl font-bold">Buchhaltung</h1>
          <p className="text-xs text-slate-400">12 members</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-1 rounded-md hover:bg-slate-700">
            <BarChart2 className="w-5 h-5" />
          </button>
          <button className="p-1 rounded-md hover:bg-slate-700">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
      <nav className="flex-grow px-4 py-4">
        <p className="px-4 text-xs font-semibold text-slate-400 uppercase">General</p>
        <ul className="mt-2 space-y-2">
          {links.slice(0, 3).map((link) => (
            <li key={link.name}>
              <Link
                href={link.href}
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium rounded-md",
                  pathname === link.href
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-700"
                )}
              >
                <link.icon className="w-5 h-5 mr-3" />
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-8 px-4 text-xs font-semibold text-slate-400 uppercase">Management</p>
        <ul className="mt-2 space-y-2">
          {links.slice(3).map((link) => (
            <li key={link.name}>
              <Link
                href={link.href}
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium rounded-md",
                  pathname === link.href
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-700"
                )}
              >
                <link.icon className="w-5 h-5 mr-3" />
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="px-6 py-4 border-t border-slate-700">
        <div className="flex items-center">
          <div className="w-8 h-8 mr-3 font-bold bg-black rounded-full flex items-center justify-center">
            N
          </div>
          <h2 className="text-lg font-semibold">Flowbit AI</h2>
        </div>
      </div>
    </div>
  );
}
