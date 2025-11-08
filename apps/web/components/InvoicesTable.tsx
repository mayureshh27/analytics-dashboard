"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";

export function InvoicesTable() {
  const [invoices, setInvoices] = useState<
    {
      id: string;
      invoiceId: string;
      invoiceTotal: number;
      vendor: { name: string };
    }[]
  >([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/invoices`)
      .then((res) => res.json())
      .then((data) => setInvoices(data));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoices by Vendor</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead># Invoices</TableHead>
              <TableHead>Net Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.vendor?.name ?? 'N/A'}</TableCell>
                <TableCell>{invoice.invoiceId ?? 'N/A'}</TableCell>
                <TableCell>€{invoice.invoiceTotal?.toLocaleString() ?? 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
