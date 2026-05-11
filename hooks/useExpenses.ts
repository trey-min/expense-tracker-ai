"use client";

import { useState, useEffect, useCallback } from "react";
import { Expense, ExpenseFormData } from "@/lib/types";
import { loadExpenses, saveExpenses } from "@/lib/storage";
import { generateId } from "@/lib/utils";
import { format } from "date-fns";

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setExpenses(loadExpenses());
    setLoaded(true);
  }, []);

  const persist = useCallback((next: Expense[]) => {
    setExpenses(next);
    saveExpenses(next);
  }, []);

  const addExpense = useCallback(
    (data: ExpenseFormData) => {
      const expense: Expense = {
        id: generateId(),
        date: data.date,
        amount: parseFloat(data.amount),
        category: data.category,
        description: data.description.trim(),
        createdAt: new Date().toISOString(),
      };
      persist([expense, ...expenses]);
      return expense;
    },
    [expenses, persist]
  );

  const updateExpense = useCallback(
    (id: string, data: ExpenseFormData) => {
      persist(
        expenses.map((e) =>
          e.id === id
            ? {
                ...e,
                date: data.date,
                amount: parseFloat(data.amount),
                category: data.category,
                description: data.description.trim(),
              }
            : e
        )
      );
    },
    [expenses, persist]
  );

  const deleteExpense = useCallback(
    (id: string) => {
      persist(expenses.filter((e) => e.id !== id));
    },
    [expenses, persist]
  );

  return { expenses, loaded, addExpense, updateExpense, deleteExpense };
}

export function todayString(): string {
  return format(new Date(), "yyyy-MM-dd");
}
