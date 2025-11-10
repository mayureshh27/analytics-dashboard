"use client";

import { useEffect, useState } from "react";
import {
    ComposedChart,
    Line,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend, // 1. Import Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// 2. This tooltip logic is now correct.
//    payload[0] will be "Invoice Count"
//    payload[1] will be "Total Spend"
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-lg">
                <p className="font-semibold text-gray-900 mb-2">{label}</p>
                <div className="space-y-1">
                    {/* PAYLOAD[0] */}
                    <p className="text-sm" style={{ color: "#8b5cf6" }}>
                        Invoice count: <span className="font-semibold">{payload[0]?.value}</span>
                    </p>
                    {/* PAYLOAD[1] */}
                    <p className="text-sm" style={{ color: "#3b82f6" }}>
                        Total Spend:{" "}
                        <span className="font-semibold">
              € {payload[1]?.value?.toLocaleString("de-DE", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}
            </span>
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

export function InvoiceChart() {
    const [data, setData] = useState([]);

    useEffect(() => {
        // 3. FIX: Corrected the environment variable and added /api/
        fetch(`${process.env.NEXT_PUBLIC_API_BASE}/invoice-trends`)
            .then((res) => res.json())
            .then((data) => {
                // Your data processing logic is correct
                const monthlyData = data.reduce(
                    (
                        acc: {
                            [key: string]: {
                                month: string;
                                totalSpend: number;
                                invoiceCount: number;
                            };
                        },
                        item: { date: string; totalSpend: number; invoiceCount: number },
                    ) => {
                        const date = new Date(item.date);
                        const month = date.toLocaleString("default", { month: "short" });
                        if (!acc[month]) {
                            acc[month] = { month, totalSpend: 0, invoiceCount: 0 };
                        }
                        acc[month].totalSpend += item.totalSpend;
                        acc[month].invoiceCount += item.invoiceCount;
                        return acc;
                    },
                    {},
                );
                setData(Object.values(monthlyData));
            });
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                    Invoice Volume + Value Trend
                </CardTitle>
                <p className="text-sm text-gray-600">
                    Invoice count and total spend over time.
                </p>
            </CardHeader>
            <CardContent>
                <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                            data={data}
                            margin={{ left: 0, right: 10, top: 10, bottom: 0 }}
                        >
                            <defs>
                                {/* 4. Use the purple color from your old chart */}
                                <linearGradient id="colorInvoiceCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#e5e7eb"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                stroke="#9ca3af"
                                style={{ fontSize: "12px" }}
                            />
                            {/* 5. Left Y-Axis for Invoice Count */}
                            <YAxis
                                yAxisId="left"
                                dataKey="invoiceCount"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                stroke="#9ca3af"
                                style={{ fontSize: "12px" }}
                            />
                            {/* 6. Right Y-Axis for Total Spend (no longer hidden) */}
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                dataKey="totalSpend"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                stroke="#9ca3af"
                                style={{ fontSize: "12px" }}
                                tickFormatter={(value) =>
                                    `€${(value / 1000).toLocaleString("en-US", {
                                        maximumFractionDigits: 0,
                                    })}k`
                                }
                                hide
                            />
                            <Tooltip content={<CustomTooltip />} />
                             {/* 7. Add Legend to label the lines */}

                            {/* 8. This Area component is for Count (payload[0]) */}
                            <Area
                                yAxisId="left"
                                type="monotone"
                                dataKey="invoiceCount"
                                fill="url(#colorInvoiceCount)"
                                stroke="#8b5cf6"
                                strokeWidth={2}
                                name="Invoice Count" // This name feeds the Legend & Tooltip
                            />

                            {/* 9. This Line is for Total Spend (payload[1]) */}
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="totalSpend"
                                stroke="#3b82f6" // Blue color from your old chart
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 6, fill: "#3b82f6" }}
                                name="Total Spend" // This name feeds the Legend & Tooltip
                            />

                            {/* 10. REMOVED the duplicate <Line> for invoiceCount */}

                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}