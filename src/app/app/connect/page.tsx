"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  FolderOpen,
  HardDrive,
  NotepadText,
  Briefcase,
  Camera,
  Link as LinkIcon,
  Database,
  Upload,
  Check,
  X,
  AlertCircle,
  Shield,
  ChevronRight,
  Settings,
  ExternalLink,
  Key,
} from "lucide-react";

interface ConnectorConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  oauthUrl?: string;
  oauthConfigured: boolean;
  features: string[];
  color: string;
  borderColor: string;
}

function buildOAuthUrl(provider: string, redirectUri: string, scope: string): string | undefined {
  const clientId =
    provider === "google"
      ? process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      : provider === "microsoft"
      ? process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID
      : provider === "notion"
      ? process.env.NEXT_PUBLIC_NOTION_CLIENT_ID
      : undefined;

  if (!clientId) return undefined;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope,
    access_type: "offline",
    prompt: "consent",
  });

  const urls: Record<string, string> = {
    google: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    microsoft: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`,
    notion: `https://api.notion.com/v1/oauth/authorize?${params.toString()}`,
  };

  return urls[provider];
}

function getConnectors(): ConnectorConfig[] {
  const redirectUri = typeof window !== "undefined" ? `${window.location.origin}/app/connect/callback` : "";

  return [
    {
      id: "local-folder",
      name: "Local Folder",
      description: "Select a folder and build a private wiki from local files. Uses File System Access API or Tauri native bridge.",
      icon: FolderOpen,
      oauthConfigured: true,
      features: [".txt", ".md", ".json", ".csv", ".html"],
      color: "#ffeb3b",
      borderColor: "rgba(255,235,59,0.3)",
    },
    {
      id: "google-drive",
      name: "Google Drive",
      description: "Import docs, PDFs, notes, and files from Google Drive via OAuth.",
      icon: HardDrive,
      oauthUrl: buildOAuthUrl("google", redirectUri, "https://www.googleapis.com/auth/drive.readonly"),
      oauthConfigured: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      features: ["Docs", "Sheets", "PDFs", "Slides"],
      color: "#00ffff",
      borderColor: "rgba(0,255,255,0.3)",
    },
    {
      id: "notion",
      name: "Notion",
      description: "Import pages and databases into your personal wiki via Notion OAuth integration.",
      icon: NotepadText,
      oauthUrl: buildOAuthUrl("notion", redirectUri, ""),
      oauthConfigured: !!process.env.NEXT_PUBLIC_NOTION_CLIENT_ID,
      features: ["Pages", "Databases", "Blocks"],
      color: "#ffb8ff",
      borderColor: "rgba(255,184,255,0.3)",
    },
    {
      id: "microsoft",
      name: "Microsoft 365",
      description: "Import from OneDrive, SharePoint, and Outlook via Microsoft Graph OAuth.",
      icon: Briefcase,
      oauthUrl: buildOAuthUrl("microsoft", redirectUri, "Files.Read openid profile email"),
      oauthConfigured: !!process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID,
      features: ["OneDrive", "SharePoint", "Outlook"],
      color: "#ffb852",
      borderColor: "rgba(255,184,82,0.3)",
    },
    {
      id: "manual-url",
      name: "Manual URL",
      description: "Add a webpage or article by URL. The app will fetch and index the content.",
      icon: LinkIcon,
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
      oauthConfigured: true,
      features: ["7 sources", "8 pages", "Graph", "Contradictions"],
      color: "#ffeb3b",
      borderColor: "rgba(255,235,59,0.3)",
    },
  ];
}

function getStoredConnections(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("qyntra-connections") || "[]");
  } catch {
    return [];
  }
}

function setStoredConnections(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("qyntra-connections", JSON.stringify(ids));
}

export default function ConnectPage() {
  const { data: session } = useSession();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [consentGiven, setConsentGiven] = useState<Record<string, boolean>>({});
  const [connectedIds, setConnectedIds] = useState<string[]>([]);
  const [justConnected, setJustConnected] = useState<string | null>(null);
  const connectors = getConnectors();

  useEffect(() => {
    setConnectedIds(getStoredConnections());
  }, []);

  // Check for OAuth callback in URL
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    if (code && state) {
      // In a real app, exchange code for tokens via API
      // For demo, we mark the connector as connected
      const connectorId = state;
      handleConnect(connectorId);
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  function handleConnect(id: string) {
    const next = [...connectedIds, id];
    setConnectedIds(next);
    setStoredConnections(next);
    setJustConnected(id);
    setActiveModal(null);
    setTimeout(() => setJustConnected(null), 3000);
  }

  function handleDisconnect(id: string) {
    const next = connectedIds.filter((c) => c !== id);
    setConnectedIds(next);
    setStoredConnections(next);
  }

  const activeConnector = connectors.find((c) => c.id === activeModal);
  const connectedCount = connectedIds.length;

  return (
    <div className="min-h-screen bg-black">
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
            <p className="text-sm font-medium text-white">Permission-First Architecture</p>
            <p className="text-xs text-[#a0a0a0]">
              OAuth tokens stay in your browser session. No silent data access. Revoke anytime.
            </p>
          </div>
        </motion.div>

        {/* Connector grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {connectors.map((conn, idx) => {
            const Icon = conn.icon;
            const isConnected = connectedIds.includes(conn.id);
            const isJustConnected = justConnected === conn.id;

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

                {/* Content */}
                <h3 className="pixel-heading text-[8px] text-white mb-1">{conn.name}</h3>
                <p className="text-xs text-[#a0a0a0] mb-3 leading-relaxed">{conn.description}</p>

                {/* Features */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {conn.features.map((f) => (
                    <span
                      key={f}
                      className="text-[8px] px-2 py-0.5 bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 font-[Press_Start_2P]"
                    >
                      {f}
                    </span>
                  ))}
                </div>

                {/* Action */}
                {isConnected ? (
                  <button
                    onClick={() => handleDisconnect(conn.id)}
                    className="w-full pixel-btn pixel-btn-ghost text-[6px] py-2"
                  >
                    Disconnect
                  </button>
                ) : conn.oauthUrl ? (
                  <div className="space-y-2">
                    {conn.oauthConfigured ? (
                      <a
                        href={conn.oauthUrl}
                        className="w-full pixel-btn pixel-btn-yellow text-[6px] py-2 flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Connect with OAuth
                      </a>
                    ) : (
                      <div className="p-2 bg-yellow-400/5 border-2 border-yellow-400/20">
                        <div className="flex items-center gap-2 mb-1">
                          <Key className="w-3 h-3 text-yellow-400" />
                          <span className="text-[8px] text-yellow-400 font-[Press_Start_2P]">
                            OAuth Not Configured
                          </span>
                        </div>
                        <p className="text-[10px] text-[#666666]">
                          Add {conn.id.toUpperCase().replace("-", "_")}_CLIENT_ID to your .env file.
                        </p>
                      </div>
                    )}
                    <button
                      onClick={() => setActiveModal(conn.id)}
                      className="w-full pixel-btn pixel-btn-ghost text-[6px] py-2"
                    >
                      Manual Import
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveModal(conn.id)}
                    className="w-full pixel-btn pixel-btn-yellow text-[6px] py-2"
                  >
                    {conn.id === "demo-dataset" ? "Load Demo" : "Connect"}
                  </button>
                )}

                {/* Just connected flash */}
                {isJustConnected && (
                  <motion.div
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 2 }}
                    className="absolute inset-0 bg-green-400/20 pointer-events-none"
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Consent Modal */}
      {activeConnector && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveModal(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel max-w-md w-full p-6 border-yellow-400/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="pixel-heading text-[10px] text-white">
                Connect {activeConnector.name}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-[#666666] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-[#a0a0a0] mb-4">{activeConnector.description}</p>

            <div className="p-4 mb-4 bg-yellow-400/5 border-4 border-yellow-400/15">
              <h4 className="text-[8px] font-[Press_Start_2P] text-yellow-400 uppercase tracking-wider mb-2">
                Permission Required
              </h4>
              <p className="text-xs text-[#a0a0a0]">
                {activeConnector.id === "local-folder"
                  ? "Browser File System Access API permission. Files stay local."
                  : activeConnector.id === "demo-dataset"
                  ? "No permission needed. Loads public demo data into your wiki."
                  : `OAuth access to ${activeConnector.name}. You can revoke this at any time in Settings.`}
              </p>
            </div>

            <div className="flex items-start gap-3 mb-6">
              <input
                type="checkbox"
                id="consent"
                checked={consentGiven[activeConnector.id] || false}
                onChange={(e) =>
                  setConsentGiven((prev) => ({
                    ...prev,
                    [activeConnector.id]: e.target.checked,
                  }))
                }
                className="mt-0.5 w-4 h-4 accent-yellow-400"
              />
              <label htmlFor="consent" className="text-xs text-[#a0a0a0] leading-relaxed">
                I consent to QyntraWiki accessing my {activeConnector.name} data for the purpose of
                building my personal wiki. I understand I can revoke this access at any time.
              </label>
            </div>

            <button
              disabled={!consentGiven[activeConnector.id]}
              onClick={() => handleConnect(activeConnector.id)}
              className={cn(
                "w-full py-3 text-[8px] font-[Press_Start_2P] uppercase tracking-wider flex items-center justify-center gap-2",
                consentGiven[activeConnector.id]
                  ? "pixel-btn pixel-btn-solid"
                  : "bg-[#666666]/20 text-[#666666] cursor-not-allowed"
              )}
            >
              {activeConnector.id === "demo-dataset" ? "Load Demo" : activeConnector.name === "Local Folder" ? "Open Folder Picker" : `Connect ${activeConnector.name}`}
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
