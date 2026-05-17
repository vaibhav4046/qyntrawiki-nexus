"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Loader2, Search, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  action: () => void;
}

/* Mascot SVG */
function MascotIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M16 4C10 4 6 8 6 13C6 16 8 19 10 20C10 23 9 26 7 28C9 27 11 25 12 22C13 23 14 23 16 23C18 23 19 23 20 22C21 25 23 27 25 28C23 26 22 23 22 20C24 19 26 16 26 13C26 8 22 4 16 4Z" fill="#8b5cf6" />
      <circle cx="12.5" cy="12" r="1.5" fill="#150a26" />
      <circle cx="19.5" cy="12" r="1.5" fill="#150a26" />
    </svg>
  );
}

export default function CommandPalette({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "agent"; text: string }[]>([
    { role: "agent", text: "Hi! I'm your QyntraWiki agent. Ask me anything about your knowledge base, or use the commands below." },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const basePath = `/wiki/${slug}`;

  const commands: CommandItem[] = [
    { id: "pages", label: "Browse Pages", description: "View all wiki articles", action: () => { router.push(`${basePath}/pages`); setOpen(false); } },
    { id: "ingest", label: "Ingest Sources", description: "Add URLs, files, text", action: () => { router.push(`${basePath}/ingest`); setOpen(false); } },
    { id: "connectors", label: "Connectors", description: "Connect Notion, Drive, etc.", action: () => { router.push(`${basePath}/connectors`); setOpen(false); } },
    { id: "graph", label: "Knowledge Graph", description: "Explore entities & relations", action: () => { router.push(`${basePath}/graph`); setOpen(false); } },
    { id: "ask", label: "Ask the Wiki", description: "Ask natural language questions", action: () => { router.push(`${basePath}/ask`); setOpen(false); } },
    { id: "contradictions", label: "Contradictions", description: "Review conflicting claims", action: () => { router.push(`${basePath}/contradictions`); setOpen(false); } },
    { id: "sources", label: "Sources", description: "Manage knowledge sources", action: () => { router.push(`${basePath}/sources`); setOpen(false); } },
  ];

  const filtered = query.trim()
    ? commands.filter((c) =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(query.toLowerCase()))
      )
    : commands;

  async function handleAsk() {
    if (!query.trim()) return;
    const q = query.trim();
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setQuery("");
    setLoading(true);

    try {
      const res = await fetch(`/api/wiki/${slug}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "agent", text: data.answer || "I couldn't find an answer to that question." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "agent", text: "Sorry, I ran into an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      if (filtered.length > 0 && !query.startsWith("?")) {
        filtered[0].action();
      } else {
        handleAsk();
      }
    }
  }

  const isAskMode = query.startsWith("?") || messages.length > 1;

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-300",
          "bg-[#8b5cf6] text-white border border-dotted border-[#00b4d8] shadow-lg hover:bg-[#a78bfa]"
        )}
      >
        <Sparkles className="w-4 h-4" />
        <span className="hidden sm:inline">Ask Agent</span>
        <span className="hidden md:inline text-[10px] opacity-60 ml-1 font-mono normal-case">⌘K</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4"
            onClick={() => setOpen(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-[#150a26]/80 backdrop-blur-sm" />

            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-[#0c0618] border-2 border-dotted border-[rgba(139,92,246,0.3)] shadow-[0_0_80px_rgba(139,92,246,0.15)] overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-dotted border-[rgba(139,92,246,0.15)]">
                  <Search className="w-4 h-4 text-[#6b5b8a]" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isAskMode ? "Ask anything about your wiki..." : "Search commands or type ? to ask..."}
                    className="flex-1 bg-transparent text-sm text-[#e8d5f7] placeholder:text-[#4a3a6a] focus:outline-none font-mono"
                  />
                  <button onClick={() => setOpen(false)} className="text-[#4a3a6a] hover:text-[#e8d5f7] transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Chat / Commands area */}
                <div className="max-h-[50vh] overflow-y-auto">
                  {isAskMode ? (
                    <div className="p-4 space-y-4">
                      {messages.map((msg, i) => (
                        <div key={i} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
                          {msg.role === "agent" && (
                            <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
                              <MascotIcon className="w-6 h-6" />
                            </div>
                          )}
                          <div
                            className={cn(
                              "max-w-[80%] text-sm p-3",
                              msg.role === "user"
                                ? "bg-[rgba(0,229,255,0.1)] border border-dotted border-[rgba(0,229,255,0.2)] text-[#e8d5f7]"
                                : "bg-[#0a0512] border border-dotted border-[rgba(139,92,246,0.15)] text-[#a89bc8]"
                            )}
                          >
                            {msg.text}
                          </div>
                        </div>
                      ))}
                      {loading && (
                        <div className="flex items-center gap-2 text-sm text-[#6b5b8a]">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00b4d8]" />
                          Thinking...
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-2">
                      {filtered.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-[#4a3a6a]">
                          No commands found. Type <kbd className="px-1.5 py-0.5 bg-[#0a0512] border border-dotted border-[rgba(139,92,246,0.2)] text-xs font-mono">?</kbd> to ask the AI.
                        </div>
                      ) : (
                        filtered.map((cmd, idx) => (
                          <button
                            key={cmd.id}
                            onClick={cmd.action}
                            className={cn(
                              "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors border border-dotted border-transparent",
                              idx === 0 ? "bg-[rgba(0,229,255,0.05)] border-[rgba(0,229,255,0.15)]" : "hover:bg-[rgba(139,92,246,0.05)]"
                            )}
                          >
                            <div className="w-8 h-8 bg-[#0a0512] border border-dotted border-[rgba(139,92,246,0.2)] flex items-center justify-center shrink-0">
                              <ChevronRight className="w-4 h-4 text-[#00b4d8]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[#e8d5f7]">{cmd.label}</p>
                              {cmd.description && <p className="text-xs text-[#4a3a6a]">{cmd.description}</p>}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-2 border-t border-dotted border-[rgba(139,92,246,0.15)] text-[10px] text-[#4a3a6a] uppercase tracking-wider">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><kbd className="px-1 bg-[#0a0512] border border-dotted border-[rgba(139,92,246,0.2)] font-mono">↑↓</kbd> Navigate</span>
                    <span className="flex items-center gap-1"><kbd className="px-1 bg-[#0a0512] border border-dotted border-[rgba(139,92,246,0.2)] font-mono">↵</kbd> Select</span>
                  </div>
                  <span className="flex items-center gap-1"><kbd className="px-1 bg-[#0a0512] border border-dotted border-[rgba(139,92,246,0.2)] font-mono">?</kbd> Ask AI</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
