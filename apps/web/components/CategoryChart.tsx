// /components/CategoryChart.tsx
"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/card";

// Defined COLORS (Keeping the visual aesthetic)
const COLORS = ["#427eff", "#ff9933", "#ffc87c", "#8884d8", "#82ca9d", "#ffc658", "#a4de6c", "#d0ed57", "#ffc658"];

interface CategoryData {
  category: string;
  spend: number;
}

// Custom render function for the legend (Styles are preserved)
const renderCustomizedLegend = (props: any) => {
  const { payload } = props;

  // The outer ul/li structure is causing the adjacent look in the stacked layout.
  // We need to simplify the legend render for a clean horizontal stack.

  return (
      <div className="flex flex-wrap justify-center mt-4 p-2">
        {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center mx-2 my-1">
              {/* Color dot styling (rounded-full) */}
              <span
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: entry.color }}
              />
              {/* Category name and spend value */}
              <span className="text-sm font-medium text-gray-700 mr-1">
            {entry.payload.category || entry.value}:
          </span>
              <span className="text-sm font-semibold text-gray-900">
            {
              typeof entry.payload.spend === 'number'
                  ? `€${entry.payload.spend.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : 'N/A'
            }
          </span>
            </div>
        ))}
      </div>
  );
};

export function CategoryChart({ className }: { className?: string }) {
  const [data, setData] = useState<CategoryData[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/category-spend`)
        .then((res) => res.json())
        .then((apiData: CategoryData[]) => {
          setData(apiData);
        })
        .catch((error) => console.error("Error fetching category spend:", error));
  }, []);

  if (data.length === 0) {
    return (
        <Card className={className}>
          <CardHeader>
            <CardTitle>Spend by Category</CardTitle>
            <CardDescription>Distribution of spending across different categories.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[250px]">
            <p className="text-gray-500">Loading chart data...</p>
          </CardContent>
        </Card>
    );
  }

  return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Spend by Category</CardTitle>
          <CardDescription>Distribution of spending across different categories.</CardDescription>
        </CardHeader>

        <CardContent className="p-4 h-[300px] flex flex-col items-center justify-center"> {/* Increased height and flex-col for stacking */}
          <div className="flex-grow w-full h-[250px]"> {/* Container for the chart area */}
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                    data={data}
                    // 🛑 FIX 1: Re-center the pie chart horizontally
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="spend"
                    nameKey="category"
                >
                  {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>

                {/* 🛑 FIX 2: Configuration for STACKED (BELOW) layout */}
                <Legend
                    layout="horizontal" // Stacked horizontally
                    verticalAlign="bottom" // Positioned at the bottom of the chart *area*
                    align="center" // Centered horizontally
                    content={renderCustomizedLegend}
                    wrapperStyle={{ paddingTop: 10 }} // Optional: Add a little space above legend
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
  );
}