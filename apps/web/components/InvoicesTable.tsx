"use client";

import { useEffect, useState, useMemo } from "react";
import { ChevronUp, ChevronDown, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Invoice = {
  id: string;
  invoiceId: string;
  invoiceTotal: number;
  vendor: { name: string };
  createdAt: string;
  status: string;
};

type SortField = "vendor" | "date" | "invoiceId" | "invoiceTotal" | "status";

export function InvoicesTable() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || "";
    fetch(`${apiBase}/invoices`)
        .then((res) => res.json())
        .then((data) => {
          const formattedData = data.map((d: any) => ({
            ...d,
            createdAt: new Date(d.createdAt).toLocaleDateString(),
            status: d.status ?? "Paid",
          }));
          setInvoices(formattedData);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching invoices:", error);
          setLoading(false);
        });
  }, []);

  const filteredAndSorted = useMemo(() => {
    const filtered = invoices.filter(
        (invoice) =>
            invoice.vendor?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            invoice.invoiceId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            invoice.status?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortField) {
        case "vendor":
          aVal = a.vendor?.name || "";
          bVal = b.vendor?.name || "";
          break;
        case "date":
          aVal = a.createdAt;
          bVal = b.createdAt;
          break;
        case "invoiceId":
          aVal = a.invoiceId || "";
          bVal = b.invoiceId || "";
          break;
        case "invoiceTotal":
          aVal = a.invoiceTotal || 0;
          bVal = b.invoiceTotal || 0;
          break;
        case "status":
          aVal = a.status || "";
          bVal = b.status || "";
          break;
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [invoices, searchQuery, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || "";
    switch (s) {
      case "paid":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300";
      case "overdue":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
      default:
        return "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300";
    }
  };

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => (
      <button
          onClick={() => handleSort(field)}
          className="flex items-center gap-1 font-semibold text-slate-900 dark:text-white hover:text-slate-700 dark:hover:text-slate-200 transition"
      >
        {label}
        {sortField === field ? (
            sortDirection === "asc" ? (
                <ChevronUp className="w-4 h-4" />
            ) : (
                <ChevronDown className="w-4 h-4" />
            )
        ) : (
            <div className="w-4 h-4 opacity-30">
              <ChevronDown className="w-4 h-4" />
            </div>
        )}
      </button>
  );

  if (loading) {
    return (
        <Card className="p-4 bg-white dark:bg-slate-800">
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            Loading invoices...
          </div>
        </Card>
    );
  }

  return (
      <Card className="p-4 bg-white dark:bg-slate-800">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
            Invoices by Vendor
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Top vendors by invoice count and net value.
          </p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
                placeholder="Search by vendor, invoice number, or status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 h-9 text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 sticky top-0 z-10">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-2.5 px-3">
                  <SortHeader field="vendor" label="Vendor" />
                </th>
                <th className="text-left py-2.5 px-3">
                  <SortHeader field="date" label="# Invoices" />
                </th>
                <th className="text-left py-2.5 px-3">
                  <SortHeader field="invoiceId" label="Invoice #" />
                </th>
                <th className="text-right py-2.5 px-3">
                  <SortHeader field="invoiceTotal" label="Amount" />
                </th>
                <th className="text-left py-2.5 px-3">
                  <SortHeader field="status" label="Status" />
                </th>
              </tr>
              </thead>
              <tbody>
              {filteredAndSorted.length > 0 ? (
                  filteredAndSorted.map((invoice) => (
                      <tr
                          key={invoice.id}
                          className="border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
                      >
                        <td className="py-3 px-3">
                          <div className="text-slate-900 dark:text-white font-medium truncate max-w-[200px]">
                            {invoice.vendor?.name || "N/A"}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-slate-900 dark:text-white font-medium truncate">
                            {invoice.createdAt}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-slate-600 dark:text-slate-400 truncate max-w-[150px]">
                            {invoice.invoiceId || "N/A"}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="text-slate-900 dark:text-white font-medium truncate">
                            € {invoice.invoiceTotal?.toLocaleString("de-DE", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }) || "0.00"}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                      <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-semibold capitalize truncate max-w-[100px] ${getStatusColor(invoice.status)}`}
                      >
                        {invoice.status || "N/A"}
                      </span>
                        </td>
                      </tr>
                  ))
              ) : (
                  <tr>
                    <td colSpan={5} className="py-8 px-3 text-center text-slate-500 dark:text-slate-400 text-sm">
                      No invoices found matching your search.
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Showing {filteredAndSorted.length} of {invoices.length} invoices
        </div>
      </Card>
  );
}