"use client";

import { useState } from "react";
import {
  FileText, Link, FileCode, Globe, Plus, RefreshCw,
  AlertCircle, CheckCircle2, Clock, Loader2, XCircle,
  Wand2, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Source {
  id: string;
  type: string;
  title: string;
  url: string;
  status: string;
  error: string;
  createdAt: string;
}

type IngestForm = "text" | "markdown" | "url";

interface Props {
  slug: string;
  initialSources: Source[];
}

export default function SourcesClient({ slug, initialSources }: Props) {
  const [sources, setSources] = useState<Source[]>(initialSources);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeForm, setActiveForm] = useState<IngestForm>("text");
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [ingesting, setIngesting] = useState(false);
  const [compiling, setCompiling] = useState(false);
  const [ingestResult, setIngestResult] = useState("");

  const fetchSources = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/wiki/${slug}/sources`);
      if (!res.ok) throw new Error(res.status === 404 ? "Wiki not found" : "Failed to fetch sources");
      const data = await res.json();
      setSources(Array.isArray(data) ? data : data.sources || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sources");
    } finally {
      setLoading(false);
    }
  };

  async function handleIngest() {
    setIngesting(true);
    setIngestResult("");
    setError("");
    try {
      const body: Record<string, string> = { title: formTitle };
      if (activeForm === "url") {
        body.url = formUrl;
        body.type = "url";
      } else if (activeForm === "markdown") {
        body.rawText = formContent;
        body.type = "markdown";
      } else {
        body.rawText = formContent;
        body.type = "text";
      }
      const res = await fetch(`/api/wiki/${slug}/ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ingest failed");
      setIngestResult(data.id ? `Source "${data.title}" ingested successfully` : "Ingest queued");
      setFormTitle("");
      setFormContent("");
      setFormUrl("");
      fetchSources();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ingest failed");
    } finally {
      setIngesting(false);
    }
  }

  async function handleCompileAll() {
    setCompiling(true);
    setError("");
    try {
      const pendingSources = sources.filter(s => s.status === "pending");
      for (const src of pendingSources.slice(0, 4)) {
        const res = await fetch(`/api/wiki/${slug}/compile`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sourceId: src.id }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Compile failed");
        }
      }
      fetchSources();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Compile failed");
    } finally {
      setCompiling(false);
    }
  }

  const typeIcon = (type: string) => {
    switch (type) {
      case "url": return <Link className="w-4 h-4" />;
      case "markdown": return <FileCode className="w-4 h-4" />;
      case "wikipedia": return <Globe className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const statusBadge = (status: string) => {
    const base = "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case "completed":
        return <span className={cn(base, "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20")}><CheckCircle2 className="w-3 h-3" /> Complete</span>;
      case "processing":
      case "indexing":
        return <span className={cn(base, "bg-blue-500/10 text-blue-400 border border-blue-500/20")}><RefreshCw className="w-3 h-3 animate-spin" /> Processing</span>;
      case "error":
        return <span className={cn(base, "bg-red-500/10 text-red-400 border border-red-500/20")}><XCircle className="w-3 h-3" /> Error</span>;
      case "pending":
      default:
        return <span className={cn(base, "bg-amber-500/10 text-amber-400 border border-amber-500/20")}><Clock className="w-3 h-3" /> Pending</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-muted-foreground">Loading sources...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sources</h1>
          <p className="text-muted-foreground mt-1">Manage knowledge sources for {slug}</p>
        </div>
        <Button onClick={handleCompileAll} disabled={compiling || sources.length === 0} className="glow-amber-sm gap-2">
          {compiling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          {compiling ? "Compiling..." : "Compile All"}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {ingestResult && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          {ingestResult}
        </div>
      )}

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Add Source
          </CardTitle>
          <CardDescription>Paste text, markdown, or provide a URL to ingest new knowledge</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-1 p-1 rounded-lg bg-muted">
            {(["text", "markdown", "url"] as IngestForm[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveForm(tab)}
                className={cn(
                  "flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  activeForm === tab
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab === "text" ? "Paste Text" : tab === "markdown" ? "Paste Markdown" : "From URL"}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Source title..."
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
          />

          {activeForm === "url" ? (
            <input
              type="url"
              placeholder="https://..."
              value={formUrl}
              onChange={(e) => setFormUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
            />
          ) : (
            <textarea
              placeholder={activeForm === "markdown" ? "# Paste markdown content..." : "Paste text content..."}
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm resize-y font-mono"
            />
          )}

          <Button
            onClick={handleIngest}
            disabled={ingesting || !formTitle || (activeForm === "url" ? !formUrl : !formContent)}
            className="gap-2 glow-amber-sm w-full sm:w-auto"
          >
            {ingesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {ingesting ? "Ingesting..." : "Ingest Source"}
          </Button>
        </CardContent>
      </Card>

      {sources.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
            <FileText className="w-12 h-12 text-muted-foreground/30" />
            <p className="text-muted-foreground text-lg font-medium">No sources yet</p>
            <p className="text-muted-foreground text-sm">Add text, markdown, or URLs to start building your wiki</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sources.map((source) => (
            <Card key={source.id} className="glass-card hover:border-primary/20 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {typeIcon(source.type)}
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-base truncate">{source.title}</CardTitle>
                      <CardDescription className="truncate">
                        {source.url ? (
                          <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-primary truncate">
                            {source.url} <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">{source.type}</span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {statusBadge(source.status)}
                  </div>
                </div>
              </CardHeader>
              {source.error && (
                <CardContent className="pt-0">
                  <p className="text-xs text-red-400 bg-red-500/5 rounded p-2 border border-red-500/10">{source.error}</p>
                </CardContent>
              )}
              <CardFooter className="pt-0 text-xs text-muted-foreground">
                Added {new Date(source.createdAt).toLocaleDateString()}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
