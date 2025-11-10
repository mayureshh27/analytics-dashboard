"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { Bell, MoreVertical, BarChart2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function Header() {
  return (
      <header className="flex items-center justify-between h-16 shrink-0 border-b px-4 bg-gray-50">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center space-x-2">
            <button className="p-1 rounded-md hover:bg-gray-200">
              <BarChart2 className="w-5 h-5 text-gray-500" />
            </button>
            <button className="p-1 rounded-md hover:bg-gray-200">
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </div>
        <div className="flex items-center space-x-6">
          <Bell className="w-6 h-6 text-gray-500" />
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src="/me.jpg" alt="Amit Jadhav" className="object-cover" />
              <AvatarFallback>AJ</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Amit Jadhav</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
            <button className="p-1 rounded-md hover:bg-gray-200">
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      </header>
  );
}
