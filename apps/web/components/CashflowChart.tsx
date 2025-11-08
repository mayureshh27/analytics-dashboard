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

export function CashflowChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/cash-outflow`)
      .then((res) => res.json())
      .then((data) => {
        const monthlyData = data.reduce((acc: { [key: string]: { month: string; amount: number } }, item: { date: string; amount: number }) => {
            const date = new Date(item.date);
            const month = date.toLocaleString('default', { month: 'short' });
            if (!acc[month]) {
                acc[month] = { month, amount: 0 };
            }
            acc[month].amount += item.amount;
            return acc;
        }, {});
        setData(Object.values(monthlyData));
      });
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash Outflow Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="amount" fill="#8884d8" name="Amount" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
