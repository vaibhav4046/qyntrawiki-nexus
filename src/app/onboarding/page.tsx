"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ArrowRight,
  FolderOpen,
  HardDrive,
  NotepadText,
  Database,
  Check,
  Sparkles,
  Zap,
  ChevronRight,
  Globe,
  BookOpen,
  Ghost,
} from "lucide-react";

type Step = "welcome" | "connect" | "wiki" | "done";

const connectors = [
  { id: "local-folder", name: "Local Folder", icon: FolderOpen, color: "#ffeb3b", desc: "Scan local files" },
  { id: "google-drive", name: "Google Drive", icon: HardDrive, color: "#00ffff", desc: "Import Drive files" },
  { id: "notion", name: "Notion", icon: NotepadText, color: "#ffb8ff", desc: "Import Notion pages" },
  { id: "demo", name: "Demo Data", icon: Database, color: "#ffb852", desc: "Load sample wiki" },
];

export default function OnboardingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [wikiName, setWikiName] = useState("");
  const [connected, setConnected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const userName = session?.user?.name || "Player";

  function handleConnect(id: string) {
    if (id === "demo") {
      setConnected((prev) => [...prev, id]);
      return;
    }
    // Simulate connection
    setLoading(true);
    setTimeout(() => {
      setConnected((prev) => [...prev, id]);
      setLoading(false);
    }, 1500);
  }

  function handleCreateWiki() {
    setLoading(true);
    setTimeout(() => {
      setStep("done");
      setLoading(false);
    }, 1000);
  }

  const steps: { id: Step; label: string }[] = [
    { id: "welcome", label: "Welcome" },
    { id: "connect", label: "Connect" },
    { id: "wiki", label: "Wiki" },
    { id: "done", label: "Done" },
  ];

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2 flex-1">
                <div
                  className={`w-8 h-8 flex items-center justify-center text-[8px] font-[Press_Start_2P] border-4 ${
                    steps.findIndex((x) => x.id === step) >= i
                      ? "bg-yellow-400 border-yellow-400 text-black"
                      : "bg-transparent border-[#666666] text-[#666666]"
                  }`}
                >
                  {steps.findIndex((x) => x.id === step) > i ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`text-[8px] font-[Press_Start_2P] hidden sm:inline ${
                    steps.findIndex((x) => x.id === step) >= i ? "text-yellow-400" : "text-[#666666]"
                  }`}
                >
                  {s.label}
                </span>
                {i < steps.length - 1 && (
                  <div className="flex-1 h-[2px] bg-[#666666]/30 mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          {step === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="pixel-card border-yellow-400/30 p-8 text-center"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 bg-yellow-400 mx-auto mb-6 pac-chomp"
              />
              <h2 className="pixel-heading text-[12px] text-yellow-400 mb-4">
                Welcome, {userName}!
              </h2>
              <p className="text-[#a0a0a0] text-lg mb-6 leading-relaxed">
                QyntraWiki turns your files, notes, and links into a personal Wikipedia.
                <br />
                Powered by HydraDB. Styled like Pac-Man.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                <FeatureBadge icon={BookOpen} text="Wiki Pages" />
                <FeatureBadge icon={Globe} text="Knowledge Graph" />
                <FeatureBadge icon={Zap} text="AI Ask" />
                <FeatureBadge icon={Ghost} text="Contradictions" />
              </div>
              <button
                onClick={() => setStep("connect")}
                className="pixel-btn pixel-btn-solid px-8 py-3"
              >
                Start Onboarding <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {step === "connect" && (
            <motion.div
              key="connect"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="pixel-card border-yellow-400/30 p-8"
            >
              <h2 className="pixel-heading text-[12px] text-yellow-400 mb-2 text-center">
                Connect Your Sources
              </h2>
              <p className="text-[#a0a0a0] text-sm text-center mb-6">
                Choose at least one source to build your wiki from.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {connectors.map((conn) => {
                  const Icon = conn.icon;
                  const isConnected = connected.includes(conn.id);
                  return (
                    <motion.button
                      key={conn.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => !isConnected && handleConnect(conn.id)}
                      disabled={isConnected || loading}
                      className={`pixel-card p-4 text-left flex items-center gap-3 transition-all ${
                        isConnected
                          ? "border-green-400/50 bg-green-400/5"
                          : "border-yellow-400/20 hover:border-yellow-400/50"
                      }`}
                    >
                      <div
                        className="w-10 h-10 flex items-center justify-center border-4"
                        style={{ borderColor: conn.color, backgroundColor: `${conn.color}15` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: conn.color }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white">{conn.name}</p>
                        <p className="text-[10px] text-[#666666]">{conn.desc}</p>
                      </div>
                      {isConnected && <Check className="w-5 h-5 text-green-400" />}
                      {loading && !isConnected && (
                        <motion.div
                          className="w-4 h-4 border-2 border-t-transparent border-yellow-400 rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep("welcome")}
                  className="pixel-btn pixel-btn-ghost"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep("wiki")}
                  disabled={connected.length === 0}
                  className={`pixel-btn ${
                    connected.length > 0 ? "pixel-btn-yellow" : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === "wiki" && (
            <motion.div
              key="wiki"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="pixel-card border-yellow-400/30 p-8"
            >
              <h2 className="pixel-heading text-[12px] text-yellow-400 mb-2 text-center">
                Name Your Wiki
              </h2>
              <p className="text-[#a0a0a0] text-sm text-center mb-6">
                What topic will your encyclopedia cover?
              </p>

              <div className="mb-6">
                <label className="block text-[10px] text-[#a0a0a0] uppercase tracking-wider mb-2 font-[Press_Start_2P]">
                  Wiki Title
                </label>
                <input
                  type="text"
                  value={wikiName}
                  onChange={(e) => setWikiName(e.target.value)}
                  placeholder="e.g. AI Agent Memory Encyclopedia"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border-4 border-yellow-400/20 text-white placeholder-[#666666] focus:border-yellow-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 mb-6">
                {["My Research", "Work Notes", "Personal KB"].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setWikiName(preset)}
                    className="pixel-btn pixel-btn-ghost text-[8px] py-2"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep("connect")}
                  className="pixel-btn pixel-btn-ghost"
                >
                  Back
                </button>
                <button
                  onClick={handleCreateWiki}
                  disabled={!wikiName.trim() || loading}
                  className={`pixel-btn pixel-btn-solid flex items-center gap-2 ${
                    !wikiName.trim() || loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? (
                    <motion.div
                      className="w-4 h-4 border-2 border-t-transparent border-black rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span className="text-[8px]">Create Wiki</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {step === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="pixel-card border-yellow-400/30 p-8 text-center"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 3 }}
                className="w-24 h-24 bg-yellow-400 mx-auto mb-6 flex items-center justify-center border-4 border-yellow-400"
              >
                <Check className="w-12 h-12 text-black" />
              </motion.div>
              <h2 className="pixel-heading text-[14px] text-yellow-400 mb-4">
                WIKI READY!
              </h2>
              <p className="text-[#a0a0a0] text-lg mb-2">
                {wikiName || "Your Wiki"} is live.
              </p>
              <p className="text-[#666666] text-sm mb-8">
                {connected.includes("demo")
                  ? "Demo data loaded. Explore the app!"
                  : `${connected.length} source(s) connected. Start building!`}
              </p>
              <Link href="/app" className="pixel-btn pixel-btn-solid px-8 py-3 inline-flex items-center gap-2">
                Enter The Maze <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function FeatureBadge({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400/10 border-2 border-yellow-400/20">
      <Icon className="w-3 h-3 text-yellow-400" />
      <span className="text-[10px] text-yellow-400 font-[Press_Start_2P]">{text}</span>
    </div>
  );
}
