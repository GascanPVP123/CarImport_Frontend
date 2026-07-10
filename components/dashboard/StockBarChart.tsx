"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface StockBarChartProps {
  data: Array<{
    nombre: string;
    stock: number;
    stockMinimo: number;
  }>;
}

export function StockBarChart({ data }: StockBarChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Stock por Producto</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="nombre"
              tick={{ fontSize: 11 }}
              tickFormatter={(value) =>
                value.length > 12 ? `${value.substring(0, 12)}...` : value
              }
            />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="stock" fill="#1e3a5f" radius={[4, 4, 0, 0]} name="Stock" />
            <Bar dataKey="stockMinimo" fill="#ef4444" radius={[4, 4, 0, 0]} name="Stock Mínimo" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}