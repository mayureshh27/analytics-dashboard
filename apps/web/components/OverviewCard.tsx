"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

interface OverviewCardProps {
  title: string;
  value: string;
  change: string;
  changeLabel?: string;
  icon: LucideIcon;
  trendData: { value: number }[];
}

export function OverviewCard({
                               title,
                               value,
                               change,
                               changeLabel = "from last month",
                               icon: Icon,
                               trendData,
                             }: OverviewCardProps) {
  const isPositive = change.startsWith("+");
  const isNegative = change.startsWith("-");
  const color = isPositive ? "#22c55e" : isNegative ? "#ef4444" : "#64748b";
  const gradientId = `color-${title.replace(/\s/g, "-").toLowerCase()}`;

  return (
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1 truncate">
                {value}
              </div>
              <div className="flex items-center text-xs">
              <span
                  className={`font-semibold ${
                      isPositive
                          ? "text-green-600 dark:text-green-400"
                          : isNegative
                              ? "text-red-600 dark:text-red-400"
                              : "text-slate-600 dark:text-slate-400"
                  }`}
              >
                {change}
              </span>
                <span className="ml-1 text-slate-500 dark:text-slate-400">
                {changeLabel}
              </span>
              </div>
            </div>
            <div className="flex-shrink-0" style={{ width: 80, height: 32 }}>
              <ResponsiveContainer>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                      type="monotone"
                      dataKey="value"
                      stroke={color}
                      strokeWidth={1.5}
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