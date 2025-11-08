"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";

export function InvoiceChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/invoice-trends`)
      .then((res) => res.json())
      .then((data) => {
        const monthlyData = data.reduce((acc: { [key: string]: { month: string; totalSpend: number; invoiceCount: number } }, item: { date: string; totalSpend: number; invoiceCount: number }) => {
            const date = new Date(item.date);
            const month = date.toLocaleString('default', { month: 'short' });
            if (!acc[month]) {
                acc[month] = { month, totalSpend: 0, invoiceCount: 0 };
            }
            acc[month].totalSpend += item.totalSpend;
            acc[month].invoiceCount += item.invoiceCount;
            return acc;
        }, {});
        setData(Object.values(monthlyData));
      });
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Volume + Value Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="invoiceCount"
              stroke="#8884d8"
              name="Invoice Count"
            />
            <Line
              type="monotone"
              dataKey="totalSpend"
              stroke="#82ca9d"
              name="Total Spend"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
