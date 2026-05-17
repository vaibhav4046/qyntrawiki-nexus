"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { FolderOpen, FileText, Loader2, Check, Upload, Shield, X } from "lucide-react";

interface ScannedFile {
  name: string;
  path: string;
  extension: string;
  sizeBytes: number;
  type: string;
}

const SUPPORTED_EXTENSIONS = new Set([
  "txt", "md", "json", "csv", "html", "htm",
  "xml", "yaml", "yml", "toml", "ini", "cfg",
  "js", "ts", "jsx", "tsx", "py", "rs", "go",
  "java", "c", "cpp", "h", "rb", "php", "swift",
  "css", "scss", "less", "sql",
]);

function getFileType(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  if (["js", "ts", "jsx", "tsx", "py", "rs", "go", "java", "c", "cpp", "rb"].includes(ext)) return "code";
  if (["md", "txt", "rst"].includes(ext)) return "text";
  if (["json", "csv", "yaml", "yml", "xml"].includes(ext)) return "data";
  if (["html", "htm", "css", "scss"].includes(ext)) return "web";
  return "other";
}

async function scanDirectory(
  dirHandle: FileSystemDirectoryHandle,
  basePath = ""
): Promise<ScannedFile[]> {
  const files: ScannedFile[] = [];

  for await (const entry of dirHandle.values()) {
    const entryPath = basePath ? `${basePath}/${entry.name}` : entry.name;

    if (entry.kind === "file") {
      const ext = entry.name.split(".").pop()?.toLowerCase() || "";
      if (SUPPORTED_EXTENSIONS.has(ext)) {
        try {
          const fileHandle = await dirHandle.getFileHandle(entry.name);
          const file = await fileHandle.getFile();
          files.push({
            name: entry.name,
            path: entryPath,
            extension: ext,
            sizeBytes: file.size,
            type: getFileType(entry.name),
          });
        } catch {
          // Skip files we can't access
        }
      }
    } else if (entry.kind === "directory") {
      try {
        // Skip hidden/system directories
        if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === ".git") continue;

        const subDir = await dirHandle.getDirectoryHandle(entry.name);
        const subFiles = await scanDirectory(subDir, entryPath);
        files.push(...subFiles);
      } catch {
        // Skip directories we can't access
      }
    }
  }

  return files;
}

export default function LocalFolderPicker() {
  const [files, setFiles] = useState<ScannedFile[]>([]);
  const [scanning, setScanning] = useState(false);
  const [selectedDir, setSelectedDir] = useState("");
  const [importing, setImporting] = useState<Set<string>>(new Set());
  const [imported, setImported] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAPISupported = typeof window !== "undefined" && ("showDirectoryPicker" in window || "__TAURI__" in window);
  const isTauri = typeof window !== "undefined" && "__TAURI__" in window;

  async function handlePickFolder() {
    if (!consentGiven) return;

    setError("");
    setScanning(true);
    setFiles([]);

    // Tauri desktop: use native folder picker
    if (isTauri) {
      try {
        const tauriWindow = window as unknown as { __TAURI__: { invoke: (cmd: string, args?: Record<string, unknown>) => Promise<unknown> } };
        const folderPath = await tauriWindow.__TAURI__.invoke("pick_folder") as string;
        if (!folderPath) {
          setError("No folder selected");
          setScanning(false);
          return;
        }
        setSelectedDir(folderPath.split(/[/\\]/).pop() || folderPath);

        const result = await tauriWindow.__TAURI__.invoke("scan_folder", { folderPath }) as {
          files: ScannedFile[];
          folder_name: string;
          total_files: number;
        };

        setFiles(result.files.map((f) => ({
          name: f.name,
          path: f.path,
          extension: f.extension,
          sizeBytes: f.sizeBytes,
          type: getFileType(f.name),
        })));
      } catch (err: unknown) {
        setError((err as Error).message || "Tauri folder scan failed");
      } finally {
        setScanning(false);
      }
      return;
    }

    // Browser: File System Access API
    try {
      // @ts-expect-error - File System Access API
      const dirHandle = await window.showDirectoryPicker({ mode: "read" });
      setSelectedDir(dirHandle.name);

      const scanned = await scanDirectory(dirHandle);
      setFiles(scanned.sort((a, b) => a.path.localeCompare(b.path)));
    } catch (err: unknown) {
      if ((err as Error).name === "AbortError") {
        setError("Folder selection cancelled.");
      } else {
        setError("Could not access folder. Make sure you're using Chrome, Edge, or Opera.");
      }
    } finally {
      setScanning(false);
    }
  }

  async function handleImportFile(file: ScannedFile) {
    setImporting((prev) => new Set(prev).add(file.path));
    try {
      const res = await fetch("/api/wiki/demo-wiki/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "file",
          title: file.name,
          rawText: `File: ${file.path}\nType: ${file.type}\nSize: ${Math.round(file.sizeBytes / 1024)}KB`,
        }),
      });
      if (res.ok) {
        setImported((prev) => new Set(prev).add(file.path));
      }
    } catch {
      console.error("Failed to import:", file.name);
    } finally {
      setImporting((prev) => {
        const next = new Set(prev);
        next.delete(file.path);
        return next;
      });
    }
  }

  async function handleImportAll() {
    for (const file of files) {
      if (!imported.has(file.path)) {
        await handleImportFile(file);
      }
    }
  }

  const totalSize = files.reduce((sum, f) => sum + f.sizeBytes, 0);
  const typeCounts = files.reduce(
    (acc, f) => {
      acc[f.type] = (acc[f.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  if (!isAPISupported) {
    return (
      <div className="glass-card rounded-lg p-6">
        <div className="text-center py-6">
          <Shield className="w-10 h-10 text-[#fbbf24] mx-auto mb-4" />
          <h3 className="text-sm font-bold text-[#f5f0eb] mb-2">
            Local Folder Access
          </h3>
          <p className="text-xs text-[#a89f91] mb-4 max-w-md mx-auto">
            Your browser doesn't support the File System Access API. Use Chrome, Edge, or Opera for native folder access.
          </p>
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Files Instead
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={[...SUPPORTED_EXTENSIONS].map((e) => `.${e}`).join(",")}
              className="hidden"
              onChange={(e) => {
                const selected = Array.from(e.target.files || []);
                const scanned: ScannedFile[] = selected.map((f) => ({
                  name: f.name,
                  path: f.name,
                  extension: f.name.split(".").pop() || "",
                  sizeBytes: f.size,
                  type: getFileType(f.name),
                }));
                setFiles(scanned);
                setSelectedDir(`${selected.length} files selected`);
              }}
            />
            <p className="text-[10px] text-[#6b6560]">
              Supported: {[...SUPPORTED_EXTENSIONS].slice(0, 10).join(", ")}...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-lg p-6">
      {/* Consent */}
      <div className="mb-6">
        <div className="flex items-start gap-3 mb-4">
          <input
            type="checkbox"
            id="local-consent"
            checked={consentGiven}
            onChange={(e) => setConsentGiven(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-amber-500"
          />
          <label htmlFor="local-consent" className="text-xs text-[#a89f91] leading-relaxed">
            I consent to QyntraWiki scanning my selected folder for readable files. Files are only indexed for wiki compilation. Raw files stay local unless explicitly synced.
          </label>
        </div>

        <button
          onClick={handlePickFolder}
          disabled={!consentGiven || scanning}
          className={cn(
            "btn-primary flex items-center gap-2 w-full sm:w-auto",
            (!consentGiven || scanning) && "opacity-50 cursor-not-allowed"
          )}
        >
          {scanning ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Scanning folder...</>
          ) : (
            <><FolderOpen className="w-4 h-4" /> Pick Folder</>
          )}
        </button>

        {error && (
          <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
            <X className="w-3 h-3" /> {error}
          </p>
        )}
      </div>

      {/* Results */}
      {files.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-[#f5f0eb]">
                {selectedDir} — {files.length} files
              </p>
              <p className="text-xs text-[#6b6560]">
                {Math.round(totalSize / 1024)}KB total
                {Object.entries(typeCounts).map(([type, count]) => (
                  <span key={type} className="ml-3">
                    {type}: {count}
                  </span>
                ))}
              </p>
            </div>
            <button
              onClick={handleImportAll}
              disabled={importing.size > 0}
              className="btn-secondary text-xs flex items-center gap-1.5"
            >
              {importing.size > 0 ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              Import All
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto space-y-1">
            {files.map((file) => (
              <div
                key={file.path}
                className="flex items-center justify-between px-3 py-2 rounded border border-[rgba(107,101,96,0.1)] hover:bg-[rgba(245,158,11,0.03)] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-4 h-4 text-[#6b6560] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[#f5f0eb] truncate">{file.name}</p>
                    <p className="text-[10px] text-[#6b6560] truncate">
                      {file.path} · {Math.round(file.sizeBytes / 1024)}KB · {file.type}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleImportFile(file)}
                  disabled={importing.has(file.path) || imported.has(file.path)}
                  className={cn(
                    "ml-2 shrink-0 text-xs px-2 py-1 rounded transition-all flex items-center gap-1",
                    imported.has(file.path)
                      ? "bg-[rgba(34,197,94,0.15)] text-green-400"
                      : importing.has(file.path)
                      ? "bg-[rgba(59,130,246,0.1)] text-[#60a5fa]"
                      : "btn-ghost hover:text-[#fbbf24]"
                  )}
                >
                  {importing.has(file.path) ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : imported.has(file.path) ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Upload className="w-3 h-3" />
                  )}
                  {imported.has(file.path) ? "Imported" : importing.has(file.path) ? "..." : "Import"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!files.length && !scanning && !error && (
        <div className="empty-state py-8">
          <FolderOpen className="w-8 h-8 mb-3" />
          <p className="text-sm text-[#a89f91]">Select a folder to scan for readable files.</p>
          <p className="text-xs text-[#6b6560] mt-1">
            QyntraWiki will show a preview before importing anything.
          </p>
        </div>
      )}
    </div>
  );
}
