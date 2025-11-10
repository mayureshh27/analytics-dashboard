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

const getRange = (days: number) => {
  if (days <= 7) return "0 - 7 days";
  if (days <= 30) return "8 - 30 days";
  if (days <= 60) return "31 - 60 days";
  return "60+ days";
};

export function CashflowChart({ className }: { className?: string }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/cash-outflow`)
      .then((res) => res.json())
      .then((data) => {
        const rangedData = data.reduce((acc: { [key: string]: { range: string; amount: number } }, item: { date: string; amount: number }) => {
            const dueDate = new Date(item.date);
            const today = new Date();
            const diffTime = dueDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const range = getRange(diffDays);
            
            if (!acc[range]) {
                acc[range] = { range, amount: 0 };
            }
            acc[range].amount += item.amount;
            return acc;
        }, {});
        setData(Object.values(rangedData));
      });
  }, []);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Cash Outflow Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="range" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="amount" fill="#3b82f6" name="Amount" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}