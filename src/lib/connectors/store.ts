import { Connector } from "./types";

let _seeded = false;

function getConnectorStore(): Map<string, Connector> {
  const g = globalThis as Record<string, unknown>;
  if (!g.__qyntra_connectors) {
    g.__qyntra_connectors = new Map<string, Connector>();
  }
  return g.__qyntra_connectors as Map<string, Connector>;
}

function cuid(): string {
  return `conn_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function now(): string {
  return new Date().toISOString();
}

export const connectorStore = {
  findMany(): Connector[] {
    const store = getConnectorStore();
    return Array.from(store.values());
  },

  findById(id: string): Connector | null {
    return getConnectorStore().get(id) || null;
  },

  create(data: Omit<Connector, "id" | "createdAt" | "updatedAt">): Connector {
    const store = getConnectorStore();
    const record: Connector = {
      id: cuid(),
      ...data,
      createdAt: now(),
      updatedAt: now(),
    };
    store.set(record.id, record);
    return record;
  },

  update(
    id: string,
    data: Partial<Omit<Connector, "id" | "createdAt" | "updatedAt">>
  ): Connector {
    const store = getConnectorStore();
    const existing = store.get(id);
    if (!existing) {
      throw new Error(`Connector not found: ${id}`);
    }
    const updated: Connector = {
      ...existing,
      ...data,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: now(),
    };
    store.set(id, updated);
    return updated;
  },

  delete(id: string): Connector {
    const store = getConnectorStore();
    const existing = store.get(id);
    if (!existing) {
      throw new Error(`Connector not found: ${id}`);
    }
    store.delete(id);
    return existing;
  },
};

function seedIfEmpty(): void {
  if (_seeded) return;
  if (getConnectorStore().size > 0) {
    _seeded = true;
    return;
  }

  connectorStore.create({
    name: "Slack",
    type: "slack",
    authType: "oauth",
    description: "Sync messages and channels from your Slack workspace",
    icon: "MessageSquare",
    config: {},
    connected: false,
    credentials: null,
    lastSyncedAt: null,
  });

  connectorStore.create({
    name: "Notion",
    type: "notion",
    authType: "oauth",
    description: "Import pages and databases from your Notion workspace",
    icon: "FileText",
    config: {},
    connected: true,
    credentials: { accessToken: "mock_notion_token" },
    lastSyncedAt: "2025-05-15T14:30:00Z",
  });

  connectorStore.create({
    name: "Google Drive",
    type: "google-drive",
    authType: "oauth",
    description: "Sync documents, sheets, and slides from Google Drive",
    icon: "Cloud",
    config: {},
    connected: false,
    credentials: null,
    lastSyncedAt: null,
  });

  connectorStore.create({
    name: "OpenAI",
    type: "openai",
    authType: "apikey",
    description: "Connect your OpenAI API key for embeddings and completions",
    icon: "Brain",
    config: {},
    connected: true,
    credentials: { apiKey: "sk-••••••••••••••••••••••••••••••" },
    lastSyncedAt: "2025-05-14T09:15:00Z",
  });

  connectorStore.create({
    name: "GitHub",
    type: "github",
    authType: "token",
    description: "Sync repositories, issues, and pull requests",
    icon: "Github",
    config: { owner: "", repo: "" },
    connected: false,
    credentials: null,
    lastSyncedAt: null,
  });

  connectorStore.create({
    name: "Anthropic",
    type: "anthropic",
    authType: "apikey",
    description: "Connect Claude API for advanced reasoning tasks",
    icon: "Sparkles",
    config: {},
    connected: false,
    credentials: null,
    lastSyncedAt: null,
  });

  connectorStore.create({
    name: "CSV Upload",
    type: "csv",
    authType: "file",
    description: "Drag and drop CSV files to import structured data",
    icon: "Sheet",
    config: {},
    connected: false,
    credentials: null,
    lastSyncedAt: null,
  });

  connectorStore.create({
    name: "PDF Documents",
    type: "pdf",
    authType: "file",
    description: "Upload PDF files to extract text and images",
    icon: "FileType",
    config: {},
    connected: false,
    credentials: null,
    lastSyncedAt: null,
  });

  connectorStore.create({
    name: "Markdown Files",
    type: "markdown",
    authType: "file",
    description: "Import .md files with frontmatter support",
    icon: "Code",
    config: {},
    connected: false,
    credentials: null,
    lastSyncedAt: null,
  });

  connectorStore.create({
    name: "LinkedIn",
    type: "linkedin",
    authType: "oauth",
    description: "Import articles and activity from your LinkedIn profile",
    icon: "Linkedin",
    config: {},
    connected: false,
    credentials: null,
    lastSyncedAt: null,
  });

  connectorStore.create({
    name: "Instagram",
    type: "instagram",
    authType: "oauth",
    description: "Pull captions and media metadata from Instagram",
    icon: "Instagram",
    config: {},
    connected: false,
    credentials: null,
    lastSyncedAt: null,
  });

  connectorStore.create({
    name: "X / Twitter",
    type: "x-twitter",
    authType: "oauth",
    description: "Sync tweets, threads, and bookmarks from X",
    icon: "Twitter",
    config: {},
    connected: false,
    credentials: null,
    lastSyncedAt: null,
  });

  connectorStore.create({
    name: "Obsidian",
    type: "obsidian",
    authType: "file",
    description: "Import Markdown vaults from your local Obsidian folder",
    icon: "BookMarked",
    config: {},
    connected: false,
    credentials: null,
    lastSyncedAt: null,
  });

  connectorStore.create({
    name: "Browser History",
    type: "browser-history",
    authType: "browser",
    description: "Sync recently visited pages from your browser history",
    icon: "Globe",
    config: {},
    connected: false,
    credentials: null,
    lastSyncedAt: null,
  });

  connectorStore.create({
    name: "Local Files",
    type: "local-files",
    authType: "file",
    description: "Index Markdown, TXT, and PDF files from a local directory",
    icon: "FolderOpen",
    config: {},
    connected: false,
    credentials: null,
    lastSyncedAt: null,
  });

  connectorStore.create({
    name: "HydraDB",
    type: "hydradb",
    authType: "apikey",
    description: "Connect to your HydraDB tenant for graph-powered recall and ingestion",
    icon: "Database",
    config: {},
    connected: true,
    credentials: { apiKey: "hydra_demo_key" },
    lastSyncedAt: now(),
  });

  _seeded = true;
}

seedIfEmpty();
