"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";

export function VendorChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/vendors/top10`)
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spend by Vendor (Top 10)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" width={100} />
            <Tooltip />
            <Legend />
            <Bar dataKey="totalSpend" fill="#8884d8" name="Total Spend" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
