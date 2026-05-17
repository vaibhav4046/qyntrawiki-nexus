"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";

interface ConnectorCard {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: "available" | "connected" | "permission_required";
  permissionText: string;
  actionLabel: string;
  color: string;
  features: string[];
}

const connectors: ConnectorCard[] = [
  {
    id: "local-folder",
    name: "Local Folder",
    description: "Select a folder and build a private wiki from local files. Browser permission required.",
    icon: FolderOpen,
    status: "available",
    permissionText: "Browser File System Access API permission",
    actionLabel: "Connect Folder",
    color: "from-amber-500 to-orange-600",
    features: [".txt", ".md", ".json", ".csv", ".html"],
  },
  {
    id: "google-drive",
    name: "Google Drive",
    description: "Import docs, PDFs, notes, and files from Drive. OAuth or manual export mode.",
    icon: HardDrive,
    status: "available",
    permissionText: "OAuth consent or manual file export",
    actionLabel: "Connect Drive",
    color: "from-blue-500 to-indigo-600",
    features: ["Docs", "Sheets", "PDFs", "Slides"],
  },
  {
    id: "notion",
    name: "Notion",
    description: "Import pages and databases into your personal wiki. Integration token or export upload.",
    icon: NotepadText,
    status: "connected",
    permissionText: "Integration token (session-only mode)",
    actionLabel: "Connect Notion",
    color: "from-gray-500 to-slate-600",
    features: ["Pages", "Databases", "Blocks"],
  },
  {
    id: "linkedin",
    name: "LinkedIn Export",
    description: "Import profile, posts, saved text, job notes, and exported archive files.",
    icon: Briefcase,
    status: "available",
    permissionText: "Export Import Mode — upload your LinkedIn archive",
    actionLabel: "Import LinkedIn Data",
    color: "from-blue-600 to-blue-800",
    features: ["Profile", "Posts", "Connections"],
  },
  {
    id: "instagram",
    name: "Instagram Export",
    description: "Import captions, saved reels notes, copied transcripts, or export files.",
    icon: Camera,
    status: "available",
    permissionText: "Export Import Mode — upload your Instagram archive",
    actionLabel: "Import Instagram Data",
    color: "from-pink-500 to-purple-600",
    features: ["Captions", "Stories", "Reels"],
  },
  {
    id: "manual-url",
    name: "Manual URL",
    description: "Add a webpage or article by URL. The app will fetch and index the content.",
    icon: LinkIcon,
    status: "available",
    permissionText: "No special permission needed",
    actionLabel: "Add URL",
    color: "from-emerald-500 to-teal-600",
    features: ["Webpages", "Articles", "Docs"],
  },
  {
    id: "manual-text",
    name: "Manual Paste",
    description: "Paste raw text, notes, or copied content directly into your wiki.",
    icon: Upload,
    status: "available",
    permissionText: "No special permission needed",
    actionLabel: "Paste Text",
    color: "from-violet-500 to-purple-600",
    features: ["Raw text", "Notes", "Snippets"],
  },
  {
    id: "demo-dataset",
    name: "Demo Dataset",
    description: "Load a polished AI Agent Memory Encyclopedia demo with sample sources, pages, and contradictions.",
    icon: Database,
    status: "connected",
    permissionText: "No permission needed — public demo data",
    actionLabel: "Load Demo",
    color: "from-orange-500 to-red-600",
    features: ["7 sources", "8 pages", "Graph", "Contradictions"],
  },
];

export default function ConnectPage() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [consentGiven, setConsentGiven] = useState<Record<string, boolean>>({});

  const activeConnector = connectors.find((c) => c.id === activeModal);

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="px-6 sm:px-8 lg:px-10 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-[#f5f5f5]">Permission Center</h1>
        <p className="mt-1 text-sm text-[#a0a0a0]">
          Connect your sources with permission-first data import
        </p>
      </div>

      <div className="px-6 sm:px-8 lg:px-10 pb-10">
        {/* Trust banner */}
        <div className="glass-panel rounded-lg p-4 mb-8 flex items-center gap-3">
          <Shield className="w-5 h-5 text-[#ffeb3b] shrink-0" />
          <div>
            <p className="text-sm font-medium text-[#f5f5f5]">Permission-First Architecture</p>
            <p className="text-xs text-[#a0a0a0]">
              QyntraWiki never silently accesses your data. Every connector requires explicit consent. For restricted APIs (LinkedIn, Instagram), we only support export-import mode.
            </p>
          </div>
        </div>

        {/* Connector grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {connectors.map((conn, idx) => {
            const Icon = conn.icon;
            const isConnected = conn.status === "connected";
            return (
              <motion.div
                key={conn.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={cn(
                  "connector-card rounded-lg p-5 relative overflow-hidden",
                  isConnected && "connector-card.connected"
                )}
              >
                {/* Status badge */}
                <div className="absolute top-3 right-3">
                  {isConnected ? (
                    <span className="badge badge-green">
                      <Check className="w-3 h-3" /> Connected
                    </span>
                  ) : (
                    <span className="badge badge-amber">
                      <AlertCircle className="w-3 h-3" /> Available
                    </span>
                  )}
                </div>

                {/* Icon */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-gradient-to-br",
                    conn.color
                  )}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-sm font-bold text-[#f5f5f5] mb-1">{conn.name}</h3>
                <p className="text-xs text-[#a0a0a0] mb-4 leading-relaxed">{conn.description}</p>

                {/* Features */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {conn.features.map((f) => (
                    <span
                      key={f}
                      className="text-[10px] px-2 py-0.5 bg-[rgba(255,235,59,0.1)] text-[#ffeb3b] rounded"
                    >
                      {f}
                    </span>
                  ))}
                </div>

                {/* Permission text */}
                <div className="flex items-start gap-2 mb-4 p-2.5 rounded bg-[rgba(107,101,96,0.08)]">
                  <Shield className="w-3.5 h-3.5 text-[#666666] mt-0.5 shrink-0" />
                  <p className="text-[10px] text-[#666666] leading-relaxed">{conn.permissionText}</p>
                </div>

                {/* Action */}
                <button
                  onClick={() => setActiveModal(conn.id)}
                  className={cn(
                    "w-full py-2.5 text-xs font-bold uppercase tracking-wider rounded transition-all",
                    isConnected
                      ? "bg-[rgba(34,197,94,0.15)] text-green-400 hover:bg-[rgba(34,197,94,0.25)]"
                      : "btn-primary"
                  )}
                >
                  {isConnected ? "Manage" : conn.actionLabel}
                </button>
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
            className="glass-panel rounded-lg max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#f5f5f5]">
                Connect {activeConnector.name}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-[#666666] hover:text-[#f5f5f5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-[#a0a0a0] mb-4">{activeConnector.description}</p>

            <div className="p-4 rounded-lg bg-[rgba(255,235,59,0.05)] border border-[rgba(255,235,59,0.15)] mb-4">
              <h4 className="text-xs font-bold text-[#ffeb3b] uppercase tracking-wider mb-2">
                Permission Required
              </h4>
              <p className="text-xs text-[#a0a0a0]">{activeConnector.permissionText}</p>
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
              className={cn(
                "w-full py-3 text-xs font-bold uppercase tracking-wider rounded transition-all flex items-center justify-center gap-2",
                consentGiven[activeConnector.id]
                  ? "btn-primary"
                  : "bg-[rgba(107,101,96,0.2)] text-[#666666] cursor-not-allowed"
              )}
            >
              {activeConnector.actionLabel}
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
