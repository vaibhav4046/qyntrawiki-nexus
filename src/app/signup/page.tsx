"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Database, Globe, Monitor, Mail, Lock, User, Sparkles, ArrowRight, Ghost } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleOAuth(provider: string) {
    setLoading(provider);
    setError("");
    await signIn(provider, { callbackUrl: "/onboarding" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("All fields required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading("credentials");
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      name,
      mode: "register",
      callbackUrl: "/onboarding",
      redirect: false,
    });

    if (result?.error) {
      setError("Email already registered or registration failed");
      setLoading(null);
    } else {
      window.location.href = "/onboarding";
    }
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      <motion.div className="absolute top-16 left-8 opacity-[0.07]" animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity }}>
        <GhostSVG color="#ff0000" size={64} />
      </motion.div>
      <motion.div className="absolute bottom-16 right-8 opacity-[0.07]" animate={{ y: [0, -12, 0] }} transition={{ duration: 3.5, repeat: Infinity }}>
        <GhostSVG color="#00ffff" size={48} />
      </motion.div>

      <div className="w-full max-w-sm relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-14 h-14 bg-yellow-400 flex items-center justify-center mx-auto mb-4 border-4 border-yellow-400">
            <Database className="w-7 h-7 text-black" />
          </div>
          <h1 className="pixel-heading text-[12px] text-white mb-1">QyntraWiki</h1>
          <p className="text-[#a0a0a0] text-sm">Create your account</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="pixel-card border-red-500/30 p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border-2 border-red-500/30 text-red-400 text-xs text-center font-[VT323]">
              {error}
            </div>
          )}

          {/* OAuth */}
          <div className="space-y-2.5 mb-5">
            <OAuthButton provider="google" icon={Globe} label="Continue with Google" color="#e63946" borderColor="rgba(230,57,70,0.35)" loading={loading} onClick={() => handleOAuth("google")} />
            <OAuthButton provider="microsoft-entra-id" icon={Monitor} label="Continue with Microsoft" color="#00ffff" borderColor="rgba(0,180,216,0.3)" loading={loading} onClick={() => handleOAuth("microsoft-entra-id")} />
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-[2px] bg-red-500/15" />
            <span className="text-[9px] text-[#666666] font-[Press_Start_2P]">OR</span>
            <div className="flex-1 h-[2px] bg-red-500/15" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[9px] text-[#a0a0a0] uppercase tracking-wider mb-1.5 font-[Press_Start_2P]">Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#666666]" />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Player One" required
                  className="w-full pl-9 pr-3 py-2.5 bg-[#0a0a0a] border-4 border-red-500/20 text-white placeholder-[#444] focus:border-yellow-400 outline-none text-sm font-[VT323]" />
              </div>
            </div>
            <div>
              <label className="block text-[9px] text-[#a0a0a0] uppercase tracking-wider mb-1.5 font-[Press_Start_2P]">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#666666]" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="player@qyntra.dev" required
                  className="w-full pl-9 pr-3 py-2.5 bg-[#0a0a0a] border-4 border-red-500/20 text-white placeholder-[#444] focus:border-yellow-400 outline-none text-sm font-[VT323]" />
              </div>
            </div>
            <div>
              <label className="block text-[9px] text-[#a0a0a0] uppercase tracking-wider mb-1.5 font-[Press_Start_2P]">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#666666]" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" required minLength={6}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#0a0a0a] border-4 border-red-500/20 text-white placeholder-[#444] focus:border-yellow-400 outline-none text-sm font-[VT323]" />
              </div>
            </div>
            <button type="submit" disabled={!!loading}
              className="w-full pixel-btn pixel-btn-solid py-2.5 flex items-center justify-center gap-2 text-[7px]">
              {loading === "credentials" ? <Spinner /> : <><Sparkles className="w-3.5 h-3.5" /> CREATE ACCOUNT</>}
            </button>
          </form>

          <p className="text-center text-[10px] text-[#666666] mt-4 font-[VT323]">
            Already have an account?{" "}
            <Link href="/login" className="text-red-500 hover:underline font-[Press_Start_2P] text-[8px]">SIGN IN</Link>
          </p>
        </motion.div>
      </div>
    </main>
  );
}

function OAuthButton({ provider, icon: Icon, label, color, borderColor, loading, onClick }: {
  provider: string; icon: React.ElementType; label: string; color: string; borderColor: string;
  loading: string | null; onClick: () => void;
}) {
  const isLoading = loading === provider;
  return (
    <button onClick={onClick} disabled={isLoading}
      className="w-full flex items-center gap-3 py-2.5 px-4 border-4 text-left transition-all hover:brightness-110"
      style={{ borderColor, backgroundColor: `${color}08` }}>
      {isLoading ? <Spinner size={14} color={color} /> : <Icon className="w-4 h-4 shrink-0" style={{ color }} />}
      <span className="text-[7px] font-[Press_Start_2P]" style={{ color }}>{label}</span>
    </button>
  );
}

function Spinner({ size = 16, color = "#e63946" }: { size?: number; color?: string }) {
  return (
    <motion.div className="rounded-full border-t-transparent"
      style={{ width: size, height: size, borderWidth: 2, borderColor: `${color} transparent ${color} ${color}` }}
      animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
  );
}

function GhostSVG({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2C7.58 2 4 5.58 4 10v10c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-3h2v3c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-3h2v3c0 .55.45 1 1 1h2c.55 0 1-.45 1-1V10c0-4.42-3.58-8-8-8z" />
      <circle cx="9" cy="9" r="2" fill="white" /><circle cx="15" cy="9" r="2" fill="white" />
      <circle cx="9" cy="9" r="1" fill="black" /><circle cx="15" cy="9" r="1" fill="black" />
    </svg>
  );
}
