"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Database, Globe, Smartphone, Monitor, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleOAuth(provider: string) {
    setLoading(provider);
    setError("");
    try {
      await signIn(provider, { callbackUrl: "/onboarding" });
    } catch {
      setError(`${provider} sign-in failed. Check environment variables.`);
    } finally {
      setLoading(null);
    }
  }

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setLoading("credentials");
    setError("");
    try {
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl: "/onboarding",
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid email or password");
      } else {
        window.location.href = "/onboarding";
      }
    } catch {
      setError("Sign-in failed");
    } finally {
      setLoading(null);
    }
  }

  const oauthButtons = [
    { id: "google", label: "Continue with Google", icon: Globe, color: "#ffeb3b", borderColor: "rgba(255,235,59,0.4)" },
    { id: "apple", label: "Continue with Apple", icon: Smartphone, color: "#f5f5f5", borderColor: "rgba(245,245,245,0.3)" },
    { id: "microsoft-entra-id", label: "Continue with Microsoft", icon: Monitor, color: "#00ffff", borderColor: "rgba(0,255,255,0.3)" },
  ];

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden crt-on">
      {/* Background ghosts */}
      <motion.div
        className="absolute top-20 left-10 opacity-10"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <GhostSVG color="#ff0000" size={80} />
      </motion.div>
      <motion.div
        className="absolute bottom-20 right-10 opacity-10"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 3.5, repeat: Infinity }}
      >
        <GhostSVG color="#ffb8ff" size={60} />
      </motion.div>
      <motion.div
        className="absolute top-40 right-20 opacity-10"
        animate={{ y: [0, -25, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
      >
        <GhostSVG color="#00ffff" size={50} />
      </motion.div>

      {/* Pac-Man chomp in corner */}
      <div className="absolute bottom-10 left-10 w-16 h-16 bg-yellow-400 pac-chomp opacity-20" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-yellow-400 flex items-center justify-center mx-auto mb-4 border-4 border-yellow-400">
            <Database className="w-8 h-8 text-black" />
          </div>
          <h1 className="pixel-heading text-[14px] text-white mb-2">QyntraWiki</h1>
          <p className="text-[#a0a0a0] text-sm">Your personal Wikipedia awaits</p>
        </motion.div>

        {/* Login card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="pixel-card border-yellow-400/30"
        >
          <h2 className="pixel-heading text-[10px] text-yellow-400 mb-6 text-center">
            INSERT COIN TO PLAY
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border-2 border-red-500/30 text-red-400 text-xs text-center">
              {error}
            </div>
          )}

          {/* OAuth buttons */}
          <div className="space-y-3 mb-6">
            {oauthButtons.map((btn) => {
              const Icon = btn.icon;
              return (
                <button
                  key={btn.id}
                  onClick={() => handleOAuth(btn.id)}
                  disabled={!!loading}
                  className="w-full pixel-btn flex items-center justify-center gap-3 py-3"
                  style={{ borderColor: btn.borderColor, color: btn.color }}
                >
                  {loading === btn.id ? (
                    <motion.div
                      className="w-4 h-4 border-2 border-t-transparent rounded-full"
                      style={{ borderColor: btn.color }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                  <span className="text-[8px]">{btn.label}</span>
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-[2px] bg-yellow-400/20" />
            <span className="text-[10px] text-[#666666]">OR</span>
            <div className="flex-1 h-[2px] bg-yellow-400/20" />
          </div>

          {/* Email form */}
          <form onSubmit={handleCredentials} className="space-y-4">
            <div>
              <label className="block text-[10px] text-[#a0a0a0] uppercase tracking-wider mb-2 font-[Press_Start_2P]">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="player@qyntrawiki.dev"
                  className="w-full pl-10 pr-4 py-3 bg-[#0a0a0a] border-4 border-yellow-400/20 text-white placeholder-[#666666] focus:border-yellow-400 outline-none"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-[#a0a0a0] uppercase tracking-wider mb-2 font-[Press_Start_2P]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-[#0a0a0a] border-4 border-yellow-400/20 text-white placeholder-[#666666] focus:border-yellow-400 outline-none"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={!!loading}
              className="w-full pixel-btn pixel-btn-solid py-3 flex items-center justify-center gap-2"
            >
              {loading === "credentials" ? (
                <motion.div
                  className="w-4 h-4 border-2 border-t-transparent border-black rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span className="text-[8px]">START GAME</span>
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-[10px] text-[#666666] mt-6"
        >
          By signing in, you agree to our{" "}
          <Link href="#" className="text-yellow-400 hover:underline">Privacy Policy</Link>
          {" "}and{" "}
          <Link href="#" className="text-yellow-400 hover:underline">Terms</Link>.
        </motion.p>
      </div>
    </main>
  );
}

function GhostSVG({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2C7.58 2 4 5.58 4 10v10c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-3h2v3c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-3h2v3c0 .55.45 1 1 1h2c.55 0 1-.45 1-1V10c0-4.42-3.58-8-8-8z" />
      <circle cx="9" cy="9" r="2" fill="white" />
      <circle cx="15" cy="9" r="2" fill="white" />
      <circle cx="9" cy="9" r="1" fill="black" />
      <circle cx="15" cy="9" r="1" fill="black" />
    </svg>
  );
}
