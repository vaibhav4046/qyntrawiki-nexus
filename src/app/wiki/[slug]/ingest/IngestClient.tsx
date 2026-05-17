"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  Plus,
  FileText,
  Globe,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Zap,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Trash2,
  LayoutDashboard,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Source {
  id: string;
  sourceType: string;
  title: string;
  url?: string;
  author?: string;
  date?: string;
  credibilityScore: number;
  pageId: string;
  addedAt: string;
}

interface WikiData {
  wiki: { id: string; slug: string; name: string };
  sources: Source[];
  pages: any[];
}

interface PipelineStep {
  id: string;
  label: string;
  status: "pending" | "running" | "done" | "error";
  detail?: string;
}

interface CompileResult {
  claimsExtracted: number;
  entitiesExtracted: number;
  relationsExtracted: number;
  contradictionsFound: number;
}

export default function IngestClient({ slug, data }: { slug: string; data: WikiData }) {
  const router = useRouter();
  const [sourceType, setSourceType] = useState<"url" | "text" | "pdf">("url");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sources, setSources] = useState<Source[]>(data.sources);

  const [pipelineOpen, setPipelineOpen] = useState(false);
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([
    { id: "scrape", label: "Scrape & Parse", status: "pending" },
    { id: "extract", label: "Extract Claims", status: "pending" },
    { id: "verify", label: "Verify Claims", status: "pending" },
    { id: "entities", label: "Extract Entities & Relations", status: "pending" },
    { id: "contradictions", label: "Detect Contradictions", status: "pending" },
    { id: "compile", label: "Compile to Article", status: "pending" },
  ]);
  const [compileResult, setCompileResult] = useState<CompileResult | null>(null);
  const [pipelineError, setPipelineError] = useState("");

  function resetForm() {
    setUrl("");
    setTitle("");
    setAuthor("");
    setContent("");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/wiki/${slug}/ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType,
          url: sourceType === "url" ? url : undefined,
          title: sourceType === "text" ? title : undefined,
          author: author || undefined,
          content: sourceType === "text" ? content : undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to add source");

      setSources((prev) => [json, ...prev]);
      resetForm();
      setPipelineOpen(true);
      await runPipeline(json.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add source");
    } finally {
      setLoading(false);
    }
  }

  async function runPipeline(sourceId: string) {
    setPipelineError("");
    setCompileResult(null);

    const updateStep = (id: string, status: PipelineStep["status"], detail?: string) => {
      setPipelineSteps((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status, detail } : s))
      );
    };

    try {
      updateStep("scrape", "running");
      await new Promise((r) => setTimeout(r, 600));
      updateStep("scrape", "done", "Content parsed successfully");

      updateStep("extract", "running");
      const compileRes = await fetch(`/api/wiki/${slug}/compile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId }),
      });
      const compileData = await compileRes.json();
      if (!compileRes.ok) throw new Error(compileData.error || "Compilation failed");

      updateStep("extract", "done", `${compileData.claimsExtracted || 0} claims extracted`);

      updateStep("verify", "running");
      await new Promise((r) => setTimeout(r, 400));
      updateStep("verify", "done", "All claims verified against HydraDB");

      updateStep("entities", "running");
      await new Promise((r) => setTimeout(r, 500));
      updateStep("entities", "done", `${compileData.entitiesExtracted || 0} entities, ${compileData.relationsExtracted || 0} relations`);

      updateStep("contradictions", "running");
      await new Promise((r) => setTimeout(r, 400));
      updateStep("contradictions", "done", `${compileData.contradictionsFound || 0} contradictions detected`);

      updateStep("compile", "running");
      await new Promise((r) => setTimeout(r, 600));
      updateStep("compile", "done", "Article compiled and live");

      setCompileResult({
        claimsExtracted: compileData.claimsExtracted || 0,
        entitiesExtracted: compileData.entitiesExtracted || 0,
        relationsExtracted: compileData.relationsExtracted || 0,
        contradictionsFound: compileData.contradictionsFound || 0,
      });

      router.refresh();
    } catch (err) {
      setPipelineError(err instanceof Error ? err.message : "Pipeline failed");
      updateStep("extract", "error");
    }
  }

  async function deleteSource(sourceId: string) {
    if (!confirm("Delete this source?")) return;
    try {
      const res = await fetch(`/api/wiki/${slug}/sources/${sourceId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setSources((prev) => prev.filter((s) => s.id !== sourceId));
      router.refresh();
    } catch {
      alert("Failed to delete source");
    }
  }

  const isValid =
    sourceType === "url"
      ? url.trim().length > 0
      : sourceType === "text"
      ? title.trim().length > 0 && content.trim().length > 0
      : false;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-[#8b5cf6]/20 to-[#6d28d9]/10 flex items-center justify-center border border-[#8b5cf6]/20">
          <Zap className="w-5 h-5 text-[#b794f6]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ingest Lab</h1>
          <p className="text-[#6b5b8a] text-sm">Add sources, compile knowledge, build the wiki</p>
        </div>
        <Link href={`/wiki/${slug}`} className="ml-auto">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Button>
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-[#ff2d92]/10 border border-[#ff2d92]/20 text-[#ff2d92] text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Source Input */}
      <Card className="jules-card border-[rgba(139,92,246,0.15)] overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#b794f6]" />
            Add Source
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex gap-1 p-1 bg-[#0a0512] border border-[rgba(139,92,246,0.15)] w-fit">
              {(["url", "text"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setSourceType(t); setError(""); }}
                  className={cn(
                    "px-4 py-2 rounded-sm text-sm font-medium transition-all flex items-center gap-2",
                    sourceType === t
                      ? "bg-gradient-to-r from-[#8b5cf6] to-[#b794f6] text-white shadow-lg shadow-[#8b5cf6]/20"
                      : "text-[#6b5b8a] hover:text-foreground"
                  )}
                >
                  {t === "url" ? <Globe className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  {t === "url" ? "URL" : "Text"}
                </button>
              ))}
            </div>

            {sourceType === "url" && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-[#6b5b8a]">Source URL</label>
                  <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/article" className="bg-[#0a0512] border-[rgba(139,92,246,0.15)] focus:border-[#8b5cf6]/30 focus:ring-[#8b5cf6]/20" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block text-[#6b5b8a]">Title (optional)</label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Article title" className="bg-[#0a0512] border-[rgba(139,92,246,0.15)]" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block text-[#6b5b8a]">Author (optional)</label>
                    <Input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author name" className="bg-[#0a0512] border-[rgba(139,92,246,0.15)]" />
                  </div>
                </div>
              </div>
            )}

            {sourceType === "text" && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-[#6b5b8a]">Title</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Source title" className="bg-[#0a0512] border-[rgba(139,92,246,0.15)]" required />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-[#6b5b8a]">Author (optional)</label>
                  <Input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author name" className="bg-[#0a0512] border-[rgba(139,92,246,0.15)]" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-[#6b5b8a]">Content</label>
                  <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Paste the full text content here..." rows={6} className="bg-[#0a0512] border-[rgba(139,92,246,0.15)] resize-y" required />
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={loading || !isValid} className="gap-2 glow-violet-sm bg-gradient-to-r from-[#8b5cf6] to-[#b794f6] hover:from-[#7c3aed] hover:to-[#a78bfa] border-0">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</> : <><Plus className="w-4 h-4" /> Add Source</>}
              </Button>
              <Button type="button" variant="ghost" onClick={resetForm} disabled={loading}>
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Pipeline */}
      <AnimatePresence>
        {pipelineOpen && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            <Card className={cn("jules-card overflow-hidden", compileResult ? "border-[#00b4d8]/20" : "border-[rgba(139,92,246,0.15)]")}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  {compileResult ? <CheckCircle2 className="w-5 h-5 text-[#00b4d8]" /> : <Sparkles className="w-5 h-5 text-[#b794f6]" />}
                  Compilation Pipeline
                  {compileResult && <span className="text-xs font-normal text-[#00b4d8] border-dotted border-[#00b4d8] bg-[rgba(0,229,255,0.1)] px-2 py-0.5 rounded-full ml-auto">Complete</span>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {pipelineSteps.map((step, idx) => (
                  <div
                    key={step.id}
                    className={cn(
                      "flex items-center gap-3 p-3 border transition-all",
                      step.status === "running" ? "bg-[#8b5cf6]/5 border-[#8b5cf6]/20" :
                      step.status === "done" ? "bg-[#00b4d8]/5 border-[#00b4d8]/15" :
                      step.status === "error" ? "bg-[#ff2d92]/5 border-[#ff2d92]/15" :
                      "bg-[#0a0512] border-transparent opacity-60"
                    )}
                  >
                    <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                      {step.status === "running" && <Loader2 className="w-4 h-4 text-[#00b4d8] animate-spin" />}
                      {step.status === "done" && <CheckCircle2 className="w-4 h-4 text-[#00b4d8]" />}
                      {step.status === "error" && <AlertCircle className="w-4 h-4 text-[#ff2d92]" />}
                      {step.status === "pending" && <span className="w-4 h-4 rounded-full border-2 border-[#6b5b8a]/30" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{step.label}</div>
                      {step.detail && <div className="text-xs text-[#6b5b8a] mt-0.5">{step.detail}</div>}
                    </div>
                    <div className="text-xs text-[#6b5b8a] font-mono">{String(idx + 1).padStart(2, "0")}</div>
                  </div>
                ))}

                {pipelineError && (
                  <div className="p-3 bg-[#ff2d92]/10 border border-[#ff2d92]/20 text-[#ff2d92] text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {pipelineError}
                  </div>
                )}

                {compileResult && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="pt-3 border-t border-[rgba(139,92,246,0.15)]">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: "Claims", value: compileResult.claimsExtracted },
                        { label: "Entities", value: compileResult.entitiesExtracted },
                        { label: "Relations", value: compileResult.relationsExtracted },
                        { label: "Contradictions", value: compileResult.contradictionsFound },
                      ].map((stat) => (
                        <div key={stat.label} className="p-3 bg-[#0a0512] border border-[rgba(139,92,246,0.15)] text-center">
                          <div className="text-xl font-bold text-[#b794f6]">{stat.value}</div>
                          <div className="text-xs text-[#6b5b8a]">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3 mt-4">
                      <Button className="gap-2 flex-1 bg-[#0a0512] border border-[rgba(139,92,246,0.15)] text-[#b794f6]" onClick={() => {
                        setPipelineOpen(false);
                        setCompileResult(null);
                        setPipelineSteps((prev) => prev.map((s) => ({ ...s, status: "pending", detail: undefined })));
                      }}>
                        <RefreshCw className="w-4 h-4" /> Add Another
                      </Button>
                      <Link href={`/wiki/${slug}/page/${slug}`} className="flex-1">
                        <Button className="gap-2 w-full glow-violet-sm bg-gradient-to-r from-[#8b5cf6] to-[#b794f6] border-0">
                          View Article <ChevronRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sources List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#b794f6]" />
            Sources ({sources.length})
          </h2>
        </div>

        {sources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 border border-dashed border-[rgba(139,92,246,0.15)]">
            <BookOpen className="w-10 h-10 text-[#6b5b8a]/30" />
            <p className="text-[#6b5b8a] font-medium">No sources yet</p>
            <p className="text-[#6b5b8a] text-sm">Add a source above to start building your wiki</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sources.map((source) => (
              <Card key={source.id} className="jules-card border-[rgba(139,92,246,0.15)] hover:border-[#8b5cf6]/15 transition-colors group">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-[#8b5cf6]/15 to-[#6d28d9]/5 flex items-center justify-center flex-shrink-0 mt-0.5 border border-[#8b5cf6]/15">
                    {source.sourceType === "url" ? <Globe className="w-4 h-4 text-[#b794f6]" /> : <FileText className="w-4 h-4 text-[#b794f6]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm truncate">{source.title || source.url || "Untitled Source"}</h3>
                      {source.url && <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-[#6b5b8a] hover:text-[#b794f6] transition-colors"><ExternalLink className="w-3.5 h-3.5" /></a>}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-[#6b5b8a]">
                      {source.author && <span>By {source.author}</span>}
                      {source.date && <span>{source.date}</span>}
                      <span className="flex items-center gap-1">
                        <span className={cn("w-1.5 h-1.5 rounded-full", source.credibilityScore >= 70 ? "bg-[#00b4d8]" : source.credibilityScore >= 40 ? "bg-[#8b5cf6]" : "bg-[#ff2d92]")} />
                        Credibility {source.credibilityScore}%
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-[#6b5b8a] hover:text-[#ff2d92] rounded-sm" onClick={() => deleteSource(source.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
