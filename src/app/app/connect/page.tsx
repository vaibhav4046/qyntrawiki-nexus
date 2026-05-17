"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  FolderOpen, HardDrive, NotepadText, Briefcase, Link as LinkIcon,
  Database, Upload, Check, X, AlertCircle, Shield, ChevronRight,
  ExternalLink, RefreshCw, Loader2,
} from "lucide-react";

interface ConnectorConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  provider: string;
  oauthConfigured: boolean;
  features: string[];
  color: string;
}

function useStoredConnections(): [string[], (ids: string[]) => void] {
  const [connected, setConnected] = useState<string[]>([]);
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("qyntra-connections") || "[]") as string[];
      setConnected(stored);
    } catch { setConnected([]); }
  }, []);
  const save = (ids: string[]) => { localStorage.setItem("qyntra-connections", JSON.stringify(ids)); setConnected(ids); };
  return [connected, save];
}

const connectors: ConnectorConfig[] = [
  { id: "local-folder", name: "Local Folder", description: "Select a folder and build a private wiki from local files.", icon: FolderOpen, provider: "local", oauthConfigured: true, features: [".txt", ".md", ".json", ".csv"], color: "#4a7c59" },
  { id: "google-drive", name: "Google Drive", description: "Import docs, PDFs, and files from Google Drive via OAuth.", icon: HardDrive, provider: "google-drive", oauthConfigured: true, features: ["Docs", "Sheets", "PDFs"], color: "#e63946" },
  { id: "notion", name: "Notion", description: "Import pages and databases into your wiki via Notion OAuth.", icon: NotepadText, provider: "notion", oauthConfigured: true, features: ["Pages", "Databases"], color: "#f77f00" },
  { id: "microsoft", name: "Microsoft 365", description: "Import from OneDrive, SharePoint, and Outlook via Graph OAuth.", icon: Briefcase, provider: "microsoft", oauthConfigured: true, features: ["OneDrive", "SharePoint"], color: "#00b4d8" },
  { id: "manual-url", name: "Manual URL", description: "Add a webpage or article by URL. Content is fetched and indexed.", icon: LinkIcon, provider: "manual", oauthConfigured: true, features: ["Webpages", "Articles"], color: "#ff69b4" },
  { id: "manual-text", name: "Manual Paste", description: "Paste raw text, notes, or copied content directly into your wiki.", icon: Upload, provider: "manual", oauthConfigured: true, features: ["Raw text", "Notes"], color: "#888" },
  { id: "demo-dataset", name: "Demo Dataset", description: "Load a polished AI Agent Memory demo with sample sources and pages.", icon: Database, provider: "demo", oauthConfigured: true, features: ["7 sources", "8 pages", "Graph"], color: "#e63946" },
];

export default function ConnectPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const successParam = searchParams.get("success");
  const errorParam = searchParams.get("error");

  const [connectedIds, setConnectedIds] = useStoredConnections();
  const [loading, setLoading] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<{ synced: number; files: string[] } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (successParam) {
      setConnectedIds([...connectedIds, successParam]);
      setToast({ message: `${successParam} connected!`, type: "success" });
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (errorParam) {
      setToast({ message: `Failed: ${errorParam}`, type: "error" });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [successParam, errorParam]);

  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 4000); return () => clearTimeout(t); }, [toast]);

  async function handleOAuthConnect(providerId: string) {
    setLoading(providerId);
    try {
      const res = await fetch(`/api/oauth/start?provider=${providerId}&redirect=/app/connect`);
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) window.location.href = data.url;
      else setToast({ message: data.error || "OAuth failed", type: "error" });
    } catch { setToast({ message: "Failed to start OAuth", type: "error" }); }
    finally { setLoading(null); }
  }

  async function handleSync(providerId: string) {
    setSyncing(providerId);
    try {
      const res = await fetch(`/api/connectors/${providerId}/sync`, { method: "POST" });
      const data = (await res.json()) as { success?: boolean; synced?: number; files?: Array<{ name: string }>; error?: string };
      if (data.success) {
        setSyncResult({ synced: data.synced ?? 0, files: (data.files ?? []).map((f) => f.name) });
        setToast({ message: `Synced ${data.synced} files`, type: "success" });
      } else setToast({ message: data.error || "Sync failed", type: "error" });
    } catch { setToast({ message: "Sync request failed", type: "error" }); }
    finally { setSyncing(null); }
  }

  function handleDisconnect(id: string) {
    setConnectedIds(connectedIds.filter((c) => c !== id));
    setToast({ message: `${id} disconnected`, type: "success" });
  }

  const connectedCount = connectedIds.length;

  return (
    <div className="min-h-screen bg-[#060606] p-6 sm:p-8 space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={cn("fixed top-4 right-4 z-50 px-4 py-3 rounded-lg max-w-sm border text-[13px] font-medium",
              toast.type === "success" ? "bg-[#4a7c59]/10 border-[#4a7c59]/30 text-[#4a7c59]" : "bg-[#e63946]/10 border-[#e63946]/30 text-[#e63946]")}>
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Connect Sources</h1>
          <p className="text-[13px] text-[#888] mt-1">{connectedCount} of {connectors.length} sources connected</p>
        </div>
        {session?.user?.email && (
          <span className="text-[12px] text-[#555] bg-[#111] px-3 py-1.5 rounded-lg border border-[#1a1a1a]">{session.user.email}</span>
        )}
      </div>

      {/* Trust banner */}
      <div className="card flex items-center gap-3 p-4">
        <Shield className="w-5 h-5 text-[#e63946] shrink-0" />
        <div>
          <p className="text-[14px] font-medium text-white">Real OAuth Connections</p>
          <p className="text-[13px] text-[#888]">Tokens are exchanged server-side. Files are fetched via real APIs. No silent access.</p>
        </div>
      </div>

      {/* Sync result */}
      <AnimatePresence>
        {syncResult && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="card border-[#4a7c59]/30 bg-[#4a7c59]/5 p-4">
            <p className="text-[13px] text-[#4a7c59] font-medium mb-2">Sync complete: {syncResult.synced} files</p>
            <div className="flex flex-wrap gap-2">
              {syncResult.files.map((name) => (
                <span key={name} className="text-[12px] px-2 py-1 bg-[#4a7c59]/10 text-[#4a7c59] rounded border border-[#4a7c59]/20">{name}</span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connector grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {connectors.map((conn, idx) => {
          const Icon = conn.icon;
          const isConnected = connectedIds.includes(conn.provider);
          const isOAuth = ["google-drive", "microsoft", "notion"].includes(conn.provider);
          const isLoading = loading === conn.provider;
          const isSyncing = syncing === conn.provider;

          return (
            <motion.div key={conn.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
              className={cn("card p-5 relative",
                isConnected && "border-l-2 border-l-[#4a7c59]"
              )}>
              <div className="absolute top-4 right-4">
                {isConnected ? (
                  <span className="flex items-center gap-1 text-[12px] font-semibold text-[#4a7c59]">
                    <Check className="w-3.5 h-3.5" /> Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[12px] font-semibold text-[#666]">
                    <AlertCircle className="w-3.5 h-3.5" /> Not connected
                  </span>
                )}
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${conn.color}10` }}>
                  <Icon className="w-5 h-5" style={{ color: conn.color }} />
                </div>
                <div className="flex-1 min-w-0 pr-20">
                  <h3 className="text-[15px] font-semibold text-white">{conn.name}</h3>
                  <p className="text-[13px] text-[#888] mt-1">{conn.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-4">
                {conn.features.map((f) => (
                  <span key={f} className="text-[11px] px-2 py-1 rounded border font-medium"
                    style={{ color: conn.color, borderColor: `${conn.color}20`, backgroundColor: `${conn.color}08` }}>{f}</span>
                ))}
              </div>

              <div className="flex gap-2 mt-5 pt-4 border-t border-[#1a1a1a]">
                {isConnected ? (
                  <>
                    {isOAuth && (
                      <button onClick={() => handleSync(conn.provider)} disabled={isSyncing}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-[#4a7c59] hover:bg-[#5a8c69] text-white px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-colors disabled:opacity-50">
                        {isSyncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                        {isSyncing ? "Syncing..." : "Sync"}
                      </button>
                    )}
                    <button onClick={() => handleDisconnect(conn.provider)}
                      className="inline-flex items-center justify-center gap-2 border border-[#333] text-[#888] hover:text-white hover:border-[#555] px-4 py-2.5 rounded-lg text-[13px] transition-colors">
                      Disconnect
                    </button>
                  </>
                ) : isOAuth ? (
                  <button onClick={() => handleOAuthConnect(conn.provider)} disabled={isLoading}
                    className="flex-1 inline-flex items-center justify-center gap-2 text-white px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-colors disabled:opacity-50"
                    style={{ backgroundColor: conn.color }}>
                    {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5" />}
                    {isLoading ? "Connecting..." : "Connect"}
                  </button>
                ) : (
                  <button className="flex-1 inline-flex items-center justify-center gap-2 text-white px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-colors"
                    style={{ backgroundColor: conn.color }}>
                    {conn.id === "demo-dataset" ? "Load Demo" : "Connect"}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
