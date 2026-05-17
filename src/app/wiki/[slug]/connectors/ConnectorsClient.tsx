"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  FileText,
  Cloud,
  Brain,
  GitBranch,
  Sparkles,
  Sheet,
  FileType,
  Code,
  Plug,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2,
  Upload,
  Eye,
  EyeOff,
  Unlink,
  Zap,
  Link,
  Image,
  AtSign,
  BookOpen,
  Globe,
  FolderOpen,
  Database,
} from "lucide-react";
import { Connector } from "../../../api/wiki/[slug]/connectors/route";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  MessageSquare,
  FileText,
  Cloud,
  Brain,
  GitBranch,
  Sparkles,
  Sheet,
  FileType,
  Code,
  Linkedin: Link,
  Instagram: Image,
  Twitter: AtSign,
  BookMarked: BookOpen,
  Globe,
  FolderOpen,
  Database,
};

interface ConnectorsClientProps {
  wikiName: string;
  slug: string;
  initialConnectors: Connector[];
}

export function ConnectorsClient({ wikiName, slug, initialConnectors }: ConnectorsClientProps) {
  const [connectors, setConnectors] = useState<Connector[]>(initialConnectors);
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());
  const [connectingIds, setConnectingIds] = useState<Set<string>>(new Set());
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File[]>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleConnect = useCallback(
    async (connector: Connector) => {
      if (connector.type === "oauth") {
        setConnectingIds((prev) => new Set(prev).add(connector.id));
        // Simulate OAuth flow
        await new Promise((r) => setTimeout(r, 2000));
        setConnectors((prev) =>
          prev.map((c) =>
            c.id === connector.id
              ? { ...c, connected: true, lastSyncedAt: new Date().toISOString() }
              : c
          )
        );
        setConnectingIds((prev) => {
          const next = new Set(prev);
          next.delete(connector.id);
          return next;
        });
      } else if (connector.type === "apikey") {
        const key = apiKeys[connector.id];
        if (!key || key.trim().length < 8) return;
        setConnectingIds((prev) => new Set(prev).add(connector.id));
        await new Promise((r) => setTimeout(r, 1500));
        setConnectors((prev) =>
          prev.map((c) =>
            c.id === connector.id
              ? { ...c, connected: true, apiKey: key, lastSyncedAt: new Date().toISOString() }
              : c
          )
        );
        setConnectingIds((prev) => {
          const next = new Set(prev);
          next.delete(connector.id);
          return next;
        });
      }
    },
    [apiKeys]
  );

  const handleDisconnect = useCallback(async (connector: Connector) => {
    setConnectingIds((prev) => new Set(prev).add(connector.id));
    await new Promise((r) => setTimeout(r, 1000));
    setConnectors((prev) =>
      prev.map((c) =>
        c.id === connector.id
          ? { ...c, connected: false, lastSyncedAt: null, apiKey: undefined }
          : c
      )
    );
    setConnectingIds((prev) => {
      const next = new Set(prev);
      next.delete(connector.id);
      return next;
    });
  }, []);

  const handleSync = useCallback(async (connector: Connector) => {
    if (!connector.connected) return;
    setSyncingIds((prev) => new Set(prev).add(connector.id));
    await new Promise((r) => setTimeout(r, 2500));
    setConnectors((prev) =>
      prev.map((c) =>
        c.id === connector.id ? { ...c, lastSyncedAt: new Date().toISOString() } : c
      )
    );
    setSyncingIds((prev) => {
      const next = new Set(prev);
      next.delete(connector.id);
      return next;
    });
  }, []);

  const handleFileDrop = useCallback(
    (e: React.DragEvent, connectorId: string) => {
      e.preventDefault();
      setDragOverId(null);
      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;
      setUploadedFiles((prev) => ({
        ...prev,
        [connectorId]: [...(prev[connectorId] || []), ...files],
      }));
      setConnectors((prev) =>
        prev.map((c) =>
          c.id === connectorId
            ? { ...c, connected: true, lastSyncedAt: new Date().toISOString() }
            : c
        )
      );
    },
    []
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, connectorId: string) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;
      setUploadedFiles((prev) => ({
        ...prev,
        [connectorId]: [...(prev[connectorId] || []), ...files],
      }));
      setConnectors((prev) =>
        prev.map((c) =>
          c.id === connectorId
            ? { ...c, connected: true, lastSyncedAt: new Date().toISOString() }
            : c
        )
      );
    },
    []
  );

  const formatLastSynced = (iso: string | null) => {
    if (!iso) return "Never synced";
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.97 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 200, damping: 20 } },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-sm bg-[rgba(0,229,255,0.1)] flex items-center justify-center border border-[rgba(0,229,255,0.2)]">
            <Plug className="w-5 h-5 text-[#00b4d8]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Connectors</h1>
            <p className="text-sm text-[#6b5b8a]">
              Manage integrations for <span className="text-[#e8d5f7] font-medium">{wikiName}</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="flex items-center gap-4"
      >
        <div className="jules-card px-4 py-2.5 flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-[#00b4d8] animate-pulse" />
          <span className="text-sm font-medium">
            {connectors.filter((c) => c.connected).length} Connected
          </span>
        </div>
        <div className="jules-card px-4 py-2.5 flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-[#6b5b8a]/50" />
          <span className="text-sm text-[#6b5b8a]">
            {connectors.filter((c) => !c.connected).length} Available
          </span>
        </div>
        {syncingIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="jules-card px-4 py-2.5 flex items-center gap-2.5 border-[rgba(0,229,255,0.3)]"
          >
            <Loader2 className="w-3.5 h-3.5 text-[#00b4d8] animate-spin" />
            <span className="text-sm font-medium text-[#00b4d8]">{syncingIds.size} syncing</span>
          </motion.div>
        )}
      </motion.div>

      {/* Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
      >
        {connectors.map((connector) => {
          const Icon = iconMap[connector.icon] || Plug;
          const isSyncing = syncingIds.has(connector.id);
          const isConnecting = connectingIds.has(connector.id);
          const isConnected = connector.connected;

          return (
            <motion.div key={connector.id} variants={cardVariants} layout>
              <Card
                className={cn(
                  "relative overflow-hidden transition-all duration-500",
                  isConnected
                    ? "glass-strong border-[rgba(0,229,255,0.3)] shadow-[0_0_30px_rgba(0,229,255,0.08)]"
                    : "jules-card hover:border-[rgba(0,229,255,0.25)]"
                )}
              >
                {/* Gradient border overlay when connected */}
                {isConnected && (
                  <div className="absolute inset-0 rounded-sm pointer-events-none p-[1px]">
                    <div className="absolute inset-0 rounded-sm bg-gradient-to-br from-[rgba(0,229,255,0.3)] via-transparent to-[rgba(0,229,255,0.1)] opacity-50" />
                  </div>
                )}

                <CardHeader className="pb-3 relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ rotate: 5, scale: 1.05 }}
                        className={cn(
                          "w-10 h-10 rounded-sm flex items-center justify-center shrink-0 border",
                          isConnected
                            ? "bg-[rgba(0,229,255,0.2)] border-[rgba(0,229,255,0.3)] text-[#00b4d8]"
                            : "bg-muted/50 border-border text-[#6b5b8a]"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </motion.div>
                      <div>
                        <CardTitle className="text-base font-semibold">{connector.name}</CardTitle>
                        <CardDescription className="text-xs mt-0.5 leading-relaxed text-[#6b5b8a]">
                          {connector.description}
                        </CardDescription>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0 ml-2">
                      {isSyncing ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(0,229,255,0.1)] px-2.5 py-1 text-xs font-medium text-[#00b4d8] border border-[rgba(0,229,255,0.2)]">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00b4d8] opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00b4d8]" />
                          </span>
                          Syncing
                        </span>
                      ) : isConnected ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(0,229,255,0.1)] px-2.5 py-1 text-xs font-medium text-[#00b4d8] border border-[rgba(0,229,255,0.2)]">
                          <CheckCircle2 className="w-3 h-3" />
                          Connected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-1 text-xs font-medium text-[#6b5b8a] border border-border">
                          <XCircle className="w-3 h-3" />
                          Disconnected
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 relative z-10">
                  {/* Connector-specific UI */}
                  {connector.type === "apikey" && (
                    <div className="space-y-2">
                      {!isConnected ? (
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <input
                              type={showKeys[connector.id] ? "text" : "password"}
                              placeholder="Enter API key..."
                              value={apiKeys[connector.id] || ""}
                              onChange={(e) =>
                                setApiKeys((prev) => ({ ...prev, [connector.id]: e.target.value }))
                              }
                              className="w-full h-9 rounded-sm border border-input bg-background/50 px-3 pr-9 text-sm placeholder:text-[#6b5b8a] focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowKeys((prev) => ({
                                  ...prev,
                                  [connector.id]: !prev[connector.id],
                                }))
                              }
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6b5b8a] hover:text-[#e8d5f7] transition-colors"
                            >
                              {showKeys[connector.id] ? (
                                <EyeOff className="w-3.5 h-3.5" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleConnect(connector)}
                            disabled={isConnecting || !apiKeys[connector.id]?.trim()}
                            className="jules-btn h-9 px-3"
                          >
                            {isConnecting ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <>
                                <Plug className="w-3.5 h-3.5 mr-1.5" />
                                Connect
                              </>
                            )}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 rounded-sm border border-border bg-muted/30 px-3 py-2">
                          <Zap className="w-3.5 h-3.5 text-[#00b4d8]" />
                          <span className="text-xs font-mono text-[#6b5b8a] truncate flex-1">
                            {connector.apiKey || "Key saved"}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {connector.type === "file" && (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOverId(connector.id);
                      }}
                      onDragLeave={() => setDragOverId(null)}
                      onDrop={(e) => handleFileDrop(e, connector.id)}
                      onClick={() => fileInputRefs.current[connector.id]?.click()}
                      className={cn(
                        "relative rounded-sm border-2 border-dashed transition-all duration-300 cursor-pointer",
                        dragOverId === connector.id
                          ? "border-[#00b4d8] bg-[rgba(0,229,255,0.1)] scale-[1.02]"
                          : isConnected
                          ? "border-[rgba(0,229,255,0.3)] bg-[rgba(0,229,255,0.05)] hover:border-[rgba(0,229,255,0.5)]"
                          : "border-border bg-muted/20 hover:border-[rgba(0,229,255,0.3)] hover:bg-[rgba(0,229,255,0.05)]"
                      )}
                    >
                      <input
                        ref={(el) => {
                          fileInputRefs.current[connector.id] = el;
                        }}
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFileInput(e, connector.id)}
                        multiple
                      />
                      <div className="flex flex-col items-center justify-center py-5 px-4 text-center">
                        <motion.div
                          animate={dragOverId === connector.id ? { y: -4 } : { y: 0 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Upload
                            className={cn(
                              "w-6 h-6 mb-2",
                              dragOverId === connector.id ? "text-[#00b4d8]" : "text-[#6b5b8a]"
                            )}
                          />
                        </motion.div>
                        <p className="text-xs font-medium text-[#e8d5f7]">
                          {dragOverId === connector.id
                            ? "Drop files here"
                            : "Click or drag files to upload"}
                        </p>
                        <p className="text-[10px] text-[#6b5b8a] mt-0.5">
                          Supports multiple files
                        </p>
                      </div>
                    </div>
                  )}

                  {connector.type === "oauth" && !isConnected && (
                    <Button
                      className="jules-btn w-full h-9"
                      onClick={() => handleConnect(connector)}
                      disabled={isConnecting}
                    >
                      {isConnecting ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Plug className="w-4 h-4 mr-2" />
                      )}
                      {isConnecting ? "Connecting..." : "Connect Account"}
                    </Button>
                  )}

                  {/* Uploaded files for file connectors */}
                  {connector.type === "file" &&
                    uploadedFiles[connector.id] &&
                    uploadedFiles[connector.id].length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-1.5"
                      >
                        {uploadedFiles[connector.id].map((file, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 rounded-sm border border-border bg-muted/30 px-2.5 py-1.5"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#00b4d8] shrink-0" />
                            <span className="text-xs truncate flex-1">{file.name}</span>
                            <span className="text-[10px] text-[#6b5b8a] shrink-0">
                              {(file.size / 1024).toFixed(0)} KB
                            </span>
                          </div>
                        ))}
                      </motion.div>
                    )}

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      {isConnected && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="jules-btn h-8 text-xs gap-1.5 px-2.5 hover:bg-[rgba(0,229,255,0.1)] hover:text-[#00b4d8]"
                          onClick={() => handleSync(connector)}
                          disabled={isSyncing}
                        >
                          <RefreshCw
                            className={cn("w-3.5 h-3.5", isSyncing && "animate-spin")}
                          />
                          {isSyncing ? "Syncing..." : "Sync"}
                        </Button>
                      )}
                      {isConnected && connector.type !== "file" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="jules-btn h-8 text-xs gap-1.5 px-2.5 text-[#6b5b8a] hover:text-[#00b4d8] hover:bg-[rgba(0,229,255,0.1)]"
                          onClick={() => handleDisconnect(connector)}
                          disabled={isConnecting}
                        >
                          <Unlink className="w-3.5 h-3.5" />
                          Disconnect
                        </Button>
                      )}
                    </div>

                    {isConnected && (
                      <span className="text-[11px] text-[#6b5b8a] tabular-nums">
                        {formatLastSynced(connector.lastSyncedAt)}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Empty state */}
      {connectors.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
            <Plug className="w-8 h-8 text-[#6b5b8a]" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No connectors available</h3>
          <p className="text-sm text-[#6b5b8a] max-w-sm">
            There are no integrations configured for this wiki yet.
          </p>
        </motion.div>
      )}
    </div>
  );
}
