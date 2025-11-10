"use client";

import { useEffect, useState } from "react";
import { Card } from "@repo/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface VendorData {
  name: string;
  totalSpend: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
        <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-1">{label}</p>
          <p className="text-sm" style={{ color: '#8b5cf6' }}>
            Total Spend: €{payload[0].value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
    );
  }
  return null;
};

export function VendorChart({ className }: { className?: string }) {
  const [data, setData] = useState<VendorData[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/vendors/top10`)
        .then((res) => res.json())
        .then((data: VendorData[]) => {
          setData(data);
        })
        .catch((error) => {
          console.error("Error fetching vendor data:", error);
        });
  }, []);

  const globalSupplyVendor = data[5];
  const maxSpend = Math.max(...data.map(d => d.totalSpend), 50000);

  return (
      <Card className={`p-6 ${className}`}>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Spend by Vendor (Top 10)
          </h3>
          <p className="text-sm text-gray-600">
            Vendor spend with cumulative percentage distribution.
          </p>
        </div>

        <div className="w-full h-80 relative">
          {/* Background shadow layer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100 to-gray-200 opacity-30 rounded" />

          <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={data}
                layout="vertical"
                margin={{ left: 20, right: 30, top: 5, bottom: 5 }}
                onMouseMove={(state) => {
                  if (state.isTooltipActive) {
                    setHoveredIndex(state.activeTooltipIndex ?? null);
                  } else {
                    setHoveredIndex(null);
                  }
                }}
                onMouseLeave={() => setHoveredIndex(null)}
            >
              <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  horizontal={false}
              />
              <XAxis
                  type="number"
                  stroke="#9ca3af"
                  style={{ fontSize: "12px" }}
                  tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
              />
              <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#9ca3af"
                  style={{ fontSize: "12px" }}
                  width={100}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar
                  dataKey="totalSpend"
                  fill="#c4b5fd"
                  radius={[0, 4, 4, 0]}
                  background={{ fill: '#f3f4f6', radius: [0, 4, 4, 0] }}
              >
                {data.map((entry, index) => (
                    <Cell
                        key={`cell-${index}`}
                        fill={hoveredIndex === index ? "#1e3a8a" : "#c4b5fd"}
                    />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/*{globalSupplyVendor && (*/}
        {/*    <div className="mt-6 p-4 bg-gray-50 rounded-lg">*/}
        {/*      <p className="font-semibold text-gray-900 mb-3">Global Supply</p>*/}
        {/*      <div className="flex items-center gap-6 text-sm">*/}
        {/*        <div className="min-w-[120px]">*/}
        {/*          <p className="text-gray-600 text-xs mb-1">Vendor Spend:</p>*/}
        {/*          <p className="font-semibold text-blue-600 text-base">*/}
        {/*            € {globalSupplyVendor.totalSpend.toLocaleString('de-DE', {*/}
        {/*            minimumFractionDigits: 2,*/}
        {/*            maximumFractionDigits: 2*/}
        {/*          })}*/}
        {/*          </p>*/}
        {/*        </div>*/}
        {/*        <div className="flex-1 h-2 bg-gray-300 rounded-full overflow-hidden">*/}
        {/*          <div*/}
        {/*              className="h-full bg-gradient-to-r from-gray-400 to-gray-300 rounded-full"*/}
        {/*              style={{ width: `${(globalSupplyVendor.totalSpend / maxSpend) * 100}%` }}*/}
        {/*          />*/}
        {/*        </div>*/}
        {/*        <p className="text-gray-500 text-xs whitespace-nowrap">*/}
        {/*          €0k €15k €30k €45k*/}
        {/*        </p>*/}
        {/*      </div>*/}
        {/*    </div>*/}
        {/*)}*/}
      </Card>
  );
}