import {
  ConnectorCredentials,
  ConnectorImplementation,
  SyncItem,
} from "./types";
import { connectorStore } from "./store";

const notionImpl: ConnectorImplementation = {
  sync(
    config: Record<string, unknown>,
    credentials: ConnectorCredentials | null
  ): Promise<SyncItem[]> {
    if (!credentials) {
      return Promise.resolve([]);
    }
    const workspace = String(config.workspace || "workspace");
    const pages: SyncItem[] = [
      {
        title: `Notion page from ${workspace}`,
        rawText:
          "This is a simulated Notion page content. It contains information about projects, tasks, and documentation.",
        url: "https://notion.so/simulated-page-1",
        type: "text",
      },
      {
        title: "Project Requirements Doc",
        rawText:
          "Requirements: Build a graph-first context infrastructure. Must support entity extraction, relation mapping, and contradiction detection.",
        url: "https://notion.so/simulated-page-2",
        type: "text",
      },
    ];
    return Promise.resolve(pages);
  },
  getAuthUrl(connectorId: string): string {
    return `https://api.notion.com/v1/oauth/authorize?client_id=mock&redirect_uri=${encodeURIComponent(
      `http://localhost:3000/api/connectors/${connectorId}/auth`
    )}&response_type=code`;
  },
};

const confluenceImpl: ConnectorImplementation = {
  sync(
    config: Record<string, unknown>,
    credentials: ConnectorCredentials | null
  ): Promise<SyncItem[]> {
    if (!credentials) {
      return Promise.resolve([]);
    }
    const domain = String(config.domain || "example.atlassian.net");
    const spaceKey = String(config.spaceKey || "DEV");
    const pages: SyncItem[] = [
      {
        title: `Confluence: ${spaceKey} Home`,
        rawText: `Welcome to the ${spaceKey} space. This Confluence instance is hosted at ${domain}.`,
        url: `https://${domain}/wiki/spaces/${spaceKey}`,
        type: "text",
      },
      {
        title: "Architecture Decision Record",
        rawText:
          "We decided to use a graph database instead of a vector-only store for agent memory.",
        url: `https://${domain}/wiki/display/${spaceKey}/ADR-001`,
        type: "text",
      },
    ];
    return Promise.resolve(pages);
  },
  getAuthUrl(connectorId: string): string {
    return `https://auth.atlassian.com/authorize?client_id=mock&scope=read:confluence-content&redirect_uri=${encodeURIComponent(
      `http://localhost:3000/api/connectors/${connectorId}/auth`
    )}&response_type=code&state=${connectorId}`;
  },
};

const githubImpl: ConnectorImplementation = {
  sync(
    config: Record<string, unknown>,
    credentials: ConnectorCredentials | null
  ): Promise<SyncItem[]> {
    if (!credentials) {
      return Promise.resolve([]);
    }
    const owner = String(config.owner || "octocat");
    const repo = String(config.repo || "hello-world");
    const pages: SyncItem[] = [
      {
        title: `GitHub Issue #1 in ${owner}/${repo}`,
        rawText:
          "Feature request: Add support for persistent context graphs in AI agents.",
        url: `https://github.com/${owner}/${repo}/issues/1`,
        type: "text",
      },
      {
        title: `README from ${owner}/${repo}`,
        rawText: `# ${repo}\n\nA repository for exploring graph-first context infrastructure.`,
        url: `https://github.com/${owner}/${repo}/blob/main/README.md`,
        type: "text",
      },
    ];
    return Promise.resolve(pages);
  },
};

const googleDriveImpl: ConnectorImplementation = {
  sync(
    config: Record<string, unknown>,
    credentials: ConnectorCredentials | null
  ): Promise<SyncItem[]> {
    if (!credentials) {
      return Promise.resolve([]);
    }
    const folderId = String(config.folderId || "root");
    const pages: SyncItem[] = [
      {
        title: "Q4 Strategy Doc",
        rawText:
          "Our strategy for Q4 focuses on building a context graph product that replaces vector-only retrieval.",
        url: `https://drive.google.com/file/d/${folderId}/view`,
        type: "text",
      },
      {
        title: "Research Notes",
        rawText:
          "Research indicates that graph-based retrieval outperforms vector similarity for multi-hop reasoning.",
        url: `https://drive.google.com/file/d/${folderId}/view`,
        type: "text",
      },
    ];
    return Promise.resolve(pages);
  },
  getAuthUrl(connectorId: string): string {
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=mock&scope=https://www.googleapis.com/auth/drive.readonly&redirect_uri=${encodeURIComponent(
      `http://localhost:3000/api/connectors/${connectorId}/auth`
    )}&response_type=code&access_type=offline&state=${connectorId}`;
  },
};

const slackImpl: ConnectorImplementation = {
  sync(
    _config: Record<string, unknown>,
    credentials: ConnectorCredentials | null
  ): Promise<SyncItem[]> {
    if (!credentials) {
      return Promise.resolve([]);
    }
    return Promise.resolve([
      {
        title: "#general — Weekly Update",
        rawText:
          "Engineering shipped the context graph pipeline. Query latency is down to 80ms p99.",
        url: "https://slack.com/archives/general/p1",
        type: "text",
      },
    ]);
  },
  getAuthUrl(connectorId: string): string {
    return `https://slack.com/oauth/v2/authorize?client_id=mock&scope=channels:history,channels:read&redirect_uri=${encodeURIComponent(
      `http://localhost:3000/api/connectors/${connectorId}/auth`
    )}`;
  },
};

const openaiImpl: ConnectorImplementation = {
  sync(
    _config: Record<string, unknown>,
    credentials: ConnectorCredentials | null
  ): Promise<SyncItem[]> {
    if (!credentials) {
      return Promise.resolve([]);
    }
    return Promise.resolve([
      {
        title: "OpenAI API Docs",
        rawText:
          "OpenAI provides embeddings and completions APIs. The text-embedding-3-small model is recommended for most use cases.",
        url: "https://platform.openai.com/docs",
        type: "text",
      },
    ]);
  },
};

const registry: Record<string, ConnectorImplementation> = {
  notion: notionImpl,
  confluence: confluenceImpl,
  github: githubImpl,
  "google-drive": googleDriveImpl,
  slack: slackImpl,
  openai: openaiImpl,
};

export function getConnectorImpl(type: string): ConnectorImplementation | null {
  return registry[type] || null;
}

export { connectorStore };
export * from "./types";
export * from "./registry";
export { NotionConnector } from "./notion";
export { HydraDBConnector } from "./hydradb";
