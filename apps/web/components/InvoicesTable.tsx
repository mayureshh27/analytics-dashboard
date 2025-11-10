"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@repo/ui/button";

type Invoice = {
  id: string;
  invoiceId: string;
  invoiceTotal: number;
  vendor: { name: string };
  createdAt: string;
  status: string;
};

export function InvoicesTable({ className }: { className?: string }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof Invoice | 'vendor.name'; direction: 'ascending' | 'descending' } | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/invoices`)
      .then((res) => res.json())
      .then((data) => setInvoices(data.map((d: any) => ({...d, createdAt: new Date(d.createdAt).toLocaleDateString(), status: d.status ?? 'Paid' }))));
  }, []);

  const sortedInvoices = useMemo(() => {
    let sortableItems = [...invoices];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = sortConfig.key === 'vendor.name' ? a.vendor.name : a[sortConfig.key];
        const bValue = sortConfig.key === 'vendor.name' ? b.vendor.name : b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [invoices, sortConfig]);

  const filteredInvoices = sortedInvoices.filter((invoice) =>
    invoice.vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.invoiceId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const requestSort = (key: keyof Invoice | 'vendor.name') => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = filteredInvoices.slice(firstItemIndex, lastItemIndex);
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Invoices by Vendor</CardTitle>
        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('vendor.name')}>
                    Vendor
                    <ArrowUpDown className="w-4 h-4 ml-2" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('createdAt')}>
                    Date
                    <ArrowUpDown className="w-4 h-4 ml-2" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('invoiceId')}>
                    Invoice Number
                    <ArrowUpDown className="w-4 h-4 ml-2" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('invoiceTotal')}>
                    Amount
                    <ArrowUpDown className="w-4 h-4 ml-2" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('status')}>
                    Status
                    <ArrowUpDown className="w-4 h-4 ml-2" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((invoice, index) => (
                <TableRow key={invoice.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                  <TableCell className="py-4">{invoice.vendor?.name ?? 'N/A'}</TableCell>
                  <TableCell className="py-4">{invoice.createdAt}</TableCell>
                  <TableCell className="py-4">{invoice.invoiceId ?? 'N/A'}</TableCell>
                  <TableCell className="py-4">€{invoice.invoiceTotal?.toLocaleString() ?? 'N/A'}</TableCell>
                  <TableCell className="py-4">{invoice.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
