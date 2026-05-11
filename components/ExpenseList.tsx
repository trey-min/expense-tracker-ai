"use client";

import { useState } from "react";
import { Expense, Category, CATEGORIES, CATEGORY_BG } from "@/lib/types";
import { formatCurrency, formatDate, filterExpenses } from "@/lib/utils";
import { Pencil, Trash2, Search, ChevronDown, SlidersHorizontal } from "lucide-react";

interface Props {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export default function ExpenseList({ expenses, onEdit, onDelete }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category | "All">("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");

  const filtered = filterExpenses(expenses, { search, category, startDate, endDate }).sort(
    (a, b) =>
      sortDir === "desc"
        ? new Date(b.date).getTime() - new Date(a.date).getTime()
        : new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  function clearFilters() {
    setSearch("");
    setCategory("All");
    setStartDate("");
    setEndDate("");
  }

  const hasFilters = search || category !== "All" || startDate || endDate;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-100 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search expenses…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border transition-colors ${
              showFilters || hasFilters
                ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                : "border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}
          >
            <SlidersHorizontal size={15} />
            Filters
            {hasFilters && (
              <span className="ml-1 bg-indigo-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                !
              </span>
            )}
          </button>
          <button
            onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            title="Toggle sort direction"
          >
            <ChevronDown
              size={15}
              className={`transition-transform ${sortDir === "asc" ? "rotate-180" : ""}`}
            />
            Date
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category | "All")}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="From"
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="To"
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-indigo-600 hover:underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-gray-400 text-sm">
          {expenses.length === 0 ? "No expenses yet. Add your first one!" : "No expenses match your filters."}
        </div>
      ) : (
        <ul className="divide-y divide-gray-50">
          {filtered.map((expense) => (
            <li
              key={expense.id}
              className="flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50/60 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {expense.description}
                  </p>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_BG[expense.category]}`}
                  >
                    {expense.category}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(expense.date)}</p>
              </div>

              <span className="text-sm font-semibold text-gray-900 shrink-0">
                {formatCurrency(expense.amount)}
              </span>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={() => onEdit(expense)}
                  className="p-1.5 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors"
                  title="Edit"
                >
                  <Pencil size={14} />
                </button>
                {deleteConfirm === expense.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        onDelete(expense.id);
                        setDeleteConfirm(null);
                      }}
                      className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md transition-colors"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="text-xs text-gray-500 hover:text-gray-700 px-1 py-1"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(expense.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Footer count */}
      {filtered.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
          Showing {filtered.length} of {expenses.length} expense{expenses.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
