"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  FolderOpen,
  HardDrive,
  NotepadText,
  Briefcase,
  Link as LinkIcon,
  Database,
  Upload,
  Check,
  X,
  AlertCircle,
  Shield,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  Loader2,
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
  borderColor: string;
}

function useStoredConnections(): [string[], (ids: string[]) => void] {
  const [connected, setConnected] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("qyntra-connections") || "[]");
      setConnected(stored);
    } catch {
      setConnected([]);
    }
  }, []);

  const save = (ids: string[]) => {
    localStorage.setItem("qyntra-connections", JSON.stringify(ids));
    setConnected(ids);
  };

  return [connected, save];
}

const connectors: ConnectorConfig[] = [
  {
    id: "local-folder",
    name: "Local Folder",
    description: "Select a folder and build a private wiki from local files. Uses File System Access API or Tauri native bridge.",
    icon: FolderOpen,
    provider: "local",
    oauthConfigured: true,
    features: [".txt", ".md", ".json", ".csv", ".html"],
    color: "#ffeb3b",
    borderColor: "rgba(255,235,59,0.3)",
  },
  {
    id: "google-drive",
    name: "Google Drive",
    description: "Import docs, PDFs, notes, and files from Google Drive via real OAuth.",
    icon: HardDrive,
    provider: "google-drive",
    oauthConfigured: true,
    features: ["Docs", "Sheets", "PDFs", "Slides"],
    color: "#00ffff",
    borderColor: "rgba(0,255,255,0.3)",
  },
  {
    id: "notion",
    name: "Notion",
    description: "Import pages and databases into your personal wiki via Notion OAuth integration.",
    icon: NotepadText,
    provider: "notion",
    oauthConfigured: true,
    features: ["Pages", "Databases", "Blocks"],
    color: "#ffb8ff",
    borderColor: "rgba(255,184,255,0.3)",
  },
  {
    id: "microsoft",
    name: "Microsoft 365",
    description: "Import from OneDrive, SharePoint, and Outlook via Microsoft Graph OAuth.",
    icon: Briefcase,
    provider: "microsoft",
    oauthConfigured: true,
    features: ["OneDrive", "SharePoint", "Outlook"],
    color: "#ffb852",
    borderColor: "rgba(255,184,82,0.3)",
  },
  {
    id: "manual-url",
    name: "Manual URL",
    description: "Add a webpage or article by URL. The app will fetch and index the content.",
    icon: LinkIcon,
    provider: "manual",
    oauthConfigured: true,
    features: ["Webpages", "Articles", "Docs"],
    color: "#4ade80",
    borderColor: "rgba(74,222,128,0.3)",
  },
  {
    id: "manual-text",
    name: "Manual Paste",
    description: "Paste raw text, notes, or copied content directly into your wiki.",
    icon: Upload,
    provider: "manual",
    oauthConfigured: true,
    features: ["Raw text", "Notes", "Snippets"],
    color: "#ffca28",
    borderColor: "rgba(255,202,40,0.3)",
  },
  {
    id: "demo-dataset",
    name: "Demo Dataset",
    description: "Load a polished AI Agent Memory Encyclopedia demo with sample sources, pages, and contradictions.",
    icon: Database,
    provider: "demo",
    oauthConfigured: true,
    features: ["7 sources", "8 pages", "Graph", "Contradictions"],
    color: "#ffeb3b",
    borderColor: "rgba(255,235,59,0.3)",
  },
];

export default function ConnectPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const successParam = searchParams.get("success");
  const errorParam = searchParams.get("error");

  const [connectedIds, setConnectedIds] = useStoredConnections();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [consentGiven, setConsentGiven] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<{ synced: number; files: string[] } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Handle OAuth callback success/error
  useEffect(() => {
    if (successParam) {
      const next = [...connectedIds, successParam];
      setConnectedIds(next);
      setToast({ message: `${successParam} connected successfully!`, type: "success" });
      // Clear URL params
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (errorParam) {
      setToast({ message: `Connection failed: ${errorParam}`, type: "error" });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [successParam, errorParam]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  async function handleOAuthConnect(providerId: string) {
    setLoading(providerId);
    try {
      const res = await fetch(`/api/oauth/start?provider=${providerId}&redirect=/app/connect`);
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setToast({ message: data.error || "OAuth URL generation failed", type: "error" });
      }
    } catch {
      setToast({ message: "Failed to start OAuth flow", type: "error" });
    } finally {
      setLoading(null);
    }
  }

  async function handleSync(providerId: string) {
    setSyncing(providerId);
    try {
      const res = await fetch(`/api/connectors/${providerId}/sync`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSyncResult({ synced: data.synced, files: data.files.map((f: { name: string }) => f.name) });
        setToast({ message: `Synced ${data.synced} files from ${providerId}`, type: "success" });
      } else {
        setToast({ message: data.error || "Sync failed", type: "error" });
      }
    } catch {
      setToast({ message: "Sync request failed", type: "error" });
    } finally {
      setSyncing(null);
    }
  }

  function handleDisconnect(id: string) {
    const next = connectedIds.filter((c) => c !== id);
    setConnectedIds(next);
    setToast({ message: `${id} disconnected`, type: "success" });
  }

  function handleConnect(id: string) {
    if (id === "demo-dataset") {
      const next = [...connectedIds, id];
      setConnectedIds(next);
      setToast({ message: "Demo data loaded!", type: "success" });
    }
    setActiveModal(null);
  }

  const activeConnector = connectors.find((c) => c.id === activeModal);
  const connectedCount = connectedIds.length;

  return (
    <div className="min-h-screen bg-black">
      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-4 right-4 z-50 pixel-card px-4 py-3 max-w-sm ${
            toast.type === "success" ? "border-green-400/50" : "border-red-400/50"
          }`}
        >
          <p className={`text-xs ${toast.type === "success" ? "text-green-400" : "text-red-400"}`}>
            {toast.message}
          </p>
        </motion.div>
      )}

      {/* Header */}
      <div className="px-6 sm:px-8 lg:px-10 pt-8 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="pixel-heading text-[12px] text-white">Permission Center</h1>
            <p className="mt-1 text-sm text-[#a0a0a0]">
              {connectedCount} of {connectors.length} sources connected
            </p>
          </div>
          {session?.user?.email && (
            <div className="pixel-badge pixel-badge-yellow text-[6px]">
              {session.user.email}
            </div>
          )}
        </div>
      </div>

      <div className="px-6 sm:px-8 lg:px-10 pb-10">
        {/* Trust banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-4 mb-8 flex items-center gap-3 border-yellow-400/20"
        >
          <Shield className="w-5 h-5 text-yellow-400 shrink-0" />
          <div>
            <p className="text-sm font-medium text-white">Real OAuth Connections</p>
            <p className="text-xs text-[#a0a0a0]">
              Tokens are exchanged server-side. Files are fetched via real APIs and stored in your wiki. No silent access.
            </p>
          </div>
        </motion.div>

        {/* Sync result */}
        {syncResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="pixel-card border-green-400/30 p-4 mb-6"
          >
            <p className="text-xs text-green-400 font-[Press_Start_2P] mb-2">
              SYNC COMPLETE: {syncResult.synced} files
            </p>
            <div className="flex flex-wrap gap-2">
              {syncResult.files.map((name) => (
                <span key={name} className="text-[8px] px-2 py-1 bg-green-400/10 text-green-400 border border-green-400/20">
                  {name}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Connector grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {connectors.map((conn, idx) => {
            const Icon = conn.icon;
            const isConnected = connectedIds.includes(conn.provider);
            const isOAuth = ["google-drive", "microsoft", "notion"].includes(conn.provider);
            const isLoading = loading === conn.provider;
            const isSyncing = syncing === conn.provider;

            return (
              <motion.div
                key={conn.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="pixel-card relative overflow-hidden"
                style={{ borderColor: isConnected ? "#4ade80" : conn.borderColor }}
              >
                {/* Status badge */}
                <div className="absolute top-3 right-3">
                  {isConnected ? (
                    <span className="pixel-badge pixel-badge-green text-[6px]">
                      <Check className="w-2.5 h-2.5" /> Connected
                    </span>
                  ) : (
                    <span className="pixel-badge pixel-badge-yellow text-[6px]">
                      <AlertCircle className="w-2.5 h-2.5" /> Available
                    </span>
                  )}
                </div>

                {/* Icon */}
                <div
                  className="w-10 h-10 flex items-center justify-center mb-4 border-4"
                  style={{ borderColor: conn.color, backgroundColor: `${conn.color}15` }}
                >
                  <Icon className="w-5 h-5" style={{ color: conn.color }} />
                </div>

                <h3 className="pixel-heading text-[8px] text-white mb-1">{conn.name}</h3>
                <p className="text-xs text-[#a0a0a0] mb-3 leading-relaxed">{conn.description}</p>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {conn.features.map((f) => (
                    <span key={f} className="text-[8px] px-2 py-0.5 bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 font-[Press_Start_2P]">
                      {f}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                {isConnected ? (
                  <div className="flex gap-2">
                    {isOAuth && (
                      <button
                        onClick={() => handleSync(conn.provider)}
                        disabled={isSyncing}
                        className="flex-1 pixel-btn pixel-btn-yellow text-[6px] py-2 flex items-center justify-center gap-1"
                      >
                        {isSyncing ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3 h-3" />
                        )}
                        {isSyncing ? "Syncing..." : "Sync Files"}
                      </button>
                    )}
                    <button
                      onClick={() => handleDisconnect(conn.provider)}
                      className="pixel-btn pixel-btn-ghost text-[6px] py-2"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : isOAuth ? (
                  <button
                    onClick={() => handleOAuthConnect(conn.provider)}
                    disabled={isLoading}
                    className="w-full pixel-btn pixel-btn-yellow text-[6px] py-2 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <ExternalLink className="w-3 h-3" />
                    )}
                    {isLoading ? "Connecting..." : `Connect ${conn.name}`}
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveModal(conn.id)}
                    className="w-full pixel-btn pixel-btn-yellow text-[6px] py-2"
                  >
                    {conn.id === "demo-dataset" ? "Load Demo" : "Connect"}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Consent Modal */}
      {activeConnector && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setActiveModal(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel max-w-md w-full p-6 border-yellow-400/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="pixel-heading text-[10px] text-white">Connect {activeConnector.name}</h3>
              <button onClick={() => setActiveModal(null)} className="text-[#666666] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-[#a0a0a0] mb-4">{activeConnector.description}</p>
            <div className="p-4 mb-4 bg-yellow-400/5 border-4 border-yellow-400/15">
              <h4 className="text-[8px] font-[Press_Start_2P] text-yellow-400 uppercase tracking-wider mb-2">Permission Required</h4>
              <p className="text-xs text-[#a0a0a0]">I consent to QyntraWiki accessing my {activeConnector.name} data for building my personal wiki.</p>
            </div>
            <div className="flex items-start gap-3 mb-6">
              <input
                type="checkbox"
                id="consent"
                checked={consentGiven[activeConnector.id] || false}
                onChange={(e) => setConsentGiven((prev) => ({ ...prev, [activeConnector.id]: e.target.checked }))}
                className="mt-0.5 w-4 h-4 accent-yellow-400"
              />
              <label htmlFor="consent" className="text-xs text-[#a0a0a0] leading-relaxed">I consent to QyntraWiki accessing my {activeConnector.name} data.</label>
            </div>
            <button
              disabled={!consentGiven[activeConnector.id]}
              onClick={() => handleConnect(activeConnector.id)}
              className={cn("w-full py-3 text-[8px] font-[Press_Start_2P] uppercase tracking-wider flex items-center justify-center gap-2", consentGiven[activeConnector.id] ? "pixel-btn pixel-btn-solid" : "bg-[#666666]/20 text-[#666666] cursor-not-allowed")}
            >
              {activeConnector.id === "demo-dataset" ? "Load Demo" : `Connect ${activeConnector.name}`}
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
