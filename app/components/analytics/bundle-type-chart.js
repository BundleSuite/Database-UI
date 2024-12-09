'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

const COLORS = ['#8884d8', '#82ca9d', '#ffc658']

export function BundleTypeChart({ data }) {
  const chartData = Object.entries(data || {}).map(([type, stats]) => ({
    name: type,
    value: stats.revenue || 0
  }))

  if (chartData.every(item => item.value === 0)) {
    return (
      <div className="flex h-[350px] items-center justify-center text-muted-foreground">
        No bundle type data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )
} 