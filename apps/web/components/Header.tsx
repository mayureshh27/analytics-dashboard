import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { Bell, MoreVertical } from "lucide-react";

export function Header() {
  return (
    <header className="flex items-center justify-between h-16 px-8 bg-white border-b">
      <h1 className="text-lg font-semibold">Dashboard</h1>
      <div className="flex items-center space-x-4">
        <Bell className="w-6 h-6 text-gray-500" />
        <div className="flex items-center space-x-2">
          <Avatar>
            <AvatarImage src="/me.jpg" alt="@shadcn" className="object-cover"/>
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">Amit Jadhav</p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
          <MoreVertical className="w-5 h-5 text-gray-500" />
        </div>
      </div>
    </header>
  );
}
