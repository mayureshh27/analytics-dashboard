"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-4 bg-white border rounded-lg shadow-lg">
        <p className="font-bold">{label}</p>
        <p style={{ color: '#3b82f6' }}>{`Invoice count: ${payload[0].value}`}</p>
        <p style={{ color: '#8b5cf6' }}>{`Total Spend: €${payload[1].value.toLocaleString()}`}</p>
      </div>
    );
  }

  return null;
};

export function InvoiceChart({ className }: { className?: string }) {
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
    <Card className={className}>
      <CardHeader>
        <CardTitle>Invoice Volume + Value Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorInvoiceCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorTotalSpend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="invoiceCount"
              stroke="#3b82f6"
              fillOpacity={1} 
              fill="url(#colorInvoiceCount)"
              name="Invoice Count"
            />
            <Area
              type="monotone"
              dataKey="totalSpend"
              stroke="#8b5cf6"
              fillOpacity={1}
              fill="url(#colorTotalSpend)"
              name="Total Spend"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}