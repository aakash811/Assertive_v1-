"use client";

import { ResponsiveContainer, PieChart, Pie, Tooltip, Legend } from "recharts";

type Props = {
  data: {
    name: string;
    value: number;
  }[];
};

export function StatusPieChart({ data }: Props) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <h2 className="mb-4 text-lg font-semibold">Status Distribution</h2>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            label
          />

          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
