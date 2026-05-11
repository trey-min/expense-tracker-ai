"use client";

import { useState } from "react";
import { Expense } from "@/lib/types";
import { useExpenses } from "@/hooks/useExpenses";
import Navbar from "@/components/Navbar";
import { exportToCSV } from "@/lib/utils";

interface Props {
  children: (props: {
    expenses: Expense[];
    loaded: boolean;
    addExpense: ReturnType<typeof useExpenses>["addExpense"];
    updateExpense: ReturnType<typeof useExpenses>["updateExpense"];
    deleteExpense: ReturnType<typeof useExpenses>["deleteExpense"];
  }) => React.ReactNode;
}

export default function AppShell({ children }: Props) {
  const { expenses, loaded, addExpense, updateExpense, deleteExpense } = useExpenses();

  return (
    <>
      <Navbar onExport={() => exportToCSV(expenses)} />
      <main className="max-w-5xl mx-auto px-4 py-6">
        {children({ expenses, loaded, addExpense, updateExpense, deleteExpense })}
      </main>
    </>
  );
}
