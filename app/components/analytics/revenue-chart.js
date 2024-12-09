'use client'

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export function RevenueChart({ data }) {
  // Convert data object to array format for Recharts
  const chartData = Object.entries(data || {}).map(([date, revenue]) => ({
    date,
    revenue: revenue || 0
  })).sort((a, b) => new Date(a.date) - new Date(b.date));

  if (chartData.length === 0) {
    return (
      <div className="flex h-[350px] items-center justify-center text-muted-foreground">
        No revenue data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={chartData}>
        <XAxis 
          dataKey="date" 
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#8884d8"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
} 