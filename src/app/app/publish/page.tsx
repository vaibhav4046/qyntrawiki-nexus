"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Globe,
  Eye,
  EyeOff,
  Check,
  Star,
  BookOpen,
  ArrowRight,
  Link as LinkIcon,
  FileText,
  ToggleLeft,
  ToggleRight,
  Lock,
  Unlock,
  Copy,
  CheckCircle2,
} from "lucide-react";

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 group"
    >
      {checked ? (
        <ToggleRight className="w-6 h-6 text-[#e63946] transition-colors" />
      ) : (
        <ToggleLeft className="w-6 h-6 text-[#666666] transition-colors" />
      )}
      <span className="text-sm text-[#a0a0a0] group-hover:text-[#f5f5f5] transition-colors">
        {label}
      </span>
    </button>
  );
}

export default function PublishPage() {
  const wikiId = "demo-wiki";

  const [wiki, setWiki] = useState<Record<string, unknown> | null>(null);
  const [pages, setPages] = useState<Array<Record<string, unknown>>>([]);
  const [settings, setSettings] = useState<Record<string, unknown> | null>(null);

  const [publicSlug, setPublicSlug] = useState("");
  const [publicTitle, setPublicTitle] = useState("");
  const [publicDescription, setPublicDescription] = useState("");
  const [hidePrivateSources, setHidePrivateSources] = useState(true);
  const [showGeneratedLabel, setShowGeneratedLabel] = useState(true);
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    // Fetch data from API instead of using Prisma directly in client
    fetch("/api/wiki/demo-wiki/publish")
      .then((r) => r.json())
      .then((data) => {
        if (data.wiki) {
          setWiki(data.wiki);
          setPages(data.pages || []);
          setSettings(data.settings || null);
          setIsPublished(data.wiki.isPublished || false);
          setPublicSlug(data.settings?.publicSlug || data.wiki.slug || "");
          setPublicTitle(data.settings?.publicTitle || data.wiki.name || "");
          setPublicDescription(data.settings?.publicDescription || "");
          setHidePrivateSources(data.settings?.hidePrivateSources ?? true);
          setShowGeneratedLabel(data.settings?.showGeneratedLabel ?? true);
          try {
            const allowed = JSON.parse(data.settings?.allowedPageSlugs || "[]");
            setSelectedPages(new Set(allowed));
          } catch {
            const publicSlugs = (data.pages || [])
              .filter((p: any) => p.isPublic)
              .map((p: any) => p.slug || "");
            setSelectedPages(new Set(publicSlugs));
          }
        }
        setLoading(false);
      })
      .catch(() => {
        // Fallback: use hardcoded demo data
        const demoWiki = { id: "demo-wiki", name: "AI Agent Memory Encyclopedia", slug: "ai-agent-memory", isPublished: true };
        const demoPages = [
          { id: "page-hydradb", title: "HydraDB", slug: "hydradb", summary: "Graph-first context infrastructure for AI agents", isPublic: true },
          { id: "page-context", title: "Context Graph", slug: "context-graph", summary: "Persistent knowledge structure tracking entities and relationships", isPublic: true },
          { id: "page-llm", title: "LLM Wiki", slug: "llm-wiki", summary: "Pattern for AI-maintained knowledge bases", isPublic: true },
          { id: "page-vector", title: "Vector Search Limitations", slug: "vector-search-limitations", summary: "Analysis of vector database limitations", isPublic: true },
          { id: "page-rag", title: "RAG vs Wiki", slug: "rag-vs-wiki", summary: "Comparison of stateless retrieval vs persistent compilation", isPublic: true },
          { id: "page-contra", title: "Contradiction Detection", slug: "contradiction-detection", summary: "Automated identification of conflicting claims", isPublic: true },
          { id: "page-pkos", title: "Personal Knowledge OS", slug: "personal-knowledge-os", summary: "Unified knowledge management system", isPublic: true },
          { id: "page-student", title: "Student Job Agent", slug: "student-job-agent", summary: "AI agent for student job search", isPublic: true },
        ];
        setWiki(demoWiki);
        setPages(demoPages);
        setIsPublished(true);
        setPublicSlug("ai-agent-memory");
        setPublicTitle("AI Agent Memory Encyclopedia");
        setPublicDescription("A public knowledge base about AI agent memory, context graphs, and wiki systems.");
        setSelectedPages(new Set(demoPages.map((p) => p.slug)));
        setLoading(false);
      });
  }, []);

  const togglePage = useCallback((slug: string) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }, []);

  const handlePublish = useCallback(async () => {
    if (!wiki) return;
    setLoading(true);

    try {
      await fetch("/api/wiki/demo-wiki/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isPublished: true,
          publicSlug,
          publicTitle,
          publicDescription,
          allowedPageSlugs: [...selectedPages],
          hidePrivateSources,
          showGeneratedLabel,
        }),
      });

      // Update local page states
      setPages((prev) =>
        prev.map((page) => ({
          ...page,
          isPublic: selectedPages.has(page.slug as string),
        }))
      );

      setIsPublished(true);
    } catch (err) {
      console.error("Publish failed:", err);
    } finally {
      setLoading(false);
    }
  }, [wiki, publicSlug, publicTitle, publicDescription, hidePrivateSources, showGeneratedLabel, selectedPages]);

  const handleUnpublish = useCallback(async () => {
    if (!wiki) return;
    setLoading(true);

    try {
      await fetch("/api/wiki/demo-wiki/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: false }),
      });
      setIsPublished(false);
    } catch (err) {
      console.error("Unpublish failed:", err);
    } finally {
      setLoading(false);
    }
  }, [wiki]);

  const copyUrl = useCallback(() => {
    const url = `${window.location.origin}/p/${publicSlug || "your-slug"}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [publicSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-[#a0a0a0]">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 animate-pulse" />
          Loading publish settings...
        </div>
      </div>
    );
  }

  const publicPages = pages.filter((p) => selectedPages.has(p.slug as string));
  const previewUrl = `/p/${publicSlug || "your-slug"}`;

  return (
    <div className="min-h-screen bg-black">
      <div className="px-6 sm:px-8 lg:px-10 pt-8 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#f5f5f5]">Publish Wiki</h1>
            <p className="mt-1 text-sm text-[#a0a0a0]">
              Choose what to share with the world
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isPublished ? (
              <span className="badge badge-green flex items-center gap-1.5">
                <Globe className="w-3 h-3" /> Live
              </span>
            ) : (
              <span className="badge bg-[rgba(107,101,96,0.15)] text-[#666666] border border-[rgba(107,101,96,0.2)] flex items-center gap-1.5">
                <Lock className="w-3 h-3" /> Private
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 sm:px-8 lg:px-10 pb-10 max-w-5xl">
        {/* Publishing Settings */}
        <div className="glass-card rounded-lg p-6 mb-6">
          <h2 className="section-title flex items-center gap-2 mb-5">
            <Globe className="w-4 h-4" /> Publishing Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs text-[#a0a0a0] mb-1.5 uppercase tracking-wider font-bold">
                Wiki Title
              </label>
              <input
                type="text"
                value={publicTitle}
                onChange={(e) => setPublicTitle(e.target.value)}
                placeholder="Public wiki title"
                className="w-full rounded-md"
              />
            </div>

            <div>
              <label className="block text-xs text-[#a0a0a0] mb-1.5 uppercase tracking-wider font-bold">
                Public Slug
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#666666] shrink-0">/p/</span>
                <input
                  type="text"
                  value={publicSlug}
                  onChange={(e) => setPublicSlug(e.target.value)}
                  placeholder="your-slug"
                  className="w-full rounded-md"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs text-[#a0a0a0] mb-1.5 uppercase tracking-wider font-bold">
                Description
              </label>
              <textarea
                value={publicDescription}
                onChange={(e) => setPublicDescription(e.target.value)}
                placeholder="Short description of your public wiki"
                rows={3}
                className="w-full rounded-md resize-none"
              />
            </div>

            <div className="flex flex-col gap-3">
              <Toggle
                checked={hidePrivateSources}
                onChange={setHidePrivateSources}
                label="Hide private source details"
              />
              <Toggle
                checked={showGeneratedLabel}
                onChange={setShowGeneratedLabel}
                label="Show generated label"
              />
            </div>
          </div>
        </div>

        {/* URL Preview */}
        <div className="glass-card rounded-lg p-5 mb-6">
          <h2 className="section-title flex items-center gap-2 mb-3">
            <LinkIcon className="w-4 h-4" /> Public URL Preview
          </h2>
          <div className="flex items-center justify-between gap-3 p-3 rounded-md bg-[rgba(20,18,16,0.6)] border border-[rgba(230,57,70,0.1)]">
            <Link
              href={previewUrl}
              target="_blank"
              className="text-sm text-[#f77f00] hover:text-[#e63946] transition-colors truncate"
            >
              {origin}
              {previewUrl}
            </Link>
            <button
              onClick={copyUrl}
              className="btn-ghost flex items-center gap-1.5 shrink-0"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Page Selector */}
        <div className="glass-card rounded-lg p-6 mb-6">
          <h2 className="section-title flex items-center gap-2 mb-5">
            <FileText className="w-4 h-4" /> Page Selector
          </h2>
          <p className="text-xs text-[#666666] mb-4">
            Check the pages you want to make public. Unchecked pages stay private.
          </p>

          <div className="space-y-2">
            {pages.map((page) => {
              const isChecked = selectedPages.has(page.slug as string);
              return (
                <label
                  key={page.id as string}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                    isChecked
                      ? "bg-[rgba(34,197,94,0.05)] border-[rgba(34,197,94,0.2)]"
                      : "bg-[rgba(20,18,16,0.4)] border-[rgba(107,101,96,0.15)] hover:border-[rgba(107,101,96,0.3)]"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => togglePage(page.slug as string)}
                    className="w-4 h-4 rounded border-[#666666] bg-transparent text-[#e63946] focus:ring-[#e63946] cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#f5f5f5]">
                        {page.title as string}
                      </span>
                      {isChecked && (
                        <Star className="w-3 h-3 text-[#e63946]" />
                      )}
                    </div>
                    <p className="text-xs text-[#666666] truncate mt-0.5">
                      {(page.summary as string)?.slice(0, 100)}
                      {(page.summary as string)?.length > 100 ? "..." : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {page.isPublic && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-[rgba(34,197,94,0.1)] text-green-400 rounded">
                        Already public
                      </span>
                    )}
                    <ArrowRight
                      className={cn(
                        "w-4 h-4 transition-colors",
                        isChecked ? "text-[#e63946]" : "text-[#666666]"
                      )}
                    />
                  </div>
                </label>
              );
            })}
          </div>

          {pages.length === 0 && (
            <div className="empty-state py-6">
              <BookOpen className="w-8 h-8 mb-3" />
              <p className="text-sm text-[#a0a0a0]">No pages found.</p>
            </div>
          )}
        </div>

        {/* Current Public Pages */}
        <div className="glass-card rounded-lg p-6 mb-6">
          <h2 className="section-title flex items-center gap-2 mb-5">
            <Eye className="w-4 h-4" /> Current Public Pages
            <span className="ml-auto text-[10px] px-2 py-0.5 bg-[rgba(34,197,94,0.1)] text-green-400 rounded">
              {publicPages.length} page{publicPages.length !== 1 ? "s" : ""}
            </span>
          </h2>

          {publicPages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {publicPages.map((page) => (
                <div
                  key={page.id as string}
                  className="p-3 rounded-lg border border-[rgba(107,101,96,0.15)] bg-[rgba(20,18,16,0.4)]"
                >
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-sm font-medium text-[#f5f5f5]">
                      {page.title as string}
                    </span>
                  </div>
                  <p className="text-xs text-[#666666] mt-1 truncate">
                    {(page.summary as string)?.slice(0, 80)}
                    {(page.summary as string)?.length > 80 ? "..." : ""}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <EyeOff className="w-8 h-8 text-[#666666] mb-2" />
              <p className="text-sm text-[#a0a0a0]">No pages selected for publishing.</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {isPublished ? (
            <>
              <button
                onClick={handleUnpublish}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Unpublish Wiki
              </button>
              <button
                onClick={handlePublish}
                className="btn-primary flex items-center justify-center gap-2"
              >
                <Globe className="w-4 h-4" />
                Update Public Pages
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handlePublish}
                className="btn-primary flex items-center justify-center gap-2"
              >
                <Globe className="w-4 h-4" />
                Publish Wiki
              </button>
              <p className="text-xs text-[#666666]">
                Publishing makes your selected pages visible at the public URL above.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
