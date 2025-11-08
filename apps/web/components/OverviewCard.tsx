import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { LucideIcon } from "lucide-react";

interface OverviewCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
}

export function OverviewCard({ title, value, change, icon: Icon }: OverviewCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="w-4 h-4 text-gray-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-gray-500">{change}</p>
      </CardContent>
    </Card>
  );
}
