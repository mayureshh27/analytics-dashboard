"use client";

import { useEffect, useState } from "react";
import { OverviewCard } from "@/components/OverviewCard";
import { InvoiceChart } from "@/components/InvoiceChart";
import { VendorChart } from "@/components/VendorChart";
import { CategoryChart } from "@/components/CategoryChart";
import { CashflowChart } from "@/components/CashflowChart";
import { InvoicesTable } from "@/components/InvoicesTable";
import { DollarSign, CreditCard, Upload, TrendingUp } from "lucide-react";

export default function Home() {
  const [stats, setStats] = useState({
    totalSpend: 0,
    totalInvoices: 0,
    documentsUploaded: 0,
    averageInvoiceValue: 0,
  });

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/stats`)
      .then((res) => res.json())
      .then((data) => setStats(data));
  }, []);

  const generateTrendData = () => {
    return Array.from({ length: 10 }, () => ({
      value: Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000,
    }));
  };

  return (
      <>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <OverviewCard
              title="Total Spend (YTD)"
              value={`€${stats.totalSpend.toLocaleString()}`}
              change="+8.2%"
              icon={DollarSign}
              trendData={generateTrendData()}
          />
          <OverviewCard
              title="Total Invoices Processed"
              value={stats.totalInvoices.toString()}
              change="+8.2%"
              icon={CreditCard}
              trendData={generateTrendData()}
          />
          <OverviewCard
              title="Documents Uploaded"
              value={stats.documentsUploaded.toString()}
              change="-8"
              icon={Upload}
              trendData={generateTrendData()}
          />
          <OverviewCard
              title="Average Invoice Value"
              value={`€${stats.averageInvoiceValue.toLocaleString()}`}
              change="+8.2%"
              icon={TrendingUp}
              trendData={generateTrendData()}
          />
      </div>
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <InvoiceChart className="h-full" />
          <VendorChart className="h-full" />
      </div>
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <CategoryChart className="h-full" />
          <CashflowChart className="h-full" />
          <InvoicesTable className="h-full" />
      </div>
      </>


  );
}
