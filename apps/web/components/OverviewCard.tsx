import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

interface OverviewCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  trendData: { value: number }[];
}

export function OverviewCard({
  title,
  value,
  change,
  icon: Icon,
  trendData,
}: OverviewCardProps) {
  const isPositive = change.startsWith("+");
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const color = isPositive ? "#22c55e" : "#ef4444";
  const gradientId = `color-${title.replace(/\s/g, "")}`;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-gray-500">
          {title}
        </CardTitle>
        <Icon className="w-5 h-5 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-3xl font-bold">{value}</div>
            <div className="flex items-center text-xs">
              <TrendIcon
                className={`w-4 h-4 mr-1 ${
                  isPositive ? "text-green-500" : "text-red-500"
                }`}
              />
              <span
                className={`${
                  isPositive ? "text-green-500" : "text-red-500"
                }`}
              >
                {change.slice(1)}
              </span>
              <span className="ml-1 text-gray-500">from last month</span>
            </div>
          </div>
          <div style={{ width: 100, height: 40 }}>
            <ResponsiveContainer>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  strokeWidth={2}
                  fill={`url(#${gradientId})`}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
