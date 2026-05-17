"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

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

export default function CreateWikiPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Wiki name is required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/wiki", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim(), topic: topic.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create wiki");
      }
      const wiki = await res.json();
      router.push(`/wiki/${wiki.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-12 bg-[#150a26] dot-matrix-bg">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg"
      >
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-[#4a3a6a] hover:text-[#e8d5f7] transition-colors text-xs mb-6 uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          Back home
        </a>

        <div className="jules-card glow-cyan p-6 sm:p-8">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-2 mb-4">
              <MascotIcon className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-[#e8d5f7] mb-1">Create Your Wiki</h1>
            <p className="text-xs text-[#6b5b8a] mb-6">
              Give your wiki a name and optional description. HydraDB will provision a new knowledge graph for it.
            </p>

            <div className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-xs font-medium text-[#e8d5f7] mb-1.5 uppercase tracking-wider">
                  Wiki Name <span className="text-[#ff2d92]">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Machine Learning Research"
                  disabled={loading}
                  className={cn(
                    "w-full bg-[#0a0512] border border-dotted border-[rgba(139,92,246,0.2)] px-4 py-2.5 text-sm text-[#e8d5f7] placeholder:text-[#4a3a6a]",
                    "focus:outline-none focus:border-[#00b4d8] focus:border-solid transition-all",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "font-mono"
                  )}
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-xs font-medium text-[#e8d5f7] mb-1.5 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A short description of what this wiki covers..."
                  rows={3}
                  disabled={loading}
                  className={cn(
                    "w-full bg-[#0a0512] border border-dotted border-[rgba(139,92,246,0.2)] px-4 py-2.5 text-sm text-[#e8d5f7] placeholder:text-[#4a3a6a] resize-none",
                    "focus:outline-none focus:border-[#00b4d8] focus:border-solid transition-all",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "font-mono"
                  )}
                />
              </div>

              <div>
                <label htmlFor="topic" className="block text-xs font-medium text-[#e8d5f7] mb-1.5 uppercase tracking-wider">
                  Topic
                </label>
                <input
                  id="topic"
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. artificial-intelligence"
                  disabled={loading}
                  className={cn(
                    "w-full bg-[#0a0512] border border-dotted border-[rgba(139,92,246,0.2)] px-4 py-2.5 text-sm text-[#e8d5f7] placeholder:text-[#4a3a6a]",
                    "focus:outline-none focus:border-[#00b4d8] focus:border-solid transition-all",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "font-mono"
                  )}
                />
              </div>

              {error && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-[#ff2d92] bg-[rgba(255,45,146,0.1)] px-3 py-2 border border-dotted border-[rgba(255,45,146,0.3)]">
                  {error}
                </motion.p>
              )}
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full jules-btn jules-btn-solid disabled:opacity-50"
              >
                {loading ? "Provisioning knowledge graph..." : "Create Wiki"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#150a26] to-transparent pointer-events-none" />
    </div>
  );
}
