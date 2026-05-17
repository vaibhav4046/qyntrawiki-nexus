// src/lib/connectors/notion.ts
// Mock implementation of the Notion connector for QyntraWiki.

import {
  BaseConnector,
  ConnectorConfig,
  ConnectorCredentials,
  ConnectorStatus,
  SyncResult,
  SyncedSource,
} from "./types";
import { getRegistryEntry } from "./registry";
import { cuid } from "@/lib/prisma";

function now(): string {
  return new Date().toISOString();
}

export class NotionConnector implements BaseConnector {
  config: ConnectorConfig;

  constructor(overrides: Partial<ConnectorConfig> = {}) {
    const meta = getRegistryEntry("notion");
    if (!meta) throw new Error("Notion connector not found in registry");

    this.config = {
      id: meta.id,
      name: meta.name,
      type: meta.type,
      icon: meta.icon,
      description: meta.description,
      authFields: meta.authFields,
      isConnected: false,
      status: "disconnected",
      ...overrides,
    };
  }

  getStatus(): ConnectorStatus {
    return this.config.status || "disconnected";
  }

  async authenticate(credentials?: ConnectorCredentials): Promise<ConnectorConfig> {
    this.config.status = "connecting";

    // Simulate OAuth handshake delay
    await new Promise((r) => setTimeout(r, 600));

    const token = credentials?.accessToken || credentials?.integrationToken;
    if (!token) {
      this.config.status = "error";
      throw new Error("Notion integration token is required");
    }

    // Simulate token validation
    if (!token.startsWith("secret_")) {
      this.config.status = "error";
      throw new Error("Invalid Notion integration token format");
    }

    this.config.credentials = { ...this.config.credentials, ...credentials };
    this.config.isConnected = true;
    this.config.status = "connected";
    this.config.lastSync = now();

    return this.config;
  }

  async sync(wikiId: string): Promise<SyncResult> {
    if (!this.config.isConnected) {
      throw new Error("Notion connector is not authenticated");
    }

    this.config.status = "syncing";
    await new Promise((r) => setTimeout(r, 800));

    const mockPages: { title: string; text: string }[] = [
      {
        title: "Product Requirements Doc",
        text: `# Product Requirements Doc

## Objective
Build a graph-first context infrastructure for AI agents.

## Key Features
- Entity extraction at ingestion time
- Relationship mapping between concepts
- Temporal signal tracking
- Contradiction detection across sources

## Success Metrics
- <100ms query latency
- >95% entity recall
- Zero-downtime ingestion pipeline`,
      },
      {
        title: "Meeting Notes — Architecture Review",
        text: `# Architecture Review

Attendees: Engineering, Product, Design

## Decisions
1. Use Rust for the ingestion pipeline (performance)
2. Graph DB layer: native adjacency lists + vector index hybrid
3. API surface: REST + GraphQL for complex traversals

## Open Questions
- How do we handle schema migrations on the context graph?
- GDPR deletion: cascading wipe or tombstones?

## Action Items
- [ ] Draft RFC for graph schema v2
- [ ] Benchmark vector index against pgvector`,
      },
      {
        title: "Research: RAG vs Wiki Patterns",
        text: `# RAG vs Wiki Patterns

RAG systems retrieve raw chunks at query time. They are stateless and treat every chunk as an isolated point.

Wiki patterns pre-compile knowledge into structured articles. They maintain persistent memory, track provenance, and surface contradictions.

## Trade-offs
| Dimension | RAG | Wiki |
|-----------|-----|------|
| Latency | High (retrieval + generation) | Low (pre-compiled) |
| Provenance | Weak | Strong |
| Contradictions | Hidden | Flagged |
| Maintenance | None | Continuous |

## Recommendation
For long-running agent memory, use a Wiki pattern backed by a graph database like HydraDB.`,
      },
    ];

    const sources: SyncedSource[] = mockPages.map((page) => ({
      id: cuid(),
      wikiId,
      type: "notion",
      title: page.title,
      rawText: page.text,
      url: `https://notion.so/mock-page-${Math.random().toString(36).slice(2, 8)}`,
      status: "pending",
      createdAt: now(),
      updatedAt: now(),
    }));

    this.config.status = "connected";
    this.config.lastSync = now();

    return {
      added: sources.length,
      updated: 0,
      errors: 0,
      sources,
      message: `Synced ${sources.length} Notion pages`,
    };
  }

  async disconnect(): Promise<ConnectorConfig> {
    this.config.credentials = undefined;
    this.config.isConnected = false;
    this.config.status = "disconnected";
    this.config.lastSync = undefined;
    return this.config;
  }
}
