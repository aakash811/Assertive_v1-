"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { EmptyState, SectionCard } from "@/components/common/ui";

type Props = {
  data: {
    name: string;
    value: number;
  }[];
};

export function StatusPieChart({ data }: Props) {
  const filtered = data.filter((item) => Number.isFinite(item.value));

  if (!filtered.length) {
    return (
      <EmptyState
        title="No status data"
        description="Status distribution will appear after test results are available."
      />
    );
  }

  return (
    <SectionCard title="Status Distribution" className="lg:col-span-2">
      <div className="p-4">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={filtered}
              dataKey="value"
              nameKey="name"
              outerRadius={96}
              innerRadius={54}
              paddingAngle={2}
            >
              {filtered.map((item) => (
                <Cell key={item.name} fill={colorForStatus(item.name)} />
              ))}
            </Pie>

            <Tooltip
              contentStyle={{
                borderColor: "#e5e7eb",
                borderRadius: 8,
                boxShadow: "none",
                fontSize: 12,
              }}
            />
            <Legend iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}

function colorForStatus(name: string) {
  const normalized = name.toUpperCase();

  if (normalized.includes("FAIL")) {
    return "#dc2626";
  }

  if (normalized.includes("PASS")) {
    return "#2563eb";
  }

  return "#9ca3af";
}
