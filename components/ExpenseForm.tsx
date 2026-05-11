"use client";

import { useState, useEffect } from "react";
import { Expense, ExpenseFormData, CATEGORIES, Category } from "@/lib/types";
import { todayString } from "@/hooks/useExpenses";
import { X, Plus, Save } from "lucide-react";

interface Props {
  onSubmit: (data: ExpenseFormData) => void;
  onCancel?: () => void;
  editingExpense?: Expense | null;
}

const EMPTY: ExpenseFormData = {
  date: "",
  amount: "",
  category: "Food",
  description: "",
};

export default function ExpenseForm({ onSubmit, onCancel, editingExpense }: Props) {
  const [form, setForm] = useState<ExpenseFormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof ExpenseFormData, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (editingExpense) {
      setForm({
        date: editingExpense.date,
        amount: editingExpense.amount.toString(),
        category: editingExpense.category,
        description: editingExpense.description,
      });
    } else {
      setForm({ ...EMPTY, date: todayString() });
    }
    setErrors({});
    setSubmitted(false);
  }, [editingExpense]);

  function validate(f: ExpenseFormData): Partial<Record<keyof ExpenseFormData, string>> {
    const e: Partial<Record<keyof ExpenseFormData, string>> = {};
    if (!f.date) e.date = "Date is required";
    if (!f.amount || isNaN(Number(f.amount)) || Number(f.amount) <= 0)
      e.amount = "Enter a valid positive amount";
    if (Number(f.amount) > 1_000_000) e.amount = "Amount seems too large";
    if (!f.description.trim()) e.description = "Description is required";
    if (f.description.trim().length > 120) e.description = "Keep it under 120 characters";
    return e;
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    const next = { ...form, [name]: value };
    setForm(next);
    if (submitted) setErrors(validate(next));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    onSubmit(form);
    if (!editingExpense) {
      setForm({ ...EMPTY, date: todayString() });
      setSubmitted(false);
      setErrors({});
    }
  }

  const isEditing = !!editingExpense;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          {isEditing ? "Edit Expense" : "Add Expense"}
        </h2>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            max={todayString()}
            className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
              errors.date ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"
            }`}
          />
          {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount ($)</label>
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="0.00"
            min="0.01"
            step="0.01"
            className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
              errors.amount ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"
            }`}
          />
          {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
          <input
            type="text"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="What did you spend on?"
            className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
              errors.description ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"
            }`}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-500">{errors.description}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          {isEditing ? <Save size={16} /> : <Plus size={16} />}
          {isEditing ? "Save Changes" : "Add Expense"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-gray-500 hover:text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
