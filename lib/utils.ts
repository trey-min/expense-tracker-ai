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

function triggerDownload(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToCSV(expenses: Expense[], filename?: string): void {
  const header = ["Date", "Category", "Amount", "Description"];
  const rows = expenses.map((e) => [
    e.date,
    e.category,
    e.amount.toFixed(2),
    `"${e.description.replace(/"/g, '""')}"`,
  ]);
  const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
  const name = filename ?? `expenses-${format(new Date(), "yyyy-MM-dd")}`;
  triggerDownload(csv, `${name}.csv`, "text/csv");
}

export function exportToJSON(expenses: Expense[], filename: string): void {
  const data = expenses.map((e) => ({
    date: e.date,
    category: e.category,
    amount: e.amount,
    description: e.description,
  }));
  triggerDownload(JSON.stringify(data, null, 2), `${filename}.json`, "application/json");
}

export function exportToPDF(expenses: Expense[], filename: string): void {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const rows = expenses
    .map(
      (e) => `<tr>
        <td>${e.date}</td><td>${e.category}</td>
        <td>$${e.amount.toFixed(2)}</td>
        <td>${e.description.replace(/</g, "&lt;")}</td>
      </tr>`
    )
    .join("");
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${filename}</title>
<style>
  body{font-family:system-ui,sans-serif;color:#111827;padding:40px;font-size:13px}
  h1{font-size:18px;margin:0 0 4px}
  .meta{color:#6b7280;margin:0 0 24px}
  table{width:100%;border-collapse:collapse}
  th{background:#f3f4f6;text-align:left;padding:8px 12px;font-weight:600;border-bottom:2px solid #e5e7eb}
  td{padding:8px 12px;border-bottom:1px solid #f3f4f6}
  .footer{margin-top:16px;text-align:right}
  @media print{body{padding:20px}}
</style></head><body>
  <h1>Expense Report</h1>
  <p class="meta">${filename} &middot; ${expenses.length} record${expenses.length !== 1 ? "s" : ""} &middot; ${new Date().toLocaleDateString()}</p>
  <table><thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>Description</th></tr></thead>
  <tbody>${rows}</tbody></table>
  <div class="footer">Total: <strong>$${total.toFixed(2)}</strong></div>
  <script>window.onload=()=>{window.print()}</script>
</body></html>`;
  const win = window.open("", "_blank");
  if (win) { win.document.write(html); win.document.close(); }
}
