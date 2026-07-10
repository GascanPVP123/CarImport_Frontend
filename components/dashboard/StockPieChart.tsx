"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface StockPieChartProps {
  stockNormal: number;
  stockBajo: number;
}

const COLORS = ["#10b981", "#ef4444"];

export function StockPieChart({ stockNormal, stockBajo }: StockPieChartProps) {
  const data = [
    { name: "Stock Normal", value: stockNormal },
    { name: "Stock Bajo", value: stockBajo },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Estado del Inventario</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) =>
                `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
              }
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}