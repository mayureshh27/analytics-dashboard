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
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-4 bg-white border rounded-lg shadow-lg">
        <p className="font-bold">{label}</p>
        <p style={{ color: '#8b5cf6' }}>{`Total Spend: €${payload[0].value.toLocaleString()}`}</p>
      </div>
    );
  }

  return null;
};

export function VendorChart({ className }: { className?: string }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/vendors/top10`)
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Spend by Vendor (Top 10)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis
              type="category"
              dataKey="name"
              width={200}
              tickFormatter={(value) =>
                value.length > 20 ? `${value.substring(0, 20)}...` : value
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="totalSpend" fill="#8b5cf6" name="Total Spend" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}