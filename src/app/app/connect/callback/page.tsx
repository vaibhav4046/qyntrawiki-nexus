"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, Loader2, AlertTriangle, ArrowRight } from "lucide-react";

export default function ConnectCallbackPage() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [connectorName, setConnectorName] = useState("");

  useEffect(() => {
    if (error) {
      setStatus("error");
      return;
    }

    if (!code) {
      setStatus("error");
      return;
    }

    // Determine connector from state or infer from URL patterns
    const connector = state || "unknown";
    const nameMap: Record<string, string> = {
      "google-drive": "Google Drive",
      "microsoft": "Microsoft 365",
      "notion": "Notion",
    };
    setConnectorName(nameMap[connector] || connector);

    // In production, exchange code for tokens via API route
    // For demo, simulate success after a delay
    const timer = setTimeout(() => {
      setStatus("success");
      // Store in localStorage
      try {
        const existing = JSON.parse(localStorage.getItem("qyntra-connections") || "[]");
        if (!existing.includes(connector)) {
          localStorage.setItem("qyntra-connections", JSON.stringify([...existing, connector]));
        }
      } catch {
        // ignore
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [code, state, error]);

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="pixel-card border-yellow-400/30 p-8 max-w-md w-full text-center"
      >
        {status === "processing" && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-t-transparent border-yellow-400 mx-auto mb-4"
            />
            <h2 className="pixel-heading text-[10px] text-yellow-400 mb-2">
              Connecting {connectorName}...
            </h2>
            <p className="text-sm text-[#a0a0a0]">
              Exchanging authorization code for access tokens.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-green-400 flex items-center justify-center mx-auto mb-4 border-4 border-green-400"
            >
              <Check className="w-8 h-8 text-black" />
            </motion.div>
            <h2 className="pixel-heading text-[12px] text-green-400 mb-2">
              CONNECTED!
            </h2>
            <p className="text-sm text-[#a0a0a0] mb-6">
              {connectorName} is now linked to your wiki.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/app/connect" className="pixel-btn pixel-btn-yellow text-[6px]">
                Back to Connect
              </Link>
              <Link href="/app" className="pixel-btn pixel-btn-solid text-[6px] flex items-center gap-1">
                Dashboard <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-400/10 flex items-center justify-center mx-auto mb-4 border-4 border-red-400/30">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="pixel-heading text-[12px] text-red-400 mb-2">
              CONNECTION FAILED
            </h2>
            <p className="text-sm text-[#a0a0a0] mb-2">
              {error || "Missing authorization code or connection was denied."}
            </p>
            <p className="text-xs text-[#666666] mb-6">
              In production, this would exchange the OAuth code for tokens via a secure server route.
            </p>
            <Link href="/app/connect" className="pixel-btn pixel-btn-yellow text-[6px]">
              Try Again
            </Link>
          </>
        )}
      </motion.div>
    </main>
  );
}
