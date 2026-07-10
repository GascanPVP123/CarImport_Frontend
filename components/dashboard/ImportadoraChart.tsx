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

interface ImportadoraChartProps {
  data: Array<{
    nombre: string;
    totalProductos: number;
  }>;
}

export function ImportadoraChart({ data }: ImportadoraChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Productos por Importadora</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 100 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="nombre"
              tick={{ fontSize: 11 }}
              width={95}
            />
            <Tooltip />
            <Bar dataKey="totalProductos" fill="#1e3a5f" radius={[0, 4, 4, 0]} name="Productos" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}