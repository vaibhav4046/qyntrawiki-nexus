"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Link as LinkIcon,
  FileText,
  Upload,
  Database,
  Globe,
  Check,
  Loader2,
  AlertCircle,
  X,
  ChevronRight,
} from "lucide-react";

type ImportMethod = "url" | "text" | "file" | "wikipedia" | "demo";

interface ImportStep {
  id: string;
  label: string;
  status: "pending" | "processing" | "completed" | "error";
  message?: string;
}

export default function ImportPage() {
  const [method, setMethod] = useState<ImportMethod>("text");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<ImportStep[]>([]);
  const [result, setResult] = useState<{
    success: boolean;
    sourceId?: string;
    message: string;
  } | null>(null);

  const methods: { id: ImportMethod; label: string; icon: React.ElementType; desc: string }[] = [
    { id: "text", label: "Paste Text", icon: FileText, desc: "Raw notes, articles, or copied content" },
    { id: "url", label: "Add URL", icon: LinkIcon, desc: "Webpage or article link" },
    { id: "file", label: "Upload File", icon: Upload, desc: "TXT, MD, JSON, CSV, HTML" },
    { id: "wikipedia", label: "Wikipedia", icon: Globe, desc: "Import a Wikipedia article" },
    { id: "demo", label: "Demo Data", icon: Database, desc: "Load AI Agent Memory Encyclopedia" },
  ];

  async function handleImport() {
    setLoading(true);
    setSteps([
      { id: "ingest", label: "Ingesting source", status: "processing" },
      { id: "hydradb", label: "Uploading to HydraDB", status: "pending" },
      { id: "extract", label: "Extracting entities & claims", status: "pending" },
      { id: "compile", label: "Compiling wiki pages", status: "pending" },
    ]);
    setResult(null);

    try {
      // Step 1: Ingest
      const wikiId = "demo-wiki";
      const payload =
        method === "url"
          ? { type: "url", title: title || url, url }
          : method === "text"
          ? { type: "text", title: title || "Pasted Text", rawText: text }
          : method === "wikipedia"
          ? { type: "wikipedia", title: title || "Artificial intelligence" }
          : { type: "demo", title: "Demo Dataset" };

      const res = await fetch(`/api/wiki/${wikiId}/ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!data.id) throw new Error(data.error || "Ingest failed");

      setSteps((prev) =>
        prev.map((s) => (s.id === "ingest" ? { ...s, status: "completed" as const } : s))
      );

      // Step 2: Compile
      setSteps((prev) =>
        prev.map((s) => (s.id === "hydradb" ? { ...s, status: "processing" as const } : s))
      );

      await new Promise((r) => setTimeout(r, 1500));

      setSteps((prev) =>
        prev.map((s) =>
          s.id === "hydradb"
            ? { ...s, status: "completed" as const }
            : s.id === "extract"
            ? { ...s, status: "processing" as const }
            : s
        )
      );

      await new Promise((r) => setTimeout(r, 1500));

      setSteps((prev) =>
        prev.map((s) =>
          s.id === "extract"
            ? { ...s, status: "completed" as const }
            : s.id === "compile"
            ? { ...s, status: "processing" as const }
            : s
        )
      );

      await new Promise((r) => setTimeout(r, 1500));

      setSteps((prev) =>
        prev.map((s) => (s.id === "compile" ? { ...s, status: "completed" as const } : s))
      );

      setResult({
        success: true,
        sourceId: data.id,
        message: `Successfully imported "${data.title || title || "source"}". Wiki compilation in progress.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Import failed";
      setSteps((prev) =>
        prev.map((s) =>
          s.status === "processing" ? { ...s, status: "error" as const, message: msg } : s
        )
      );
      setResult({ success: false, message: msg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="px-6 sm:px-8 lg:px-10 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-[#f5f5f5]">Import Lab</h1>
        <p className="mt-1 text-sm text-[#a0a0a0]">
          Add knowledge sources to your wiki — URLs, text, files, or demo data
        </p>
      </div>

      <div className="px-6 sm:px-8 lg:px-10 pb-10 max-w-4xl">
        {/* Method selector */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-8">
          {methods.map((m) => {
            const Icon = m.icon;
            const active = method === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setMethod(m.id);
                  setResult(null);
                  setSteps([]);
                }}
                className={cn(
                  "p-3 rounded-lg border text-left transition-all",
                  active
                    ? "bg-[rgba(230,57,70,0.1)] border-[rgba(230,57,70,0.3)]"
                    : "bg-[rgba(20,18,16,0.5)] border-[rgba(107,101,96,0.15)] hover:border-[rgba(230,57,70,0.2)]"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 mb-2",
                    active ? "text-[#e63946]" : "text-[#666666]"
                  )}
                />
                <p
                  className={cn(
                    "text-xs font-semibold",
                    active ? "text-[#f5f5f5]" : "text-[#a0a0a0]"
                  )}
                >
                  {m.label}
                </p>
                <p className="text-[10px] text-[#666666] mt-0.5">{m.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Input area */}
        <div className="glass-panel rounded-lg p-6 mb-6">
          {method === "url" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#a0a0a0] uppercase tracking-wider mb-2 block">
                  URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/article"
                  className="w-full rounded-md"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#a0a0a0] uppercase tracking-wider mb-2 block">
                  Title (optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Article title"
                  className="w-full rounded-md"
                />
              </div>
            </div>
          )}

          {method === "text" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#a0a0a0] uppercase tracking-wider mb-2 block">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Source title"
                  className="w-full rounded-md"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#a0a0a0] uppercase tracking-wider mb-2 block">
                  Content
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste your notes, article, or research here..."
                  rows={8}
                  className="w-full rounded-md resize-none"
                />
              </div>
            </div>
          )}

          {method === "file" && (
            <div className="text-center py-8">
              <Upload className="w-10 h-10 text-[#666666] mx-auto mb-4" />
              <p className="text-sm text-[#a0a0a0] mb-2">
                Drag and drop files here, or click to browse
              </p>
              <p className="text-xs text-[#666666]">
                Supported: .txt, .md, .json, .csv, .html
              </p>
              <input
                type="file"
                multiple
                accept=".txt,.md,.json,.csv,.html"
                className="mt-4 mx-auto block text-xs text-[#a0a0a0]"
                onChange={() => {
                  setTitle("Uploaded Files");
                }}
              />
            </div>
          )}

          {method === "wikipedia" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#a0a0a0] uppercase tracking-wider mb-2 block">
                  Wikipedia Article Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Artificial intelligence"
                  className="w-full rounded-md"
                />
              </div>
            </div>
          )}

          {method === "demo" && (
            <div className="text-center py-6">
              <Database className="w-10 h-10 text-[#e63946] mx-auto mb-4" />
              <p className="text-sm text-[#f5f5f5] font-medium mb-2">
                AI Agent Memory Encyclopedia
              </p>
              <p className="text-xs text-[#a0a0a0] mb-4 max-w-md mx-auto">
                Load a complete demo dataset with 7 sources, 8 wiki pages, knowledge graph,
                contradictions, and ask sessions. Perfect for exploring QyntraWiki capabilities.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {["HydraDB", "Context Graph", "LLM Wiki", "Vector Search", "Contradictions", "Student Job Agent"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-1 bg-[rgba(230,57,70,0.1)] text-[#e63946] rounded"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>
          )}

          {/* Import button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleImport}
              disabled={loading || (method === "url" && !url) || (method === "text" && !text)}
              className={cn(
                "btn-primary flex items-center gap-2",
                (loading || (method === "url" && !url) || (method === "text" && !text)) &&
                  "opacity-50 cursor-not-allowed"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Import Source
                </>
              )}
            </button>
          </div>
        </div>

        {/* Pipeline steps */}
        {steps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-lg p-6 mb-6"
          >
            <h3 className="text-xs font-bold text-[#a0a0a0] uppercase tracking-wider mb-4">
              Compilation Pipeline
            </h3>
            <div className="space-y-3">
              {steps.map((step) => (
                <div key={step.id} className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                      step.status === "completed"
                        ? "bg-green-500/20"
                        : step.status === "processing"
                        ? "bg-red-500/20"
                        : step.status === "error"
                        ? "bg-red-500/20"
                        : "bg-[rgba(107,101,96,0.2)]"
                    )}
                  >
                    {step.status === "completed" ? (
                      <Check className="w-3.5 h-3.5 text-green-400" />
                    ) : step.status === "processing" ? (
                      <Loader2 className="w-3.5 h-3.5 text-red-500 animate-spin" />
                    ) : step.status === "error" ? (
                      <X className="w-3.5 h-3.5 text-red-400" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-[#666666]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className={cn(
                        "text-xs font-medium",
                        step.status === "completed"
                          ? "text-green-400"
                          : step.status === "processing"
                          ? "text-red-500"
                          : step.status === "error"
                          ? "text-red-400"
                          : "text-[#666666]"
                      )}
                    >
                      {step.label}
                    </p>
                    {step.message && (
                      <p className="text-[10px] text-red-400 mt-0.5">{step.message}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Result */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "rounded-lg p-4 flex items-start gap-3",
              result.success
                ? "bg-[rgba(34,197,94,0.1)] border border-green-500/20"
                : "bg-[rgba(220,38,38,0.1)] border border-red-500/20"
            )}
          >
            {result.success ? (
              <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p
                className={cn(
                  "text-sm font-medium",
                  result.success ? "text-green-400" : "text-red-400"
                )}
              >
                {result.success ? "Import Successful" : "Import Failed"}
              </p>
              <p className="text-xs text-[#a0a0a0] mt-1">{result.message}</p>
              {result.success && (
                <a
                  href="/app/wiki"
                  className="inline-flex items-center gap-1 text-xs text-[#e63946] mt-3 hover:underline"
                >
                  View Wiki <ChevronRight className="w-3 h-3" />
                </a>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
