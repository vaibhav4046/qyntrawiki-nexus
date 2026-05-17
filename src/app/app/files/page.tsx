"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Search,
  Filter,
  FileText,
  FolderOpen,
  ArrowRight,
  Download,
  MessageSquare,
  BookOpen,
  X,
} from "lucide-react";

// We can't use prisma directly in client components, so we'll fetch via API
// But for demo purposes with in-memory store, we can simulate

interface FileItem {
  id: string;
  name: string;
  path: string;
  extension: string;
  mimeType: string;
  sizeBytes: number;
  summary: string;
  tagsJson: string;
  sourceType: string;
  createdAt: string;
}

export default function FilesPage() {
  const [search, setSearch] = useState("");
  const [filterExt, setFilterExt] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  // Demo data - in production this would come from an API
  const files: FileItem[] = [
    { id: "file-1", name: "HydraDB-Overview.md", path: "/Projects/HydraDB-Overview.md", extension: "md", mimeType: "text/markdown", sizeBytes: 2400, summary: "Overview of HydraDB graph-first infrastructure", tagsJson: JSON.stringify(["ai", "database", "graph"]), sourceType: "manual_text", createdAt: "2025-05-15T10:00:00Z" },
    { id: "file-2", name: "LLM-Wiki-Pattern.md", path: "/Research/LLM-Wiki-Pattern.md", extension: "md", mimeType: "text/markdown", sizeBytes: 1800, summary: "Pattern for AI-maintained knowledge bases", tagsJson: JSON.stringify(["ai", "wiki", "pattern"]), sourceType: "manual_text", createdAt: "2025-05-15T10:30:00Z" },
    { id: "file-3", name: "Vector-Search-Limitations.md", path: "/Research/Vector-Search-Limitations.md", extension: "md", mimeType: "text/markdown", sizeBytes: 2100, summary: "Analysis of vector database limitations", tagsJson: JSON.stringify(["vector", "search", "limitations"]), sourceType: "manual_text", createdAt: "2025-05-15T11:00:00Z" },
    { id: "file-4", name: "Counter-Vector-DBs.md", path: "/Research/Counter-Vector-DBs.md", extension: "md", mimeType: "text/markdown", sizeBytes: 1500, summary: "Counter-argument for vector database sufficiency", tagsJson: JSON.stringify(["vector", "counter"]), sourceType: "manual_text", createdAt: "2025-05-15T11:30:00Z" },
    { id: "file-5", name: "Personal-Knowledge-OS.md", path: "/Projects/Personal-Knowledge-OS.md", extension: "md", mimeType: "text/markdown", sizeBytes: 1200, summary: "Notes on building a personal knowledge OS", tagsJson: JSON.stringify(["pkos", "knowledge"]), sourceType: "manual_text", createdAt: "2025-05-15T12:00:00Z" },
    { id: "file-6", name: "Student-Job-Agent.md", path: "/Startup-Ideas/Student-Job-Agent.md", extension: "md", mimeType: "text/markdown", sizeBytes: 1600, summary: "Concept for AI agent helping students find jobs", tagsJson: JSON.stringify(["startup", "jobs", "students"]), sourceType: "manual_text", createdAt: "2025-05-15T12:30:00Z" },
    { id: "file-7", name: "Karpathy-LLM-Wiki.md", path: "/University/Karpathy-LLM-Wiki.md", extension: "md", mimeType: "text/markdown", sizeBytes: 900, summary: "Karpathy notes on LLMs as operating systems", tagsJson: JSON.stringify(["llm", "os", "karpathy"]), sourceType: "manual_text", createdAt: "2025-05-15T13:00:00Z" },
  ];

  const filtered = files.filter((f) => {
    const matchesSearch =
      !search ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.summary.toLowerCase().includes(search.toLowerCase());
    const matchesExt = !filterExt || f.extension === filterExt;
    return matchesSearch && matchesExt;
  });

  const extensions = Array.from(new Set(files.map((f) => f.extension)));

  return (
    <div className="min-h-screen bg-gradient-warm">
      <div className="px-6 sm:px-8 lg:px-10 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-[#f5f0eb]">Personal File Browser</h1>
        <p className="mt-1 text-sm text-[#a89f91]">
          Browse imported files, sources, and generated wiki pages
        </p>
      </div>

      <div className="px-6 sm:px-8 lg:px-10 pb-10">
        {/* Search & filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6560]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterExt(null)}
              className={cn(
                "px-3 py-2.5 text-xs font-medium rounded-lg transition-all",
                !filterExt
                  ? "bg-[rgba(245,158,11,0.2)] text-[#fbbf24]"
                  : "bg-[rgba(107,101,96,0.1)] text-[#a89f91] hover:bg-[rgba(245,158,11,0.1)]"
              )}
            >
              All
            </button>
            {extensions.map((ext) => (
              <button
                key={ext}
                onClick={() => setFilterExt(filterExt === ext ? null : ext)}
                className={cn(
                  "px-3 py-2.5 text-xs font-medium rounded-lg transition-all uppercase",
                  filterExt === ext
                    ? "bg-[rgba(245,158,11,0.2)] text-[#fbbf24]"
                    : "bg-[rgba(107,101,96,0.1)] text-[#a89f91] hover:bg-[rgba(245,158,11,0.1)]"
                )}
              >
                .{ext}
              </button>
            ))}
          </div>
        </div>

        {/* File list */}
        <div className="glass-panel rounded-lg overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-[rgba(234,88,12,0.1)] text-[10px] font-bold text-[#6b6560] uppercase tracking-wider">
            <div className="col-span-5">Name</div>
            <div className="col-span-3 hidden sm:block">Path</div>
            <div className="col-span-2 hidden md:block">Size</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {filtered.map((file, idx) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.03 }}
              className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-[rgba(107,101,96,0.08)] hover:bg-[rgba(245,158,11,0.03)] transition-colors cursor-pointer"
              onClick={() => setSelectedFile(file)}
            >
              <div className="col-span-5 flex items-center gap-3 min-w-0">
                <FileText className="w-4 h-4 text-[#fbbf24] shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[#f5f0eb] truncate">{file.name}</p>
                  <p className="text-[10px] text-[#6b6560] truncate">{file.summary}</p>
                </div>
              </div>
              <div className="col-span-3 hidden sm:flex items-center">
                <p className="text-xs text-[#a89f91] truncate">{file.path}</p>
              </div>
              <div className="col-span-2 hidden md:flex items-center">
                <span className="text-xs text-[#a89f91]">
                  {Math.round(file.sizeBytes / 1024)} KB
                </span>
              </div>
              <div className="col-span-2 flex items-center justify-end gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(file);
                  }}
                  className="p-1.5 rounded hover:bg-[rgba(245,158,11,0.1)] text-[#6b6560] hover:text-[#fbbf24] transition-colors"
                  title="Preview"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 rounded hover:bg-[rgba(245,158,11,0.1)] text-[#6b6560] hover:text-[#fbbf24] transition-colors"
                  title="Download"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <div className="empty-state py-8">
              <p className="text-sm text-[#a89f91]">No files match your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Preview Drawer */}
      {selectedFile && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end"
          onClick={() => setSelectedFile(null)}
        >
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="w-full max-w-md bg-[#0f0f0f] border-l border-[rgba(234,88,12,0.15)] h-full overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[#f5f0eb]">File Preview</h3>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-[#6b6560] hover:text-[#f5f0eb]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-[rgba(245,158,11,0.05)] border border-[rgba(245,158,11,0.1)]">
                  <FileText className="w-8 h-8 text-[#fbbf24] mb-3" />
                  <p className="text-sm font-bold text-[#f5f0eb]">{selectedFile.name}</p>
                  <p className="text-xs text-[#a89f91] mt-1">{selectedFile.path}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-[rgba(107,101,96,0.05)]">
                    <p className="text-[10px] text-[#6b6560] uppercase tracking-wider">Size</p>
                    <p className="text-sm text-[#f5f0eb] font-medium">
                      {Math.round(selectedFile.sizeBytes / 1024)} KB
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-[rgba(107,101,96,0.05)]">
                    <p className="text-[10px] text-[#6b6560] uppercase tracking-wider">Type</p>
                    <p className="text-sm text-[#f5f0eb] font-medium">{selectedFile.mimeType}</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[rgba(107,101,96,0.05)]">
                  <p className="text-[10px] text-[#6b6560] uppercase tracking-wider mb-2">Summary</p>
                  <p className="text-xs text-[#a89f91]">{selectedFile.summary}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {JSON.parse(selectedFile.tagsJson).map((tag: string) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-1 bg-[rgba(245,158,11,0.1)] text-[#fbbf24] rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="pt-4 space-y-2">
                  <button className="w-full py-2.5 text-xs font-bold uppercase tracking-wider rounded btn-primary flex items-center justify-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Ask About This File
                  </button>
                  <button className="w-full py-2.5 text-xs font-bold uppercase tracking-wider rounded btn-secondary flex items-center justify-center gap-2">
                    <BookOpen className="w-3.5 h-3.5" />
                    Create Wiki Page
                  </button>
                  <button className="w-full py-2.5 text-xs font-bold uppercase tracking-wider rounded btn-ghost flex items-center justify-center gap-2">
                    <Download className="w-3.5 h-3.5" />
                    Export Context
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
