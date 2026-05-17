"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Settings, Shield, Server, Database, Brain, Key, Save, Check } from "lucide-react";

export default function SettingsPage() {
  const [model, setModel] = useState("gemini");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [hydraKey, setHydraKey] = useState("");
  const [demoMode, setDemoMode] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load from localStorage if available
    const stored = localStorage.getItem("qyntrawiki-settings");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setModel(parsed.model || "gemini");
        setBaseUrl(parsed.baseUrl || "");
        setDemoMode(parsed.demoMode ?? true);
      } catch {}
    }
  }, []);

  function handleSave() {
    localStorage.setItem("qyntrawiki-settings", JSON.stringify({
      model, baseUrl, demoMode,
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="px-6 sm:px-8 lg:px-10 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-[#f5f5f5]">Runtime Settings</h1>
        <p className="mt-1 text-sm text-[#a0a0a0]">
          Server routes use environment variables for production. Session keys stay in memory.
        </p>
      </div>

      <div className="px-6 sm:px-8 lg:px-10 pb-10 max-w-2xl space-y-6">
        {/* Mode */}
        <div className="glass-card rounded-lg p-5">
          <h2 className="section-title flex items-center gap-2 mb-4">
            <Server className="w-4 h-4" /> Mode
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setDemoMode(true)}
              className={cn(
                "p-4 rounded-lg border text-left transition-all",
                demoMode
                  ? "bg-[rgba(255,235,59,0.1)] border-[rgba(255,235,59,0.3)]"
                  : "bg-[rgba(20,18,16,0.5)] border-[rgba(107,101,96,0.15)]"
              )}
            >
              <Database className={cn("w-5 h-5 mb-2", demoMode ? "text-[#ffeb3b]" : "text-[#666666]")} />
              <p className={cn("text-xs font-bold", demoMode ? "text-[#f5f5f5]" : "text-[#a0a0a0]")}>Demo mode</p>
              <p className="text-[10px] text-[#666666] mt-1">Mock data, no API keys</p>
            </button>
            <button
              onClick={() => setDemoMode(false)}
              className={cn(
                "p-4 rounded-lg border text-left transition-all",
                !demoMode
                  ? "bg-[rgba(34,197,94,0.1)] border-[rgba(34,197,94,0.3)]"
                  : "bg-[rgba(20,18,16,0.5)] border-[rgba(107,101,96,0.15)]"
              )}
            >
              <Brain className={cn("w-5 h-5 mb-2", !demoMode ? "text-green-400" : "text-[#666666]")} />
              <p className={cn("text-xs font-bold", !demoMode ? "text-[#f5f5f5]" : "text-[#a0a0a0]")}>Live mode</p>
              <p className="text-[10px] text-[#666666] mt-1">Uses configured API keys</p>
            </button>
          </div>
        </div>

        {/* LLM Config */}
        <div className="glass-card rounded-lg p-5">
          <h2 className="section-title flex items-center gap-2 mb-4">
            <Brain className="w-4 h-4" /> LLM Provider
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#a0a0a0] uppercase tracking-wider mb-2">Model Provider</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full rounded-md"
              >
                <option value="gemini">Google Gemini</option>
                <option value="openrouter">OpenRouter (multi-model)</option>
                <option value="openai">OpenAI-compatible</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#a0a0a0] uppercase tracking-wider mb-2">Base URL</label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.openai.com/v1"
                className="w-full rounded-md"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#a0a0a0] uppercase tracking-wider mb-2">API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full rounded-md"
              />
              <p className="text-[10px] text-[#666666] mt-1">Stored in memory only. Never sent to client.</p>
            </div>
          </div>
        </div>

        {/* HydraDB */}
        <div className="glass-card rounded-lg p-5">
          <h2 className="section-title flex items-center gap-2 mb-4">
            <Database className="w-4 h-4" /> HydraDB
          </h2>
          <div>
            <label className="block text-xs font-bold text-[#a0a0a0] uppercase tracking-wider mb-2">API Key</label>
            <input
              type="password"
              value={hydraKey}
              onChange={(e) => setHydraKey(e.target.value)}
              placeholder="hydra_..."
              className="w-full rounded-md"
            />
            <p className="text-[10px] text-[#666666] mt-1">Sync extracted text to HydraDB when server keys are configured.</p>
          </div>
        </div>

        {/* Save */}
        <button onClick={handleSave} className="btn-primary flex items-center gap-2">
          {saved ? <><Check className="w-4 h-4" /> Saved</> : <><Save className="w-4 h-4" /> Save Settings</>}
        </button>

        {/* Privacy */}
        <div className="glass-panel rounded-lg p-5">
          <h2 className="section-title flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4" /> Privacy Guardrails
          </h2>
          <div className="space-y-2 text-xs text-[#a0a0a0]">
            <p className="flex items-center gap-2"><Check className="w-3 h-3 text-green-400" /> Permission-first folder indexing</p>
            <p className="flex items-center gap-2"><Check className="w-3 h-3 text-green-400" /> Raw files remain local by default</p>
            <p className="flex items-center gap-2"><Check className="w-3 h-3 text-green-400" /> No LinkedIn or Instagram scraping</p>
            <p className="flex items-center gap-2"><Check className="w-3 h-3 text-green-400" /> No terminal command execution from web</p>
            <p className="flex items-center gap-2"><Check className="w-3 h-3 text-green-400" /> No file mutation without approval</p>
            <p className="flex items-center gap-2"><Check className="w-3 h-3 text-green-400" /> Secrets never rendered into client source</p>
          </div>
        </div>
      </div>
    </div>
  );
}
