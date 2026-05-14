"use client";

import { useState, useMemo, useEffect } from "react";
import { Expense, Category, CATEGORIES, CATEGORY_BG } from "@/lib/types";
import {
  filterExpenses,
  formatCurrency,
  formatDate,
  exportToCSV,
  exportToJSON,
  exportToPDF,
} from "@/lib/utils";
import { format } from "date-fns";
import {
  X,
  Download,
  FileText,
  FileJson,
  FileType2,
  Loader2,
  Check,
  CalendarRange,
  Tag,
  FileOutput,
} from "lucide-react";

type ExportFormat = "csv" | "json" | "pdf";

interface Props {
  expenses: Expense[];
  isOpen: boolean;
  onClose: () => void;
}

const FORMAT_OPTIONS: {
  id: ExportFormat;
  label: string;
  icon: React.ElementType;
  desc: string;
}[] = [
  { id: "csv", label: "CSV", icon: FileText, desc: "Spreadsheet & Excel" },
  { id: "json", label: "JSON", icon: FileJson, desc: "Developer friendly" },
  { id: "pdf", label: "PDF", icon: FileType2, desc: "Print & share" },
];

export default function ExportModal({ expenses, isOpen, onClose }: Props) {
  const today = format(new Date(), "yyyy-MM-dd");

  const [exportFormat, setExportFormat] = useState<ExportFormat>("csv");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Set<Category>>(
    new Set(CATEGORIES)
  );
  const [filename, setFilename] = useState(`expenses-${today}`);
  const [isExporting, setIsExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setExportFormat("csv");
      setStartDate("");
      setEndDate("");
      setSelectedCategories(new Set(CATEGORIES));
      setFilename(`expenses-${today}`);
      setIsExporting(false);
      setExportDone(false);
    }
  }, [isOpen, today]);

  const filteredExpenses = useMemo(() => {
    return filterExpenses(expenses, { startDate, endDate }).filter((e) =>
      selectedCategories.has(e.category)
    );
  }, [expenses, startDate, endDate, selectedCategories]);

  const totalAmount = useMemo(
    () => filteredExpenses.reduce((s, e) => s + e.amount, 0),
    [filteredExpenses]
  );

  const previewRows = filteredExpenses.slice(0, 5);
  const hiddenCount = filteredExpenses.length - previewRows.length;

  function toggleCategory(cat: Category) {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  }

  function toggleAllCategories() {
    setSelectedCategories(
      selectedCategories.size === CATEGORIES.length
        ? new Set()
        : new Set(CATEGORIES)
    );
  }

  async function handleExport() {
    if (filteredExpenses.length === 0) return;
    setIsExporting(true);

    await new Promise((r) => setTimeout(r, 650));

    const name = filename.trim() || `expenses-${today}`;
    if (exportFormat === "csv") exportToCSV(filteredExpenses, name);
    else if (exportFormat === "json") exportToJSON(filteredExpenses, name);
    else exportToPDF(filteredExpenses, name);

    setIsExporting(false);
    setExportDone(true);
    setTimeout(() => {
      setExportDone(false);
      onClose();
    }, 1400);
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full sm:max-w-2xl bg-white sm:rounded-2xl shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[88vh] rounded-t-2xl">
        {/* Drag handle on mobile */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
              <FileOutput size={17} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Export Data
              </h2>
              <p className="text-xs text-gray-400 mt-px">
                Configure filters, format, and download
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 sm:px-6 py-5 space-y-5">
          {/* Format selector */}
          <section>
            <SectionLabel icon={Download}>Export Format</SectionLabel>
            <div className="grid grid-cols-3 gap-2.5 mt-2">
              {FORMAT_OPTIONS.map(({ id, label, icon: Icon, desc }) => (
                <button
                  key={id}
                  onClick={() => setExportFormat(id)}
                  className={`flex flex-col items-start gap-1.5 p-3 rounded-xl border-2 transition-all text-left ${
                    exportFormat === id
                      ? "border-indigo-500 bg-indigo-50/70"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Icon
                      size={14}
                      className={
                        exportFormat === id ? "text-indigo-600" : "text-gray-400"
                      }
                    />
                    <span
                      className={`text-sm font-semibold ${
                        exportFormat === id ? "text-indigo-700" : "text-gray-700"
                      }`}
                    >
                      {label}
                    </span>
                    {exportFormat === id && (
                      <Check size={11} className="text-indigo-500 ml-auto" />
                    )}
                  </div>
                  <span className="text-xs text-gray-400 leading-tight">
                    {desc}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Date range */}
          <section>
            <SectionLabel icon={CalendarRange}>Date Range</SectionLabel>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <p className="text-xs text-gray-400 mb-1.5">From</p>
                <input
                  type="date"
                  value={startDate}
                  max={endDate || undefined}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1.5">To</p>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                />
              </div>
            </div>
            {(startDate || endDate) && !(startDate && endDate) && (
              <p className="text-xs text-amber-600 mt-1.5">
                Set both dates to enable date filtering.
              </p>
            )}
          </section>

          {/* Categories */}
          <section>
            <div className="flex items-center justify-between">
              <SectionLabel icon={Tag}>Categories</SectionLabel>
              <button
                onClick={toggleAllCategories}
                className="text-xs text-indigo-600 hover:underline underline-offset-2"
              >
                {selectedCategories.size === CATEGORIES.length
                  ? "Deselect all"
                  : "Select all"}
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${
                    selectedCategories.has(cat)
                      ? `${CATEGORY_BG[cat]} border-transparent`
                      : "border-gray-200 text-gray-400 bg-white hover:border-gray-300"
                  }`}
                >
                  {selectedCategories.has(cat) && (
                    <Check size={10} strokeWidth={3} />
                  )}
                  {cat}
                </button>
              ))}
            </div>
          </section>

          {/* Filename */}
          <section>
            <SectionLabel icon={FileText}>Filename</SectionLabel>
            <div className="flex items-stretch mt-2 rounded-lg border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 bg-gray-50 transition-shadow">
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="flex-1 text-sm px-3 py-2 bg-transparent focus:outline-none text-gray-800 min-w-0"
                placeholder={`expenses-${today}`}
              />
              <span className="flex items-center px-3 text-sm text-gray-500 bg-gray-100 border-l border-gray-200 shrink-0 font-mono">
                .{exportFormat}
              </span>
            </div>
          </section>

          {/* Preview */}
          <section>
            <div className="flex items-center justify-between">
              <SectionLabel icon={FileOutput}>Preview</SectionLabel>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  filteredExpenses.length > 0
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {filteredExpenses.length} record
                {filteredExpenses.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="mt-2">
              {filteredExpenses.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center">
                  <p className="text-sm text-gray-400">
                    No records match your filters
                  </p>
                  <p className="text-xs text-gray-300 mt-1">
                    Try adjusting the date range or selecting more categories
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          {["Date", "Category", "Amount", "Description"].map(
                            (h) => (
                              <th
                                key={h}
                                className="text-left px-3 py-2.5 font-semibold text-gray-500 whitespace-nowrap"
                              >
                                {h}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {previewRows.map((e) => (
                          <tr key={e.id} className="hover:bg-gray-50/60">
                            <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">
                              {formatDate(e.date)}
                            </td>
                            <td className="px-3 py-2.5">
                              <span
                                className={`px-1.5 py-0.5 rounded-full font-medium ${CATEGORY_BG[e.category]}`}
                              >
                                {e.category}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 font-semibold text-gray-800 whitespace-nowrap">
                              {formatCurrency(e.amount)}
                            </td>
                            <td className="px-3 py-2.5 text-gray-500 max-w-[160px] truncate">
                              {e.description}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {hiddenCount > 0 && (
                    <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 text-center">
                      +{hiddenCount} more record
                      {hiddenCount !== 1 ? "s" : ""} not shown
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between gap-3 shrink-0">
          <div className="text-sm">
            {filteredExpenses.length > 0 ? (
              <span className="text-gray-600">
                <span className="font-semibold text-gray-900">
                  {filteredExpenses.length}
                </span>{" "}
                record{filteredExpenses.length !== 1 ? "s" : ""}
                <span className="text-gray-400 mx-1.5">·</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(totalAmount)}
                </span>{" "}
                total
              </span>
            ) : (
              <span className="text-gray-400 text-xs">No records to export</span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onClose}
              className="text-sm px-4 py-2 text-gray-600 hover:bg-gray-200/60 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={
                filteredExpenses.length === 0 || isExporting || exportDone
              }
              className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg font-medium transition-all min-w-[140px] justify-center ${
                exportDone
                  ? "bg-emerald-500 text-white"
                  : filteredExpenses.length === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200"
              }`}
            >
              {isExporting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Exporting…
                </>
              ) : exportDone ? (
                <>
                  <Check size={14} />
                  Done!
                </>
              ) : (
                <>
                  <Download size={14} />
                  Export {filteredExpenses.length} Record
                  {filteredExpenses.length !== 1 ? "s" : ""}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon size={13} className="text-gray-400" />
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {children}
      </span>
    </div>
  );
}
