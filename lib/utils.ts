import { Expense, Category } from "./types";
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), "MMM d, yyyy");
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function filterExpenses(
  expenses: Expense[],
  opts: {
    search?: string;
    category?: Category | "All";
    startDate?: string;
    endDate?: string;
  }
): Expense[] {
  return expenses.filter((e) => {
    if (opts.search) {
      const q = opts.search.toLowerCase();
      if (
        !e.description.toLowerCase().includes(q) &&
        !e.category.toLowerCase().includes(q)
      )
        return false;
    }
    if (opts.category && opts.category !== "All" && e.category !== opts.category)
      return false;
    if (opts.startDate && opts.endDate) {
      const date = parseISO(e.date);
      if (
        !isWithinInterval(date, {
          start: parseISO(opts.startDate),
          end: parseISO(opts.endDate),
        })
      )
        return false;
    }
    return true;
  });
}

export function totalAmount(expenses: Expense[]): number {
  return expenses.reduce((s, e) => s + e.amount, 0);
}

export function currentMonthExpenses(expenses: Expense[]): Expense[] {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);
  return expenses.filter((e) =>
    isWithinInterval(parseISO(e.date), { start, end })
  );
}

export function topCategory(expenses: Expense[]): { category: Category; amount: number } | null {
  if (!expenses.length) return null;
  const totals = expenses.reduce<Partial<Record<Category, number>>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount;
    return acc;
  }, {});
  const [category, amount] = Object.entries(totals).sort((a, b) => b[1]! - a[1]!)[0];
  return { category: category as Category, amount: amount! };
}

export function categoryBreakdown(
  expenses: Expense[]
): { category: Category; amount: number; count: number }[] {
  const map = expenses.reduce<Partial<Record<Category, { amount: number; count: number }>>>(
    (acc, e) => {
      if (!acc[e.category]) acc[e.category] = { amount: 0, count: 0 };
      acc[e.category]!.amount += e.amount;
      acc[e.category]!.count += 1;
      return acc;
    },
    {}
  );
  return Object.entries(map)
    .map(([cat, val]) => ({ category: cat as Category, ...val! }))
    .sort((a, b) => b.amount - a.amount);
}

export function last6MonthsData(expenses: Expense[]): { month: string; total: number }[] {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const start = startOfMonth(d);
    const end = endOfMonth(d);
    const total = expenses
      .filter((e) => isWithinInterval(parseISO(e.date), { start, end }))
      .reduce((s, e) => s + e.amount, 0);
    return { month: format(d, "MMM yy"), total };
  });
}

export function exportToCSV(expenses: Expense[]): void {
  const header = ["Date", "Category", "Amount", "Description"];
  const rows = expenses.map((e) => [
    e.date,
    e.category,
    e.amount.toFixed(2),
    `"${e.description.replace(/"/g, '""')}"`,
  ]);
  const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `expenses-${format(new Date(), "yyyy-MM-dd")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
