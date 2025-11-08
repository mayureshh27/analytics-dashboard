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

  return (<>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <OverviewCard
                  title="Total Spend (YTD)"
                  value={`€${stats.totalSpend.toLocaleString()}`}
                  change="+8.2% from last month"
                  icon={DollarSign}
              />
              <OverviewCard
                  title="Total Invoices Processed"
                  value={stats.totalInvoices.toString()}
                  change="+8.2% from last month"
                  icon={CreditCard}
              />
              <OverviewCard
                  title="Documents Uploaded"
                  value={stats.documentsUploaded.toString()}
                  change="-8 less from last month"
                  icon={Upload}
              />
              <OverviewCard
                  title="Average Invoice Value"
                  value={`€${stats.averageInvoiceValue.toLocaleString()}`}
                  change="+8.2% from last month"
                  icon={TrendingUp}
              />
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
              <InvoiceChart />
              <VendorChart />
          </div>
          <div className="mt-8">
              <InvoicesTable />
          </div>
      </>

  );
}
