"use client";

import { useState } from "react";
import { Expense } from "@/lib/types";
import { useExpenses } from "@/hooks/useExpenses";
import Navbar from "@/components/Navbar";
import SummaryCards from "@/components/SummaryCards";
import Charts from "@/components/Charts";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseList from "@/components/ExpenseList";
import ExportModal from "@/components/ExportModal";
import { Plus, X } from "lucide-react";

export default function DashboardClient() {
  const { expenses, loaded, addExpense, updateExpense, deleteExpense } = useExpenses();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  if (!loaded) {
    return (
      <>
        <Navbar onExport={() => setShowExportModal(true)} />
        <main className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <div className="w-8 h-8 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-sm">Loading your expenses…</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar onExport={() => setShowExportModal(true)} />
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Page title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-400 mt-0.5">Your financial overview at a glance</p>
          </div>
          <button
            onClick={() => {
              setShowAddForm((v) => !v);
              setEditingExpense(null);
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {showAddForm ? <X size={16} /> : <Plus size={16} />}
            {showAddForm ? "Close" : "Add Expense"}
          </button>
        </div>

        {/* Add form (inline, collapsible) */}
        {showAddForm && !editingExpense && (
          <ExpenseForm
            onSubmit={(data) => {
              addExpense(data);
              setShowAddForm(false);
            }}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {/* Edit form (modal-like, inline) */}
        {editingExpense && (
          <ExpenseForm
            editingExpense={editingExpense}
            onSubmit={(data) => {
              updateExpense(editingExpense.id, data);
              setEditingExpense(null);
            }}
            onCancel={() => setEditingExpense(null)}
          />
        )}

        {/* Summary cards */}
        <SummaryCards expenses={expenses} />

        {/* Charts */}
        <Charts expenses={expenses} />

        {/* Recent expenses */}
        <div>
          <h2 className="text-base font-semibold text-gray-700 mb-3">Recent Expenses</h2>
          <ExpenseList
            expenses={expenses.slice(0, 8)}
            onEdit={(e) => {
              setEditingExpense(e);
              setShowAddForm(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onDelete={deleteExpense}
          />
        </div>
      </main>

      <ExportModal
        expenses={expenses}
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </>
  );
}
