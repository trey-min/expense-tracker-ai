"use client";

import { Expense, CATEGORY_BG } from "@/lib/types";
import {
  formatCurrency,
  totalAmount,
  currentMonthExpenses,
  topCategory,
} from "@/lib/utils";
import { Wallet, CalendarDays, TrendingUp, Receipt } from "lucide-react";

interface Props {
  expenses: Expense[];
}

export default function SummaryCards({ expenses }: Props) {
  const total = totalAmount(expenses);
  const monthlyExpenses = currentMonthExpenses(expenses);
  const monthly = totalAmount(monthlyExpenses);
  const top = topCategory(expenses);
  const count = expenses.length;

  const cards = [
    {
      label: "Total Spent",
      value: formatCurrency(total),
      sub: `Across ${count} transaction${count !== 1 ? "s" : ""}`,
      icon: Wallet,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "This Month",
      value: formatCurrency(monthly),
      sub: `${monthlyExpenses.length} expense${monthlyExpenses.length !== 1 ? "s" : ""}`,
      icon: CalendarDays,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Top Category",
      value: top ? top.category : "—",
      sub: top ? formatCurrency(top.amount) : "No data yet",
      icon: TrendingUp,
      color: "bg-orange-50 text-orange-600",
      badge: top ? CATEGORY_BG[top.category] : undefined,
    },
    {
      label: "Avg per Expense",
      value: count ? formatCurrency(total / count) : "—",
      sub: "Per transaction",
      icon: Receipt,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, sub, icon: Icon, color, badge }) => (
        <div
          key={label}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3"
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
            <Icon size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
            {badge ? (
              <span className={`inline-block mt-1 text-sm font-semibold px-2 py-0.5 rounded-full ${badge}`}>
                {value}
              </span>
            ) : (
              <p className="text-xl font-bold text-gray-900 mt-0.5 truncate">{value}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
