// /mycomponents/CategoryChart.tsx
"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card } from "@repo/ui/card";

// Color scheme matching the image
const COLORS = ["#3b82f6", "#fb923c", "#fed7aa"];

interface CategoryData {
    category: string;
    spend: number;
}

export function CategoryChart({ className }: { className?: string }) {
    const [data, setData] = useState<CategoryData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_BASE}/category-spend`)
            .then((res) => res.json())
            .then((apiData: CategoryData[]) => {
                setData(apiData);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching category spend:", error);
                setLoading(false);
            });
    }, []);

    if (loading || data.length === 0) {
        return (
            <Card className={`p-6 ${className || ""}`}>
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Spend by Category
                    </h3>
                    <p className="text-sm text-gray-600">
                        Distribution of spending across different categories.
                    </p>
                </div>
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">Loading chart data...</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className={`p-6 ${className || ""}`}>
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Spend by Category
                </h3>
                <p className="text-sm text-gray-600">
                    Distribution of spending across different categories.
                </p>
            </div>

            {/* Pie Chart */}
            <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="spend"
                            nameKey="category"
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Legend below chart */}
            <div className="mt-6 space-y-3">
                {data.map((item, index) => (
                    <div key={item.category} className="flex items-center gap-3">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm text-gray-600">{item.category}</span>
                        <span className="ml-auto text-sm font-semibold text-gray-900">
              ${item.spend.toLocaleString('en-US', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                        })}
            </span>
                    </div>
                ))}
            </div>
        </Card>
    );
}