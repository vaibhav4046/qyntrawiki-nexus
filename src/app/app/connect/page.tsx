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
  Crosshair,
  Zap,
  Target,
} from "lucide-react";

interface ConnectorConfig {
  id: string;
  name: string;
  weaponName: string;
  description: string;
  icon: React.ElementType;
  provider: string;
  oauthConfigured: boolean;
  features: string[];
  color: string;
  borderColor: string;
  stats: {
    damage: number;
    range: number;
    fireRate: number;
    ammo: number;
  };
}

function useStoredConnections(): [string[], (ids: string[]) => void] {
  const [connected, setConnected] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem("qyntra-connections") || "[]"
      ) as string[];
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
    weaponName: "FOLDER BLASTER MK-II",
    description:
      "Select a folder and build a private wiki from local files. Uses File System Access API or Tauri native bridge.",
    icon: FolderOpen,
    provider: "local",
    oauthConfigured: true,
    features: [".txt", ".md", ".json", ".csv", ".html"],
    color: "#4a7c59",
    borderColor: "rgba(74,124,89,0.3)",
    stats: { damage: 60, range: 30, fireRate: 90, ammo: 250 },
  },
  {
    id: "google-drive",
    name: "Google Drive",
    weaponName: "S-RANK DRIVE CANNON",
    description:
      "Import docs, PDFs, notes, and files from Google Drive via real OAuth.",
    icon: HardDrive,
    provider: "google-drive",
    oauthConfigured: true,
    features: ["Docs", "Sheets", "PDFs", "Slides"],
    color: "#e63946",
    borderColor: "rgba(230,57,70,0.3)",
    stats: { damage: 85, range: 95, fireRate: 70, ammo: 200 },
  },
  {
    id: "notion",
    name: "Notion",
    weaponName: "NEURAL NOTEPAD RIFLE",
    description:
      "Import pages and databases into your personal wiki via Notion OAuth integration.",
    icon: NotepadText,
    provider: "notion",
    oauthConfigured: true,
    features: ["Pages", "Databases", "Blocks"],
    color: "#f77f00",
    borderColor: "rgba(247,127,0,0.3)",
    stats: { damage: 75, range: 90, fireRate: 80, ammo: 180 },
  },
  {
    id: "microsoft",
    name: "Microsoft 365",
    weaponName: "OFFICE SQUAD AUTOMAT",
    description:
      "Import from OneDrive, SharePoint, and Outlook via Microsoft Graph OAuth.",
    icon: Briefcase,
    provider: "microsoft",
    oauthConfigured: true,
    features: ["OneDrive", "SharePoint", "Outlook"],
    color: "#00b4d8",
    borderColor: "rgba(0,180,216,0.3)",
    stats: { damage: 80, range: 92, fireRate: 75, ammo: 220 },
  },
  {
    id: "manual-url",
    name: "Manual URL",
    weaponName: "LINK WHIP",
    description:
      "Add a webpage or article by URL. The app will fetch and index the content.",
    icon: LinkIcon,
    provider: "manual",
    oauthConfigured: true,
    features: ["Webpages", "Articles", "Docs"],
    color: "#ff69b4",
    borderColor: "rgba(255,105,180,0.3)",
    stats: { damage: 50, range: 100, fireRate: 60, ammo: 150 },
  },
  {
    id: "manual-text",
    name: "Manual Paste",
    weaponName: "CLIPBOARD SHURIKEN",
    description:
      "Paste raw text, notes, or copied content directly into your wiki.",
    icon: Upload,
    provider: "manual",
    oauthConfigured: true,
    features: ["Raw text", "Notes", "Snippets"],
    color: "#888888",
    borderColor: "rgba(136,136,136,0.3)",
    stats: { damage: 40, range: 20, fireRate: 100, ammo: 300 },
  },
  {
    id: "demo-dataset",
    name: "Demo Dataset",
    weaponName: "TRAINING SIMULATOR",
    description:
      "Load a polished AI Agent Memory Encyclopedia demo with sample sources, pages, and contradictions.",
    icon: Database,
    provider: "demo",
    oauthConfigured: true,
    features: ["7 sources", "8 pages", "Graph", "Contradictions"],
    color: "#e63946",
    borderColor: "rgba(230,57,70,0.3)",
    stats: { damage: 99, range: 99, fireRate: 99, ammo: 999 },
  },
];

function StatBar({
  label,
  value,
  color,
  icon: Icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <Icon className="w-3 h-3 shrink-0" style={{ color }} />
      <span className="w-12 text-[8px] font-[Press_Start_2P] text-[#888] uppercase">
        {label}
      </span>
      <div className="flex-1 h-2 bg-[#111] border border-[#333] relative">
        <div
          className="h-full absolute top-0 left-0"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-6 text-right text-[10px] font-[VT323] text-white">
        {value}
      </span>
    </div>
  );
}

function CornerBrackets({ color }: { color: string }) {
  return (
    <>
      <span
        className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2"
        style={{ borderColor: color }}
      />
      <span
        className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2"
        style={{ borderColor: color }}
      />
      <span
        className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2"
        style={{ borderColor: color }}
      />
      <span
        className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2"
        style={{ borderColor: color }}
      />
    </>
  );
}

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
  const [syncResult, setSyncResult] = useState<{
    synced: number;
    files: string[];
  } | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Handle OAuth callback success/error
  useEffect(() => {
    if (successParam) {
      const next = [...connectedIds, successParam];
      setConnectedIds(next);
      setToast({
        message: `${successParam} connected successfully!`,
        type: "success",
      });
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (errorParam) {
      setToast({
        message: `Connection failed: ${errorParam}`,
        type: "error",
      });
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
      const res = await fetch(
        `/api/oauth/start?provider=${providerId}&redirect=/app/connect`
      );
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        setToast({
          message: data.error || "OAuth URL generation failed",
          type: "error",
        });
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
      const res = await fetch(`/api/connectors/${providerId}/sync`, {
        method: "POST",
      });
      const data = (await res.json()) as {
        success?: boolean;
        synced?: number;
        files?: Array<{ name: string }>;
        error?: string;
      };
      if (data.success) {
        setSyncResult({
          synced: data.synced ?? 0,
          files: (data.files ?? []).map((f) => f.name),
        });
        setToast({
          message: `Synced ${data.synced} files from ${providerId}`,
          type: "success",
        });
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
    <div className="min-h-screen" style={{ backgroundColor: "#060606" }}>
      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-4 right-4 z-50 pixel-card px-4 py-3 max-w-sm ${
            toast.type === "success"
              ? "border-green-400/50"
              : "border-red-400/50"
          }`}
        >
          <p
            className={`text-xs ${
              toast.type === "success" ? "text-green-400" : "text-red-400"
            }`}
          >
            {toast.message}
          </p>
        </motion.div>
      )}

      {/* Header / Current Loadout */}
      <div className="px-6 sm:px-8 lg:px-10 pt-6 pb-4">
        <div className="flex flex-col gap-4">
          {/* Current Loadout Bar */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 border-b border-[#1a1a1a]">
            <span className="text-[8px] font-[Press_Start_2P] text-[#666] uppercase shrink-0">
              Current Loadout
            </span>
            <div className="flex gap-2">
              {connectors
                .filter((c) => connectedIds.includes(c.provider))
                .map((c) => {
                  const Icon = c.icon;
                  return (
                    <div
                      key={c.id}
                      className="w-8 h-8 border-2 flex items-center justify-center"
                      style={{
                        borderColor: c.color,
                        backgroundColor: `${c.color}20`,
                      }}
                      title={c.weaponName}
                    >
                      <Icon className="w-4 h-4" style={{ color: c.color }} />
                    </div>
                  );
                })}
              {connectedCount === 0 && (
                <span className="text-[12px] font-[VT323] text-[#555]">
                  NO GEAR EQUIPPED
                </span>
              )}
            </div>
            <span className="ml-auto text-[8px] font-[Press_Start_2P] text-[#666] shrink-0">
              {connectedCount}/{connectors.length}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-[Press_Start_2P] text-[14px] text-white tracking-widest">
                ARMORY
              </h1>
              <p className="mt-1 font-[VT323] text-lg text-[#a0a0a0] tracking-wide">
                SELECT YOUR GEAR
              </p>
            </div>
            {session?.user?.email && (
              <div className="pixel-badge pixel-badge-red text-[6px]">
                {session.user.email}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 sm:px-8 lg:px-10 pb-10">
        {/* Trust banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-4 mb-8 flex items-center gap-3 border-red-500/20"
        >
          <Shield className="w-5 h-5 text-red-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-white">
              Real OAuth Connections
            </p>
            <p className="text-xs text-[#a0a0a0]">
              Tokens are exchanged server-side. Files are fetched via real APIs
              and stored in your wiki. No silent access.
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
                <span
                  key={name}
                  className="text-[8px] px-2 py-1 bg-green-400/10 text-green-400 border border-green-400/20"
                >
                  {name}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Connector grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {connectors.map((conn, idx) => {
            const Icon = conn.icon;
            const isConnected = connectedIds.includes(conn.provider);
            const isOAuth = ["google-drive", "microsoft", "notion"].includes(
              conn.provider
            );
            const isLoading = loading === conn.provider;
            const isSyncing = syncing === conn.provider;
            const isHovered = hoveredId === conn.id;
            const isSelected = activeModal === conn.id;

            return (
              <motion.div
                key={conn.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="relative p-4 bg-[#0a0a0a] border"
                style={{
                  borderColor: isConnected ? conn.color : "#222",
                }}
                onMouseEnter={() => setHoveredId(conn.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <CornerBrackets color={conn.color} />

                {/* Status badge */}
                <div className="absolute top-3 right-3 z-10">
                  {isConnected ? (
                    <span className="pixel-badge pixel-badge-green text-[6px]">
                      <Check className="w-2.5 h-2.5" /> EQUIPPED
                    </span>
                  ) : (
                    <span className="pixel-badge pixel-badge-red text-[6px]">
                      <AlertCircle className="w-2.5 h-2.5" /> UNEQUIPPED
                    </span>
                  )}
                </div>

                {/* Weapon Icon */}
                <div
                  className="w-12 h-12 flex items-center justify-center mb-3 border-2"
                  style={{
                    borderColor: conn.color,
                    backgroundColor: `${conn.color}15`,
                  }}
                >
                  <Icon className="w-6 h-6" style={{ color: conn.color }} />
                </div>

                {/* Weapon Name */}
                <h3
                  className="font-[Press_Start_2P] text-[8px] mb-1 uppercase tracking-wider"
                  style={{ color: conn.color }}
                >
                  {conn.weaponName}
                </h3>
                <p className="text-[10px] text-[#888] mb-3 font-[VT323] leading-relaxed uppercase">
                  {conn.description}
                </p>

                {/* Ammo / Features */}
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[8px] font-[Press_Start_2P] text-[#666]">
                      AMMO
                    </span>
                    <span className="text-[10px] font-[VT323] text-white">
                      {conn.stats.ammo}
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#111] border border-[#333]">
                    <div
                      className="h-full"
                      style={{
                        width: "100%",
                        backgroundColor: conn.color,
                      }}
                    />
                  </div>
                </div>

                {/* Stats Overlay on Hover / Select */}
                {(isHovered || isSelected) && (
                  <div className="mb-3 p-2 bg-[#0f0f0f] border border-[#333]">
                    <StatBar
                      label="DMG"
                      value={conn.stats.damage}
                      color={conn.color}
                      icon={Crosshair}
                    />
                    <StatBar
                      label="RNG"
                      value={conn.stats.range}
                      color={conn.color}
                      icon={Target}
                    />
                    <StatBar
                      label="FR"
                      value={conn.stats.fireRate}
                      color={conn.color}
                      icon={Zap}
                    />
                  </div>
                )}

                {/* Feature tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {conn.features.map((f) => (
                    <span
                      key={f}
                      className="text-[7px] px-1.5 py-0.5 border font-[Press_Start_2P]"
                      style={{
                        color: conn.color,
                        borderColor: `${conn.color}40`,
                        backgroundColor: `${conn.color}10`,
                      }}
                    >
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
                        className="flex-1 pixel-btn pixel-btn-red text-[6px] py-2 flex items-center justify-center gap-1"
                      >
                        {isSyncing ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3 h-3" />
                        )}
                        {isSyncing ? "SYNCING..." : "SYNC"}
                      </button>
                    )}
                    <button
                      onClick={() => handleDisconnect(conn.provider)}
                      className="pixel-btn pixel-btn-ghost text-[6px] py-2"
                    >
                      UNEQUIP
                    </button>
                  </div>
                ) : isOAuth ? (
                  <button
                    onClick={() => handleOAuthConnect(conn.provider)}
                    disabled={isLoading}
                    className="w-full pixel-btn text-[6px] py-2 flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: conn.color,
                      borderColor: conn.color,
                      color: "#fff",
                    }}
                  >
                    {isLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <ExternalLink className="w-3 h-3" />
                    )}
                    {isLoading ? "LINKING..." : "EQUIP"}
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveModal(conn.id)}
                    className="w-full pixel-btn text-[6px] py-2"
                    style={{
                      backgroundColor: conn.color,
                      borderColor: conn.color,
                      color: "#fff",
                    }}
                  >
                    {conn.id === "demo-dataset" ? "LOAD SIM" : "EQUIP"}
                  </button>
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
            className="glass-panel max-w-md w-full p-6 border-red-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="pixel-heading text-[10px] text-white">
                EQUIP {activeConnector.weaponName}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-[#666666] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-[#a0a0a0] mb-4">
              {activeConnector.description}
            </p>
            <div className="p-4 mb-4 bg-yellow-400/5 border-4 border-yellow-400/15">
              <h4 className="text-[8px] font-[Press_Start_2P] text-red-500 uppercase tracking-wider mb-2">
                Permission Required
              </h4>
              <p className="text-xs text-[#a0a0a0]">
                I consent to QyntraWiki accessing my {activeConnector.name}{" "}
                data for building my personal wiki.
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
                className="mt-0.5 w-4 h-4 accent-red-500"
              />
              <label
                htmlFor="consent"
                className="text-xs text-[#a0a0a0] leading-relaxed"
              >
                I consent to QyntraWiki accessing my {activeConnector.name}{" "}
                data.
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
              {activeConnector.id === "demo-dataset"
                ? "LOAD SIM"
                : `EQUIP ${activeConnector.weaponName}`}
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
