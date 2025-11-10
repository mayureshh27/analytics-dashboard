"use client";

import { useEffect, useState } from "react";
import { OverviewCard } from "@/components/OverviewCard";
import { InvoiceChart } from "@/components/InvoiceChart";
import { VendorChart } from "@/components/VendorChart";
import { CategoryChart } from "@/components/CategoryChart";
import { CashflowChart } from "@/components/CashflowChart";
import { InvoicesTable } from "@/components/InvoicesTable";
import { DollarSign, CreditCard, Upload, TrendingUp } from "lucide-react";

interface StatsData {
    totalSpend: number;
    totalInvoices: number;
    documentsUploaded: number;
    averageInvoiceValue: number;
    totalSpendTrend?: { value: number }[];
    totalInvoicesTrend?: { value: number }[];
    documentsUploadedTrend?: { value: number }[];
    averageInvoiceValueTrend?: { value: number }[];
    totalSpendChange?: string;
    totalInvoicesChange?: string;
    documentsUploadedChange?: string;
    averageInvoiceValueChange?: string;
}

export default function Home() {
    const [stats, setStats] = useState<StatsData>({
        totalSpend: 0,
        totalInvoices: 0,
        documentsUploaded: 0,
        averageInvoiceValue: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE || "";
        fetch(`${apiBase}/stats`)
            .then((res) => res.json())
            .then((data) => {
                setStats(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching stats:", error);
                setLoading(false);
            });
    }, []);

    // Fallback trend data if -not- provided by API
    const defaultTrend = Array.from({ length: 10 }, (_, i) => ({
        value: Math.floor(Math.random() * 100) + 50,
    }));

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-slate-500">Loading...</div>
            </div>
        );
    }

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <OverviewCard
                    title="Total Spend"
                    value={`€ ${stats.totalSpend.toLocaleString("de-DE", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}`}
                    change={stats.totalSpendChange || "+8.2%"}
                    changeLabel="from last month"
                    icon={DollarSign}
                    trendData={stats.totalSpendTrend || defaultTrend}
                />
                <OverviewCard
                    title="Total Invoices Processed"
                    value={stats.totalInvoices.toString()}
                    change={stats.totalInvoicesChange || "+8.2%"}
                    changeLabel="from last month"
                    icon={CreditCard}
                    trendData={stats.totalInvoicesTrend || defaultTrend}
                />
                <OverviewCard
                    title="Documents Uploaded"
                    value={stats.documentsUploaded.toString()}
                    change={stats.documentsUploadedChange || "-8"}
                    changeLabel="less from last month"
                    icon={Upload}
                    trendData={stats.documentsUploadedTrend || defaultTrend}
                />
                <OverviewCard
                    title="Average Invoice Value"
                    value={`€ ${stats.averageInvoiceValue.toLocaleString("de-DE", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}`}
                    change={stats.averageInvoiceValueChange || "+8.2%"}
                    changeLabel="from last month"
                    icon={TrendingUp}
                    trendData={stats.averageInvoiceValueTrend || defaultTrend}
                />
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                <InvoiceChart />
                <VendorChart />
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <CategoryChart />
                <CashflowChart />
                <InvoicesTable className="h-full" />
            </div>
        </>
    );
}