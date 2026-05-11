"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Expense, CATEGORY_COLORS } from "@/lib/types";
import { last6MonthsData, categoryBreakdown } from "@/lib/utils";

interface Props {
  expenses: Expense[];
}

const USD = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

export default function Charts({ expenses }: Props) {
  const monthData = last6MonthsData(expenses);
  const catData = categoryBreakdown(expenses);

  if (!expenses.length) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-gray-400 text-sm">
        Add some expenses to see your spending charts.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Bar chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Monthly Spending</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthData} barSize={28}>
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => `$${v}`}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              formatter={(v) => [USD(Number(v ?? 0)), "Spent"]}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                fontSize: 13,
                boxShadow: "0 4px 12px rgba(0,0,0,.06)",
              }}
              cursor={{ fill: "#f3f4f6" }}
            />
            <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Spending by Category</h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={catData}
              dataKey="amount"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={40}
            >
              {catData.map((entry) => (
                <Cell
                  key={entry.category}
                  fill={CATEGORY_COLORS[entry.category]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(v) => [USD(Number(v ?? 0)), "Spent"]}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                fontSize: 13,
                boxShadow: "0 4px 12px rgba(0,0,0,.06)",
              }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
