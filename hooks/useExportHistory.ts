import { useState, useEffect } from "react";

export type ExportFormat = "csv" | "json" | "pdf";
export type ExportDestination =
  | "download"
  | "email"
  | "google-drive"
  | "dropbox"
  | "google-sheets"
  | "notion"
  | "onedrive";
export type IntegrationId =
  | "google-drive"
  | "dropbox"
  | "onedrive"
  | "google-sheets"
  | "notion";

export interface ExportRecord {
  id: string;
  timestamp: string;
  templateName: string;
  format: ExportFormat;
  destination: ExportDestination;
  recordCount: number;
  totalAmount: number;
  status: "success" | "failed";
}

export interface Integration {
  id: IntegrationId;
  connected: boolean;
  accountName?: string;
}

export interface AutomationConfig {
  enabled: boolean;
  frequency: "daily" | "weekly" | "monthly";
  format: ExportFormat;
  destination: ExportDestination;
  email: string;
}

type IntegrationsMap = Record<IntegrationId, Integration>;

const DEFAULT_INTEGRATIONS: IntegrationsMap = {
  "google-drive": { id: "google-drive", connected: false },
  dropbox: { id: "dropbox", connected: false },
  onedrive: { id: "onedrive", connected: false },
  "google-sheets": { id: "google-sheets", connected: false },
  notion: { id: "notion", connected: false },
};

const DEFAULT_AUTOMATION: AutomationConfig = {
  enabled: false,
  frequency: "weekly",
  format: "csv",
  destination: "email",
  email: "",
};

const KEYS = {
  history: "expenseai:export-history-v3",
  integrations: "expenseai:integrations-v3",
  automation: "expenseai:automation-v3",
};

export function useExportHistory() {
  const [history, setHistory] = useState<ExportRecord[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationsMap>(DEFAULT_INTEGRATIONS);
  const [automation, setAutomation] = useState<AutomationConfig>(DEFAULT_AUTOMATION);

  useEffect(() => {
    try {
      const h = localStorage.getItem(KEYS.history);
      if (h) setHistory(JSON.parse(h));
      const i = localStorage.getItem(KEYS.integrations);
      if (i) setIntegrations({ ...DEFAULT_INTEGRATIONS, ...JSON.parse(i) });
      const a = localStorage.getItem(KEYS.automation);
      if (a) setAutomation({ ...DEFAULT_AUTOMATION, ...JSON.parse(a) });
    } catch {}
  }, []);

  function addRecord(record: Omit<ExportRecord, "id" | "timestamp">): void {
    const rec: ExportRecord = {
      ...record,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    setHistory((prev) => {
      const next = [rec, ...prev].slice(0, 30);
      localStorage.setItem(KEYS.history, JSON.stringify(next));
      return next;
    });
  }

  function clearHistory(): void {
    setHistory([]);
    localStorage.removeItem(KEYS.history);
  }

  function connectIntegration(id: IntegrationId, accountName: string): void {
    setIntegrations((prev) => {
      const next: IntegrationsMap = { ...prev, [id]: { id, connected: true, accountName } };
      localStorage.setItem(KEYS.integrations, JSON.stringify(next));
      return next;
    });
  }

  function disconnectIntegration(id: IntegrationId): void {
    setIntegrations((prev) => {
      const next: IntegrationsMap = { ...prev, [id]: { id, connected: false } };
      localStorage.setItem(KEYS.integrations, JSON.stringify(next));
      return next;
    });
  }

  function saveAutomation(config: AutomationConfig): void {
    setAutomation(config);
    localStorage.setItem(KEYS.automation, JSON.stringify(config));
  }

  return {
    history,
    addRecord,
    clearHistory,
    integrations,
    connectIntegration,
    disconnectIntegration,
    automation,
    saveAutomation,
  };
}
