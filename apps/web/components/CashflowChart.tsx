// /mycomponents/CashflowChart.tsx
"use client";

import { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { Card } from "@repo/ui/card";

// Helper function to determine the range based on days
const getRange = (days: number): string => {
    if (days <= 7) return "0 - 7 days";
    if (days <= 30) return "8-30 days";
    if (days <= 60) return "31-60 days";
    return "60+ days";
};

interface RangeData {
    range: string;
    amount: number;
    order: number;
}

// All possible ranges that should always be displayed
const ALL_RANGES: RangeData[] = [
    { range: "0 - 7 days", amount: 0, order: 1 },
    { range: "8-30 days", amount: 0, order: 2 },
    { range: "31-60 days", amount: 0, order: 3 },
    { range: "60+ days", amount: 0, order: 4 },
];

export function CashflowChart() {
    const [data, setData] = useState<RangeData[]>(ALL_RANGES);
    const [loading, setLoading] = useState(true);
    const [totalOutflow, setTotalOutflow] = useState(0);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_BASE}/cash-outflow`)
            .then((res) => res.json())
            .then((apiData: { date: string; amount: number }[]) => {
                // Start with all ranges set to 0
                const rangedData: { [key: string]: RangeData } = { ...ALL_RANGES.reduce((acc, r) => ({ ...acc, [r.range]: { ...r } }), {}) };

                // Populate with actual data
                apiData.forEach((item: { date: string; amount: number }) => {
                    const dueDate = new Date(item.date);
                    const today = new Date();
                    const diffTime = dueDate.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    const range = getRange(diffDays);

                    if (rangedData[range]) {
                        rangedData[range].amount += item.amount;
                    }
                });

                // Convert to array and sort by order
                const sortedData = Object.values(rangedData).sort((a, b) => a.order - b.order);

                // Calculate total
                const total = sortedData.reduce((sum, item) => sum + item.amount, 0);

                setData(sortedData);
                setTotalOutflow(total);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching cash outflow:", error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <Card className="p-6">
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Cash Outflow Forecast
                    </h3>
                    <p className="text-sm text-gray-600">
                        Expected payment obligations grouped by due date ranges.
                    </p>
                </div>
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">Loading chart data...</p>
                </div>
            </Card>
        );
    }

    // Find max value for determining which bars to highlight
    const maxAmount = Math.max(...data.map(d => d.amount));

    return (
        <Card className="p-6">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Cash Outflow Forecast
                </h3>
                <p className="text-sm text-gray-600">
                    Expected payment obligations grouped by due date ranges.
                </p>
            </div>

            {/* Bar Chart */}
            <div className="w-full h-120">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} barCategoryGap="20%" margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e5e7eb"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="range"
                            stroke="#9ca3af"
                            style={{ fontSize: "12px" }}
                            tick={{ fill: "#6b7280" }}
                        />
                        <YAxis
                            stroke="#9ca3af"
                            style={{ fontSize: "12px" }}
                            tick={{ fill: "#6b7280" }}
                            tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#fff",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                                fontSize: "14px"
                            }}
                            formatter={(value: number) => [
                                `€${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                                'Amount'
                            ]}
                        />
                        <Bar
                            dataKey="amount"
                            radius={[8, 8, 0, 0]}
                            minPointSize={0}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.amount > 0 && entry.amount === maxAmount ? "#1e3a8a" : entry.amount > 0 ? "#e5e7eb" : "transparent"}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Total Outflow Summary */}
            <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">Total Outflow</p>
                <p className="text-2xl font-bold text-gray-900">
                    €{totalOutflow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
            </div>
        </Card>
    );
}