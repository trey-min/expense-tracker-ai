"use client";

import { useState, useEffect, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  startOfQuarter,
  endOfQuarter,
  subMonths,
  addDays,
  nextMonday,
  formatDistanceToNow,
  parseISO,
} from "date-fns";
import {
  X,
  CloudUpload,
  Sparkles,
  Share2,
  RefreshCw,
  Clock,
  FileText,
  Calendar,
  BarChart2,
  Archive,
  PieChart,
  Mail,
  Link2,
  Copy,
  Check,
  CheckCheck,
  Loader2,
  ArrowUpRight,
  Trash2,
  Download,
  QrCode,
  Bell,
  Zap,
  AlertCircle,
} from "lucide-react";
import { Expense } from "@/lib/types";
import { filterExpenses, formatCurrency, exportToCSV, exportToJSON, exportToPDF } from "@/lib/utils";
import {
  useExportHistory,
  type ExportFormat,
  type ExportDestination,
  type IntegrationId,
  type ExportRecord,
  type AutomationConfig,
  type Integration,
} from "@/hooks/useExportHistory";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "templates" | "share" | "automation" | "history";

interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  tag: string;
  tagColor: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  format: ExportFormat;
  getExpenses: (all: Expense[]) => Expense[];
  getDateLabel: () => string;
}

interface IntegrationDef {
  id: IntegrationId;
  name: string;
  description: string;
  badgeBg: string;
  badgeText: string;
  badgeLabel: string;
  fakeAccount: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "templates", label: "Templates", icon: Sparkles },
  { id: "share", label: "Send & Share", icon: Share2 },
  { id: "automation", label: "Automation", icon: RefreshCw },
  { id: "history", label: "History", icon: Clock },
];

function buildTemplates(): ExportTemplate[] {
  const now = new Date();
  return [
    {
      id: "tax",
      name: "Tax Report",
      description: "Full year breakdown organized for tax filing",
      tag: "Tax Season",
      tagColor: "bg-indigo-100 text-indigo-700",
      icon: FileText,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      format: "csv",
      getExpenses: (all) =>
        filterExpenses(all, {
          startDate: format(startOfYear(now), "yyyy-MM-dd"),
          endDate: format(endOfYear(now), "yyyy-MM-dd"),
        }),
      getDateLabel: () => `Jan 1 – Dec 31, ${now.getFullYear()}`,
    },
    {
      id: "monthly",
      name: "Monthly Summary",
      description: "This month's spending overview, print-ready",
      tag: format(now, "MMMM"),
      tagColor: "bg-blue-100 text-blue-700",
      icon: Calendar,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      format: "pdf",
      getExpenses: (all) =>
        filterExpenses(all, {
          startDate: format(startOfMonth(now), "yyyy-MM-dd"),
          endDate: format(endOfMonth(now), "yyyy-MM-dd"),
        }),
      getDateLabel: () => format(now, "MMMM yyyy"),
    },
    {
      id: "category",
      name: "Category Analysis",
      description: "Spending by category over the last 6 months",
      tag: "Analytics",
      tagColor: "bg-purple-100 text-purple-700",
      icon: PieChart,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      format: "json",
      getExpenses: (all) =>
        filterExpenses(all, {
          startDate: format(subMonths(now, 6), "yyyy-MM-dd"),
          endDate: format(now, "yyyy-MM-dd"),
        }),
      getDateLabel: () =>
        `${format(subMonths(now, 6), "MMM d")} – ${format(now, "MMM d, yyyy")}`,
    },
    {
      id: "quarterly",
      name: "Quarter Review",
      description: `Q${Math.ceil((now.getMonth() + 1) / 3)} performance against spending patterns`,
      tag: `Q${Math.ceil((now.getMonth() + 1) / 3)} ${now.getFullYear()}`,
      tagColor: "bg-amber-100 text-amber-700",
      icon: BarChart2,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      format: "csv",
      getExpenses: (all) =>
        filterExpenses(all, {
          startDate: format(startOfQuarter(now), "yyyy-MM-dd"),
          endDate: format(endOfQuarter(now), "yyyy-MM-dd"),
        }),
      getDateLabel: () =>
        `${format(startOfQuarter(now), "MMM d")} – ${format(endOfQuarter(now), "MMM d, yyyy")}`,
    },
    {
      id: "archive",
      name: "Full Archive",
      description: "Every expense ever recorded — complete data export",
      tag: "All Time",
      tagColor: "bg-gray-100 text-gray-600",
      icon: Archive,
      iconBg: "bg-gray-50",
      iconColor: "text-gray-500",
      format: "csv",
      getExpenses: (all) => all,
      getDateLabel: () => "All time",
    },
  ];
}

const INTEGRATIONS: IntegrationDef[] = [
  {
    id: "google-sheets",
    name: "Google Sheets",
    description: "Live sync to a spreadsheet",
    badgeBg: "bg-green-500",
    badgeText: "text-white",
    badgeLabel: "GS",
    fakeAccount: "treyvonmin@gmail.com",
  },
  {
    id: "google-drive",
    name: "Google Drive",
    description: "Save files to My Drive",
    badgeBg: "bg-yellow-400",
    badgeText: "text-white",
    badgeLabel: "GD",
    fakeAccount: "treyvonmin@gmail.com",
  },
  {
    id: "notion",
    name: "Notion",
    description: "Push to a Notion database",
    badgeBg: "bg-gray-900",
    badgeText: "text-white",
    badgeLabel: "N",
    fakeAccount: "treyvon",
  },
  {
    id: "dropbox",
    name: "Dropbox",
    description: "Backup to Dropbox folder",
    badgeBg: "bg-blue-500",
    badgeText: "text-white",
    badgeLabel: "DB",
    fakeAccount: "treyvonmin@gmail.com",
  },
  {
    id: "onedrive",
    name: "OneDrive",
    description: "Sync to Microsoft OneDrive",
    badgeBg: "bg-sky-500",
    badgeText: "text-white",
    badgeLabel: "OD",
    fakeAccount: "treyvonmin@outlook.com",
  },
];

function generateShareToken(expenses: Expense[]): string {
  const total = Math.floor(expenses.reduce((s, e) => s + e.amount, 0));
  const seed = (total * 31 + expenses.length * 97) % 16777215;
  return seed.toString(16).padStart(6, "0").toUpperCase();
}

function estimateSize(count: number, fmt: ExportFormat): string {
  const bytes = count * (fmt === "json" ? 130 : fmt === "pdf" ? 400 : 65);
  return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
}

function nextRunLabel(freq: AutomationConfig["frequency"]): string {
  const now = new Date();
  if (freq === "daily") return format(addDays(now, 1), "MMM d 'at' 9:00 am");
  if (freq === "weekly") return format(nextMonday(now), "EEE, MMM d 'at' 9:00 am");
  const first = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return format(first, "MMM d, yyyy 'at' 9:00 am");
}

// ─── Main Component ────────────────────────────────────────────────────────────

interface Props {
  expenses: Expense[];
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportHub({ expenses, isOpen, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("templates");
  const {
    history,
    addRecord,
    clearHistory,
    integrations,
    connectIntegration,
    disconnectIntegration,
    automation,
    saveAutomation,
  } = useExportHistory();

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  return (
    <div className={`fixed inset-0 z-50 ${!isOpen && "pointer-events-none"}`}>
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        className={`absolute right-0 top-0 h-full w-full sm:max-w-[500px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
              <CloudUpload size={17} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Export Hub</h2>
              <p className="text-xs text-gray-400 mt-px flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                {history.length} export{history.length !== 1 ? "s" : ""} in history
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-2 shrink-0">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-3 border-b-2 transition-colors ${
                activeTab === id
                  ? "border-indigo-600 text-indigo-700"
                  : "border-transparent text-gray-400 hover:text-gray-700"
              }`}
            >
              <Icon size={13} />
              {label}
              {id === "history" && history.length > 0 && (
                <span className="ml-0.5 bg-gray-200 text-gray-600 text-[10px] font-semibold px-1.5 py-px rounded-full leading-none">
                  {history.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "templates" && (
            <TemplatesPanel expenses={expenses} addRecord={addRecord} />
          )}
          {activeTab === "share" && (
            <SharePanel
              expenses={expenses}
              integrations={integrations}
              onConnect={connectIntegration}
              onDisconnect={disconnectIntegration}
              addRecord={addRecord}
            />
          )}
          {activeTab === "automation" && (
            <AutomationPanel
              automation={automation}
              integrations={integrations}
              onSave={saveAutomation}
            />
          )}
          {activeTab === "history" && (
            <HistoryPanel history={history} onClear={clearHistory} />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Templates Panel ──────────────────────────────────────────────────────────

function TemplatesPanel({
  expenses,
  addRecord,
}: {
  expenses: Expense[];
  addRecord: (r: Omit<ExportRecord, "id" | "timestamp">) => void;
}) {
  const templates = useMemo(() => buildTemplates(), []);
  const [exporting, setExporting] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function handleExport(t: ExportTemplate) {
    const filtered = t.getExpenses(expenses);
    if (filtered.length === 0) return;
    setExporting(t.id);
    await new Promise((r) => setTimeout(r, 700));

    const filename = `${t.id}-${format(new Date(), "yyyy-MM-dd")}`;
    if (t.format === "csv") exportToCSV(filtered, filename);
    else if (t.format === "json") exportToJSON(filtered, filename);
    else exportToPDF(filtered, filename);

    addRecord({
      templateName: t.name,
      format: t.format,
      destination: "download",
      recordCount: filtered.length,
      totalAmount: filtered.reduce((s, e) => s + e.amount, 0),
      status: "success",
    });

    setExporting(null);
    setDone(t.id);
    setTimeout(() => setDone(null), 2000);
  }

  return (
    <div className="p-5 space-y-3">
      <p className="text-xs text-gray-400">
        Pre-configured exports for common use cases. One click to download.
      </p>
      {templates.map((t) => {
        const filtered = t.getExpenses(expenses);
        const isEmpty = filtered.length === 0;
        const isExporting = exporting === t.id;
        const isDone = done === t.id;
        const Icon = t.icon;

        return (
          <div
            key={t.id}
            className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 hover:border-gray-200 bg-white hover:bg-gray-50/50 transition-all group"
          >
            <div className={`w-9 h-9 rounded-xl ${t.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
              <Icon size={16} className={t.iconColor} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-gray-900">{t.name}</span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${t.tagColor}`}>
                  {t.tag}
                </span>
                <span className="text-[10px] font-mono font-medium text-gray-400 uppercase">
                  .{t.format}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{t.description}</p>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-400">
                <span>{t.getDateLabel()}</span>
                <span>·</span>
                <span className={isEmpty ? "text-gray-300" : ""}>
                  {isEmpty ? "no records" : `${filtered.length} records · ${estimateSize(filtered.length, t.format)}`}
                </span>
              </div>
            </div>
            <button
              onClick={() => handleExport(t)}
              disabled={isEmpty || isExporting || isDone}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all shrink-0 mt-0.5 ${
                isDone
                  ? "bg-emerald-50 text-emerald-600"
                  : isEmpty
                  ? "text-gray-300 cursor-not-allowed"
                  : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 group-hover:shadow-sm"
              }`}
            >
              {isExporting ? (
                <Loader2 size={13} className="animate-spin" />
              ) : isDone ? (
                <Check size={13} />
              ) : (
                <Download size={13} />
              )}
              {isExporting ? "Exporting" : isDone ? "Done!" : "Export"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Share Panel ──────────────────────────────────────────────────────────────

function SharePanel({
  expenses,
  integrations,
  onConnect,
  onDisconnect,
  addRecord,
}: {
  expenses: Expense[];
  integrations: Record<IntegrationId, Integration>;
  onConnect: (id: IntegrationId, account: string) => void;
  onDisconnect: (id: IntegrationId) => void;
  addRecord: (r: Omit<ExportRecord, "id" | "timestamp">) => void;
}) {
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [connecting, setConnecting] = useState<IntegrationId | null>(null);
  const [pushing, setPushing] = useState<IntegrationId | null>(null);
  const [pushed, setPushed] = useState<IntegrationId | null>(null);

  const shareUrl = shareToken ? `https://expenseai.io/s/${shareToken}` : null;
  const qrSrc = shareUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(shareUrl)}&color=4338CA&bgcolor=EEF2FF&margin=2`
    : null;

  async function handleEmailSend() {
    if (!email.trim()) return;
    setEmailStatus("sending");
    await new Promise((r) => setTimeout(r, 1500));
    addRecord({
      templateName: "Email Export",
      format: "csv",
      destination: "email",
      recordCount: expenses.length,
      totalAmount: expenses.reduce((s, e) => s + e.amount, 0),
      status: "success",
    });
    setEmailStatus("sent");
    setTimeout(() => setEmailStatus("idle"), 3000);
  }

  function handleGenerateLink() {
    setShareToken(generateShareToken(expenses));
  }

  async function handleCopy() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleConnect(def: IntegrationDef) {
    setConnecting(def.id);
    await new Promise((r) => setTimeout(r, 1600));
    onConnect(def.id, def.fakeAccount);
    setConnecting(null);
  }

  async function handlePush(id: IntegrationId) {
    setPushing(id);
    await new Promise((r) => setTimeout(r, 1400));
    const def = INTEGRATIONS.find((d) => d.id === id)!;
    addRecord({
      templateName: "Cloud Push",
      format: "csv",
      destination: id,
      recordCount: expenses.length,
      totalAmount: expenses.reduce((s, e) => s + e.amount, 0),
      status: "success",
    });
    setPushing(null);
    setPushed(id);
    setTimeout(() => setPushed(null), 2500);
  }

  return (
    <div className="p-5 space-y-6">
      {/* Email */}
      <section>
        <SectionLabel icon={Mail}>Email Export</SectionLabel>
        <div className="mt-2 space-y-2">
          <input
            type="email"
            placeholder="recipient@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleEmailSend}
              disabled={!email.trim() || emailStatus !== "idle"}
              className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg font-medium transition-all ${
                emailStatus === "sent"
                  ? "bg-emerald-50 text-emerald-700"
                  : !email.trim()
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              {emailStatus === "sending" ? (
                <Loader2 size={14} className="animate-spin" />
              ) : emailStatus === "sent" ? (
                <CheckCheck size={14} />
              ) : (
                <Mail size={14} />
              )}
              {emailStatus === "sending"
                ? "Sending…"
                : emailStatus === "sent"
                ? "Email sent!"
                : `Send ${expenses.length} records`}
            </button>
            <span className="text-xs text-gray-400">CSV attachment</span>
          </div>
        </div>
      </section>

      {/* Shareable link + QR */}
      <section>
        <SectionLabel icon={Link2}>Shareable Link</SectionLabel>
        <div className="mt-2 space-y-3">
          {shareUrl ? (
            <>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={shareUrl}
                  className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-600 font-mono"
                />
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg font-medium transition-all shrink-0 ${
                    copied ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>

              {/* QR code */}
              <div className="flex items-center gap-4 p-3 rounded-xl bg-indigo-50/60 border border-indigo-100">
                <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-white flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrSrc!}
                    alt="QR code"
                    width={80}
                    height={80}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold text-indigo-900 flex items-center gap-1.5">
                    <QrCode size={12} /> Scan to open
                  </p>
                  <p className="text-xs text-indigo-500 mt-1">
                    Share this QR code for quick mobile access.
                  </p>
                  <p className="text-[10px] text-indigo-400 mt-2 font-mono">
                    Token: {shareToken}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <button
              onClick={handleGenerateLink}
              className="flex items-center gap-2 text-sm px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-700 font-medium transition-colors"
            >
              <Zap size={14} className="text-amber-500" />
              Generate shareable link
            </button>
          )}
        </div>
      </section>

      {/* Cloud integrations */}
      <section>
        <SectionLabel icon={ArrowUpRight}>Cloud Integrations</SectionLabel>
        <div className="mt-2 space-y-2">
          {INTEGRATIONS.map((def) => {
            const state = integrations[def.id];
            const isConnecting = connecting === def.id;
            const isPushing = pushing === def.id;
            const isPushed = pushed === def.id;

            return (
              <div
                key={def.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 bg-white transition-colors"
              >
                <div
                  className={`w-8 h-8 rounded-lg ${def.badgeBg} flex items-center justify-center shrink-0`}
                >
                  <span className={`text-xs font-bold ${def.badgeText}`}>
                    {def.badgeLabel}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-gray-800">{def.name}</span>
                    {state.connected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    {state.connected ? state.accountName : def.description}
                  </p>
                </div>

                {state.connected ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handlePush(def.id)}
                      disabled={isPushing || isPushed}
                      className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all ${
                        isPushed
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                      }`}
                    >
                      {isPushing ? (
                        <Loader2 size={11} className="animate-spin" />
                      ) : isPushed ? (
                        <Check size={11} />
                      ) : (
                        <CloudUpload size={11} />
                      )}
                      {isPushing ? "Pushing" : isPushed ? "Done!" : "Push"}
                    </button>
                    <button
                      onClick={() => onDisconnect(def.id)}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                      title="Disconnect"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleConnect(def)}
                    disabled={isConnecting}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 transition-colors shrink-0"
                  >
                    {isConnecting ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <ArrowUpRight size={12} />
                    )}
                    {isConnecting ? "Connecting…" : "Connect"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// ─── Automation Panel ─────────────────────────────────────────────────────────

function AutomationPanel({
  automation,
  integrations,
  onSave,
}: {
  automation: AutomationConfig;
  integrations: Record<IntegrationId, Integration>;
  onSave: (c: AutomationConfig) => void;
}) {
  const [draft, setDraft] = useState<AutomationConfig>(automation);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    onSave(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const connectedDestinations: { value: ExportDestination; label: string }[] = [
    { value: "email", label: "Email" },
    ...INTEGRATIONS.filter((d) => integrations[d.id].connected).map((d) => ({
      value: d.id as ExportDestination,
      label: d.name,
    })),
  ];

  const destinationNeedsEmail = draft.destination === "email";
  const destinationNeedsConnection =
    draft.destination !== "download" &&
    draft.destination !== "email" &&
    !integrations[draft.destination as IntegrationId]?.connected;

  return (
    <div className="p-5 space-y-5">
      {/* Enable toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              draft.enabled ? "bg-indigo-50" : "bg-gray-50"
            }`}
          >
            <Bell size={16} className={draft.enabled ? "text-indigo-600" : "text-gray-400"} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Scheduled Exports</p>
            <p className="text-xs text-gray-400">
              {draft.enabled ? `Next: ${nextRunLabel(draft.frequency)}` : "Automatically export on a schedule"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setDraft((d) => ({ ...d, enabled: !d.enabled }))}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            draft.enabled ? "bg-indigo-600" : "bg-gray-200"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
              draft.enabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Settings (only active when enabled) */}
      <div className={`space-y-4 transition-opacity ${draft.enabled ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
        {/* Frequency */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
            Frequency
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["daily", "weekly", "monthly"] as const).map((freq) => (
              <button
                key={freq}
                onClick={() => setDraft((d) => ({ ...d, frequency: freq }))}
                className={`p-3 rounded-xl border-2 text-sm font-medium capitalize transition-all ${
                  draft.frequency === freq
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {freq}
              </button>
            ))}
          </div>
        </div>

        {/* Format */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
            Format
          </label>
          <div className="flex gap-2">
            {(["csv", "json", "pdf"] as ExportFormat[]).map((f) => (
              <button
                key={f}
                onClick={() => setDraft((d) => ({ ...d, format: f }))}
                className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold uppercase transition-all ${
                  draft.format === f
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-gray-200 text-gray-400 hover:border-gray-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Destination */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
            Destination
          </label>
          <select
            value={draft.destination}
            onChange={(e) =>
              setDraft((d) => ({ ...d, destination: e.target.value as ExportDestination }))
            }
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {connectedDestinations.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
          {destinationNeedsConnection && (
            <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
              <AlertCircle size={11} />
              Connect this integration in Send &amp; Share first.
            </p>
          )}
        </div>

        {/* Email input when destination is email */}
        {destinationNeedsEmail && (
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
              Delivery Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={draft.email}
              onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}

        {/* Save */}
        <button
          onClick={handleSave}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            saved
              ? "bg-emerald-500 text-white"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
        >
          {saved ? <Check size={15} /> : <RefreshCw size={15} />}
          {saved ? "Schedule saved!" : "Save schedule"}
        </button>
      </div>

      {/* Info box */}
      <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 text-xs text-gray-500 space-y-1">
        <p className="font-semibold text-gray-700 flex items-center gap-1.5">
          <Zap size={12} className="text-amber-500" /> How it works
        </p>
        <p>ExpenseAI will prepare and deliver your export automatically at the scheduled time. No action needed.</p>
      </div>
    </div>
  );
}

// ─── History Panel ────────────────────────────────────────────────────────────

const DEST_LABELS: Record<ExportDestination, string> = {
  download: "Downloaded",
  email: "Emailed",
  "google-drive": "Google Drive",
  dropbox: "Dropbox",
  "google-sheets": "Google Sheets",
  notion: "Notion",
  onedrive: "OneDrive",
};

const FORMAT_COLORS: Record<ExportFormat, string> = {
  csv: "bg-green-100 text-green-700",
  json: "bg-purple-100 text-purple-700",
  pdf: "bg-red-100 text-red-700",
};

function HistoryPanel({
  history,
  onClear,
}: {
  history: ExportRecord[];
  onClear: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-8">
        <Clock size={32} className="text-gray-200 mb-3" />
        <p className="text-sm font-medium text-gray-400">No exports yet</p>
        <p className="text-xs text-gray-300 mt-1">
          Your export history will appear here after your first export.
        </p>
      </div>
    );
  }

  const totalExported = history.reduce((s, r) => s + r.recordCount, 0);
  const totalValue = history.reduce((s, r) => s + r.totalAmount, 0);

  return (
    <div className="p-5 space-y-4">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Exports", value: history.length },
          { label: "Records sent", value: totalExported.toLocaleString() },
          { label: "Total value", value: formatCurrency(totalValue) },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl bg-gray-50 border border-gray-100 p-3 text-center">
            <p className="text-sm font-bold text-gray-900">{value}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Log */}
      <div className="space-y-1.5">
        {history.map((rec) => (
          <div
            key={rec.id}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-100 hover:bg-gray-50/60 transition-colors"
          >
            <div
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${FORMAT_COLORS[rec.format]}`}
            >
              {rec.format.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-800 truncate">{rec.templateName}</p>
              <p className="text-[10px] text-gray-400">
                {DEST_LABELS[rec.destination]} · {rec.recordCount} records ·{" "}
                {formatCurrency(rec.totalAmount)}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] text-gray-400">
                {formatDistanceToNow(parseISO(rec.timestamp), { addSuffix: true })}
              </p>
              <span
                className={`inline-block text-[10px] font-medium mt-0.5 ${
                  rec.status === "success" ? "text-emerald-600" : "text-red-500"
                }`}
              >
                {rec.status === "success" ? "✓ success" : "✗ failed"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Clear */}
      {confirming ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 flex-1">
            Delete all {history.length} records?
          </span>
          <button
            onClick={() => {
              onClear();
              setConfirming(false);
            }}
            className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
          >
            Yes, clear
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="text-xs text-gray-500 hover:text-gray-700 px-2"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 size={12} />
          Clear history
        </button>
      )}
    </div>
  );
}

// ─── Shared ────────────────────────────────────────────────────────────────────

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
