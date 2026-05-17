// lib/prisma.ts - In-memory Map-based data store for Vercel serverless
// Persists across hot reloads in dev via globalThis

type Data = Record<string, unknown>;
type Where = Record<string, unknown>;

let _seeded = false;
let _seeding = false;

function getGlobalStore(): Map<string, Data[]> {
  const g = globalThis as Record<string, unknown>;
  if (!g.__qyntra_store) {
    g.__qyntra_store = new Map<string, Data[]>();
  }
  return g.__qyntra_store as Map<string, Data[]>;
}

export function cuid(): string {
  return `c_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function match(record: Data, where: Where): boolean {
  for (const [k, v] of Object.entries(where)) {
    if (record[k] !== v) return false;
  }
  return true;
}

function createStore(name: string) {
  function getRows(): Data[] {
    const store = getGlobalStore();
    if (!store.has(name)) store.set(name, []);
    return store.get(name)!;
  }

  return {
    _name: name,
    _rows() { return getRows(); },

    findMany(opts?: { where?: Where; orderBy?: Record<string, string | number>; take?: number }): Data[] {
      let rows = [...getRows()];
      if (opts?.where) rows = rows.filter(r => match(r, opts.where!));
      if (opts?.orderBy) {
        const [key, dir] = Object.entries(opts.orderBy)[0];
        rows.sort((a, b) => {
          const av = a[key];
          const bv = b[key];
          let cmp = 0;
          if (typeof av === "number" && typeof bv === "number") {
            cmp = av - bv;
          } else {
            cmp = String(av || "").localeCompare(String(bv || ""));
          }
          return dir === "desc" ? -cmp : cmp;
        });
      }
      if (opts?.take) rows = rows.slice(0, opts.take);
      return rows;
    },

    findFirst(opts?: { where?: Where }): Data | null {
      const rows = getRows();
      return rows.find(r => match(r, opts?.where || {})) || null;
    },

    findUnique(opts: { where: Where }): Data | null {
      return this.findFirst({ where: opts.where });
    },

    create(opts: { data: Data }): Data {
      const rows = getRows();
      const record: Data = { id: cuid(), ...opts.data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      rows.push(record);
      return record;
    },

    update(opts: { where: Where; data: Data }): Data {
      const rows = getRows();
      const idx = rows.findIndex(r => match(r, opts.where));
      if (idx === -1) throw new Error(`${name} not found`);
      rows[idx] = { ...rows[idx], ...opts.data, updatedAt: new Date().toISOString() };
      return rows[idx];
    },

    updateMany(opts: { where: Where; data: Data }): { count: number } {
      const rows = getRows();
      let count = 0;
      for (let i = 0; i < rows.length; i++) {
        if (match(rows[i], opts.where)) {
          rows[i] = { ...rows[i], ...opts.data, updatedAt: new Date().toISOString() };
          count++;
        }
      }
      return { count };
    },

    upsert(opts: { where: Where; create: Data; update: Data }): Data {
      const existing = this.findFirst({ where: opts.where });
      if (existing) return this.update({ where: { id: existing.id as string }, data: opts.update });
      return this.create({ data: { ...opts.create, ...opts.where } });
    },

    count(opts?: { where?: Where }): number {
      let rows = getRows();
      if (opts?.where) rows = rows.filter(r => match(r, opts.where!));
      return rows.length;
    },

    delete(opts: { where: Where }): Data {
      const rows = getRows();
      const idx = rows.findIndex(r => match(r, opts.where));
      if (idx === -1) throw new Error(`${name} not found`);
      return rows.splice(idx, 1)[0];
    },

    deleteMany(opts: { where: Where }): { count: number } {
      const rows = getRows();
      let count = 0;
      for (let i = rows.length - 1; i >= 0; i--) {
        if (match(rows[i], opts.where)) {
          rows.splice(i, 1);
          count++;
        }
      }
      return { count };
    },
  };
}

const db = {
  user: createStore("users"),
  wiki: createStore("wikis"),
  connector: createStore("connectors"),
  source: createStore("sources"),
  fileItem: createStore("file_items"),
  page: createStore("pages"),
  pageRevision: createStore("page_revisions"),
  entity: createStore("entities"),
  relation: createStore("relations"),
  claim: createStore("claims"),
  citation: createStore("citations"),
  ingestJob: createStore("ingest_jobs"),
  askSession: createStore("ask_sessions"),
  publishSettings: createStore("publish_settings"),
};

function seedIfEmpty() {
  if (_seeded || _seeding) return;
  if (db.wiki.count() > 0) { _seeded = true; return; }
  _seeding = true;

  const wikiId = "demo-wiki";
  const now = new Date().toISOString();

  // User
  db.user.create({
    data: {
      id: "user-demo",
      email: "demo@qyntrawiki.dev",
      name: "Demo User",
    },
  });

  db.wiki.create({
    data: {
      id: wikiId,
      name: "AI Agent Memory Encyclopedia",
      slug: "ai-agent-memory",
      description: "A living encyclopedia about HydraDB, LLM Wikis, RAG, memory, agents, and context graphs",
      topic: "AI Agent Memory Stack",
      tenantId: "qyntra_ai-agent-memory",
      isPublished: true,
      userId: "user-demo",
    },
  });

  // Publish settings
  db.publishSettings.create({
    data: {
      id: "pub-demo",
      wikiId,
      publicSlug: "ai-agent-memory",
      publicTitle: "AI Agent Memory Encyclopedia",
      publicDescription: "A public knowledge base about AI agent memory, context graphs, and wiki systems.",
      allowedPageSlugs: JSON.stringify(["hydradb", "context-graph", "llm-wiki", "vector-search-limitations", "rag-vs-wiki", "contradiction-detection"]),
      hidePrivateSources: true,
      showGeneratedLabel: true,
    },
  });

  const pageSeeds = [
    {
      id: "page-hydradb",
      title: "HydraDB",
      slug: "hydradb",
      summary: "HydraDB is a graph-first context infrastructure for AI agents that builds an ontology-first context graph over ingested data, tracking entities, relationships, and temporal signals.",
      contentMd: `# HydraDB

**HydraDB** is a graph-first context infrastructure for AI agents. It replaces traditional vector-only retrieval with a multi-stage intelligent recall pipeline that returns relevance instead of similarity.

## Overview

Unlike vector databases that treat every chunk as an isolated point, HydraDB builds a persistent context graph over your data. Entities, relationships, and temporal signals are extracted automatically at write time.

## Architecture

The HydraDB pipeline runs in stages:
1. **Ingestion** - Documents are chunked and processed
2. **Entity Extraction** - Named entities are identified and typed
3. **Relation Mapping** - Relationships between entities are detected
4. **Graph Construction** - A knowledge graph is built and maintained
5. **Contradiction Detection** - Conflicting claims are flagged

## Context Graph

The context graph is an ontology-first representation of your knowledge. When you query for "Apple," HydraDB knows you mean the customer you serve, not the fruit.

## Recall Pipeline

Every retrieval runs through a multi-stage intelligent recall pipeline:
- Metadata filter
- Hybrid retrieval (dense + sparse)
- Graph traversal
- Personalized ranking
- Results

## Key Concepts

- **Stateful Agents**: HydraDB enables agents to maintain a persistent understanding that evolves
- **Provenance**: Every claim is linked to its source document
- **Temporal Awareness**: The graph tracks when information was added and how it has changed
- **Contradiction Detection**: Conflicting claims across sources are automatically detected

## References

- HydraDB Documentation
- Comparison with Vector Databases`,
      infoboxJson: JSON.stringify({ type: "Product", status: "active", confidence: 0.9, sourceCount: 4, provider: "HydraDB" }),
      confidenceScore: 0.9,
      coverageScore: 0.85,
      healthScore: 0.88,
      isPublic: true,
    },
    {
      id: "page-context-graph",
      title: "Context Graph",
      slug: "context-graph",
      summary: "A context graph is a persistent, evolving knowledge structure that tracks entities, their relationships, and temporal signals across ingested documents.",
      contentMd: `# Context Graph

A **context graph** is the core data structure in HydraDB. It models knowledge as a graph of entities connected by typed relationships, enriched with temporal metadata and confidence scores.

## Overview

Unlike a flat document store or vector index, a context graph preserves the structure of knowledge. Entities are nodes. Relationships are edges. Each has metadata about when it was added, which source it came from, and how confident the system is about it.

## Entity Types

Entities in a context graph can be:
- **Products** - Software, hardware, tools
- **Concepts** - Ideas, theories, patterns
- **Persons** - Individuals and their roles
- **Organizations** - Companies, teams, groups
- **Events** - Temporal occurrences
- **Locations** - Physical or virtual places

## Relation Types

Relationships are typed and weighted:
- **BUILDS** - One entity creates/constructs another
- **USES** - Dependencies and tool usage
- **TRACKS** - Monitoring and observation
- **CONTRADICTS** - Direct opposition between claims
- **SUPPORTS** - Corroborating evidence
- **RELATES_TO** - General association

## Query Paths

When querying the context graph, the system traverses paths through the graph:
- Direct neighbors (1-hop)
- Multi-hop traversal with relevance decay
- Subgraph extraction for focused queries

## Temporal Tracking

Every node and edge has timestamps for:
- **Created at** - When first observed
- **Updated at** - Most recent modification
- **Last verified** - When last cross-checked

## References

- HydraDB Architecture Documentation`,
      infoboxJson: JSON.stringify({ type: "Concept", status: "active", confidence: 0.85, sourceCount: 3 }),
      confidenceScore: 0.85,
      coverageScore: 0.75,
      healthScore: 0.82,
      isPublic: true,
    },
    {
      id: "page-llm-wiki",
      title: "LLM Wiki",
      slug: "llm-wiki",
      summary: "The LLM Wiki pattern lets an LLM incrementally build and maintain a persistent, structured wiki with cross-references, contradiction tracking, and automatic updates.",
      contentMd: `# LLM Wiki

An **LLM Wiki** is a knowledge management pattern where an AI language model maintains a wiki autonomously, handling ingestion, compilation, contradiction detection, and page generation.

## Overview

Instead of retrieving from raw documents at query time (as in RAG), an LLM Wiki builds a structured, interlinked collection of markdown articles. When new sources arrive, the LLM integrates them into the existing wiki.

## Compilation Pipeline

1. **Source Ingestion** - Documents are uploaded and parsed
2. **Entity Extraction** - Key entities and claims are identified
3. **Contradiction Detection** - New claims are checked against existing ones
4. **Page Generation** - Wikipedia-style articles are generated or updated
5. **Citation Creation** - Every claim is linked back to its source
6. **Health Scoring** - Pages receive scores based on citations, sources, and freshness

## Advantages Over RAG

- **Persistent memory** - Knowledge accumulates over time
- **Source lineage** - Every fact traces back to its origin
- **Contradiction awareness** - Conflicting claims are surfaced, not smoothed over
- **Structured output** - Articles have headings, infoboxes, and cross-references
- **Compounding value** - Each new source improves the existing wiki

## Use Cases

- Research knowledge bases
- Company internal documentation
- Personal knowledge management
- Educational wikis
- Technical documentation sites

## References`,
      infoboxJson: JSON.stringify({ type: "Concept", status: "active", confidence: 0.88, sourceCount: 2 }),
      confidenceScore: 0.88,
      coverageScore: 0.7,
      healthScore: 0.8,
      isPublic: true,
    },
    {
      id: "page-vector-search",
      title: "Vector Search Limitations",
      slug: "vector-search-limitations",
      summary: "Vector databases return semantic similarity scores but fail to track relationships, contradictions, provenance, and temporal context needed for stateful AI agents.",
      contentMd: `# Vector Search Limitations

**Vector databases** are search engines that excel at finding semantically similar content. However, they have significant limitations when used as the sole knowledge store for stateful AI agents.

## Overview

Vector search answers one question well: "What is most similar to this query?" For stateful agents that need to maintain consistent knowledge over time, this breaks because vector search treats every chunk as an isolated point.

## Key Limitations

### No Relationship Tracking
Vector search does not model how entities relate to each other. Two documents may be similar but describe competing products or contradictory theories.

### No Contradiction Detection
There is no concept of "this claim contradicts that claim." Every chunk is treated as equally credible, and no cross-source validation occurs.

### No Provenance
Standard vector systems don't track which source produced which claim. When multiple documents describe the same topic, the system merges them without attribution.

### No Temporal Context
Vector databases don't track when information was added. There's no way to know if a chunk represents current understanding or outdated information.

### No Confidence Weighting
All retrieved chunks are weighted by similarity alone, not by the reliability of their sources or how well they've been verified.

## Alternatives

- **Graph-based systems** (HydraDB) model entities and relationships explicitly
- **Hybrid approaches** combine vector search with structured knowledge graphs
- **Wiki-based systems** (LLM Wiki pattern) maintain structured, versioned knowledge

## References

- HydraDB vs Vector Databases`,
      infoboxJson: JSON.stringify({ type: "Concept", status: "active", confidence: 0.82, sourceCount: 2 }),
      confidenceScore: 0.82,
      coverageScore: 0.65,
      healthScore: 0.75,
      isPublic: true,
    },
    {
      id: "page-rag-vs-wiki",
      title: "RAG vs Wiki",
      slug: "rag-vs-wiki",
      summary: "Retrieval-Augmented Generation (RAG) and Wiki-based approaches represent two different paradigms for AI knowledge management: stateless retrieval vs. persistent compilation.",
      contentMd: `# RAG vs Wiki

**Retrieval-Augmented Generation (RAG)** and **Wiki-based compilation** represent fundamentally different approaches to managing knowledge for AI systems.

## RAG (Retrieval-Augmented Generation)

RAG systems:
- Retrieve chunks by embedding similarity at query time
- Generate answers by combining retrieved text with LLM reasoning
- Are stateless - each query starts fresh
- Treat all sources as equally credible
- Produce smooth answers without provenance

## Wiki-Based Compilation

Wiki systems:
- Pre-process sources into structured articles
- Maintain persistent, versioned knowledge
- Track source lineage and citations
- Detect and flag contradictions
- Build cross-references between topics

## Comparison

| Feature | RAG | Wiki |
|---------|-----|------|
| State | Stateless | Persistent |
| Provenance | None | Full source links |
| Contradictions | Hidden | Surfaced |
| Updates | None | Incremental |
| Structure | Flat chunks | Structured pages |
| Citations | Typically none | Every claim cited |
| Scale | Unlimited queries | Pages grow with sources |

## When to Use Each

- **RAG**: Quick Q&A over static document sets, chatbots, simple search
- **Wiki**: Research knowledge bases, documentation, any use case needing provenance, contradiction tracking, or evolving knowledge

## References`,
      infoboxJson: JSON.stringify({ type: "Concept", status: "active", confidence: 0.9, sourceCount: 3 }),
      confidenceScore: 0.9,
      coverageScore: 0.8,
      healthScore: 0.85,
      isPublic: true,
    },
    {
      id: "page-contradiction",
      title: "Contradiction Detection",
      slug: "contradiction-detection",
      summary: "Automated contradiction detection identifies conflicting claims across sources by comparing subjects, predicates, and objects, then flags them for human review.",
      contentMd: `# Contradiction Detection

**Contradiction detection** is the automated process of identifying when two or more claims in a knowledge base disagree with each other. It is a core feature of LLM Wikis and HydraDB-powered systems.

## Overview

When sources contain conflicting information, a naive RAG system will blend them into an incoherent answer. Contradiction detection ensures that conflicting claims are surfaced, tracked, and resolved rather than silently merged.

## Detection Algorithm

1. **Normalize** - Strip formatting, lowercasing, remove punctuation
2. **Match Subjects** - Identify claims about the same entity
3. **Match Predicates** - Find claims using the same or opposite predicates
4. **Compare Objects** - Determine if objects are incompatible
5. **Score Confidence** - Weight by claim confidence and source reliability
6. **Flag Disputes** - Mark conflicting claims with explanation

## Opposite Predicate Pairs

The system recognizes pairs like:
- "is" / "is not"
- "supports" / "contradicts"
- "enables" / "prevents"
- "increases" / "decreases"
- "can" / "cannot"

## Resolution

When contradictions are detected:
1. Both claims are marked as "disputed"
2. An explanation is generated
3. Users can review and resolve
4. Resolution changes propagate to affected pages

## Health Score Impact

Pages with unresolved contradictions receive lower health scores, signaling that the content may be unreliable.

## References`,
      infoboxJson: JSON.stringify({ type: "Concept", status: "active", confidence: 0.78, sourceCount: 2 }),
      confidenceScore: 0.78,
      coverageScore: 0.6,
      healthScore: 0.72,
      isPublic: true,
    },
    {
      id: "page-personal-kos",
      title: "Personal Knowledge OS",
      slug: "personal-knowledge-os",
      summary: "A Personal Knowledge Operating System is a unified interface for ingesting, organizing, querying, and publishing one's entire digital knowledge footprint.",
      contentMd: `# Personal Knowledge OS

A **Personal Knowledge Operating System** (PKOS) is a unified software layer that turns your scattered digital life — files, notes, cloud docs, bookmarks, social exports — into a queryable, citeable, publishable knowledge base.

## Philosophy

Modern knowledge workers produce data across dozens of tools:
- Google Docs and Notion for notes
- GitHub for code and issues
- Slack for decisions
- LinkedIn and Twitter for public thinking
- Local files for deep work

A PKOS connects these silos without replacing them.

## Core Features

- **Permission-First Connectors**: You choose what to import
- **Automatic Compilation**: AI reads your sources and writes wiki pages
- **Graph Memory**: Every entity and claim is tracked in a context graph
- **Contradiction Awareness**: Disagreements across sources are surfaced
- **Ask Anything**: Natural language queries over your entire knowledge base
- **Publish Selectively**: Share what you want, keep the rest private

## Use Cases

- Researchers building living literature reviews
- Founders tracking market knowledge and competitor claims
- Students organizing course notes and project research
- Writers maintaining world-building bibles
- Teams building shared internal wikis

## References`,
      infoboxJson: JSON.stringify({ type: "Concept", status: "active", confidence: 0.85, sourceCount: 3 }),
      confidenceScore: 0.85,
      coverageScore: 0.7,
      healthScore: 0.8,
      isPublic: true,
    },
    {
      id: "page-student-job-agent",
      title: "Student Job Agent",
      slug: "student-job-agent",
      summary: "An AI agent concept that helps students find, apply to, and track job opportunities using persistent memory of preferences, applications, and outcomes.",
      contentMd: `# Student Job Agent

The **Student Job Agent** is a conceptual AI system that maintains persistent memory of a student's job search, tracking preferences, applications, interviews, and outcomes over time.

## Why Persistent Memory Matters

A job search spans months. Without memory, an AI assistant would:
- Forget which companies you already applied to
- Lose track of interview feedback
- Not learn from rejection reasons
- Repeat suggestions you've already declined

## Key Capabilities

- **Preference Learning**: Remembers industry, location, salary, remote preferences
- **Application Tracking**: Logs every application, follow-up, and response
- **Interview Memory**: Stores questions asked, your answers, and feedback
- **Outcome Learning**: Learns from rejections and offers to improve future suggestions
- **Contextual Advice**: "Based on your previous rejections, you might want to emphasize your project experience more"

## Technical Stack

- HydraDB for persistent context graph
- LLM for natural language interaction
- Wiki compiler for structured job search knowledge
- Contradiction detection for conflicting career advice

## References`,
      infoboxJson: JSON.stringify({ type: "Concept", status: "active", confidence: 0.75, sourceCount: 2 }),
      confidenceScore: 0.75,
      coverageScore: 0.6,
      healthScore: 0.7,
      isPublic: true,
    },
  ];

  for (const ps of pageSeeds) {
    db.page.create({ data: { wikiId, ...ps } });
    db.pageRevision.create({
      data: {
        pageId: ps.id,
        contentMd: ps.contentMd,
        summary: ps.summary,
        reason: "Initial demo seed",
      },
    });
  }

  // Sources
  const sources = [
    {
      id: "src-hydradb",
      type: "text",
      title: "HydraDB Overview",
      rawText: "HydraDB is a graph-first context infrastructure for AI agents. It builds an ontology-first context graph over your data. Entities, relationships, and temporal signals are extracted automatically at write time. When you query for Apple, HydraDB knows you mean the customer you serve, not the fruit. Every retrieval runs through a multi-stage intelligent recall pipeline: metadata filter -> hybrid retrieval -> graph traversal -> personalized ranking -> results. Vector databases return similarity. HydraDB returns relevance.",
      status: "completed",
    },
    {
      id: "src-llm-wiki",
      type: "text",
      title: "LLM Wiki Pattern",
      rawText: "The LLM Wiki pattern lets an LLM incrementally build and maintain a persistent wiki. Instead of just retrieving from raw documents at query time, the LLM builds a structured, interlinked collection of markdown files. When you add a new source, the LLM extracts key information and integrates it into the existing wiki - updating entity pages, revising topic summaries, noting where new data contradicts old claims. The wiki is a persistent, compounding artifact. Cross-references are already there. Contradictions have already been flagged.",
      status: "completed",
    },
    {
      id: "src-vector-limits",
      type: "text",
      title: "Vector Search Limitations",
      rawText: "Vector databases are search engines. They answer one question well: What is most similar to this query? This breaks for stateful agents because vector search treats every chunk as an isolated point. There is no concept of who said what, what is contradicted later, what is stale, or how an entity has evolved. The failure mode is not the embedding model - it is the assumption that semantic similarity equals relevance.",
      status: "completed",
    },
    {
      id: "src-counter",
      type: "text",
      title: "Counter: Vector DBs Are Sufficient",
      rawText: "Vector databases alone are sufficient for agent memory. With good chunking, metadata filtering, and reranking, vector search can handle most use cases. Graph-based approaches add unnecessary complexity and latency. For 90% of applications, a well-tuned vector database with proper metadata is all you need for reliable agent context retrieval.",
      status: "completed",
    },
    {
      id: "src-pkos",
      type: "text",
      title: "Personal Knowledge OS Notes",
      rawText: "A Personal Knowledge OS should connect all your tools without replacing them. The key insight is that knowledge workers produce data across dozens of silos. The OS should be permission-first, letting you choose what to import. It should compile sources into wiki pages automatically. It should track contradictions. And it should let you publish selectively.",
      status: "completed",
    },
    {
      id: "src-student-agent",
      type: "text",
      title: "Student Job Agent Concept",
      rawText: "A student job agent needs persistent memory. It should remember which companies you applied to, what interview questions you were asked, what feedback you received, and how your preferences evolve. Without memory, it will suggest the same rejected companies and forget your constraints.",
      status: "completed",
    },
    {
      id: "src-karpathy",
      type: "text",
      title: "Karpathy LLM Wiki Note",
      rawText: "Andrej Karpathy discussed the idea of LLMs as operating systems. The core insight is that LLMs are the new CPU, and they need memory, storage, and I/O. A wiki is a natural storage layer for LLM memory because it is structured, human-readable, and versioned.",
      status: "completed",
    },
  ];

  for (const s of sources) {
    db.source.create({ data: { wikiId, ...s } });
  }

  // FileItems
  const fileItems = [
    { id: "file-1", wikiId, sourceId: "src-hydradb", name: "HydraDB-Overview.md", path: "/Projects/HydraDB-Overview.md", extension: "md", mimeType: "text/markdown", sizeBytes: 2400, summary: "Overview of HydraDB graph-first infrastructure", tagsJson: JSON.stringify(["ai", "database", "graph"]), sourceType: "manual_text" },
    { id: "file-2", wikiId, sourceId: "src-llm-wiki", name: "LLM-Wiki-Pattern.md", path: "/Research/LLM-Wiki-Pattern.md", extension: "md", mimeType: "text/markdown", sizeBytes: 1800, summary: "Pattern for AI-maintained knowledge bases", tagsJson: JSON.stringify(["ai", "wiki", "pattern"]), sourceType: "manual_text" },
    { id: "file-3", wikiId, sourceId: "src-vector-limits", name: "Vector-Search-Limitations.md", path: "/Research/Vector-Search-Limitations.md", extension: "md", mimeType: "text/markdown", sizeBytes: 2100, summary: "Analysis of vector database limitations", tagsJson: JSON.stringify(["vector", "search", "limitations"]), sourceType: "manual_text" },
    { id: "file-4", wikiId, sourceId: "src-counter", name: "Counter-Vector-DBs.md", path: "/Research/Counter-Vector-DBs.md", extension: "md", mimeType: "text/markdown", sizeBytes: 1500, summary: "Counter-argument for vector database sufficiency", tagsJson: JSON.stringify(["vector", "counter"]), sourceType: "manual_text" },
    { id: "file-5", wikiId, sourceId: "src-pkos", name: "Personal-Knowledge-OS.md", path: "/Projects/Personal-Knowledge-OS.md", extension: "md", mimeType: "text/markdown", sizeBytes: 1200, summary: "Notes on building a personal knowledge OS", tagsJson: JSON.stringify(["pkos", "knowledge"]), sourceType: "manual_text" },
    { id: "file-6", wikiId, sourceId: "src-student-agent", name: "Student-Job-Agent.md", path: "/Startup-Ideas/Student-Job-Agent.md", extension: "md", mimeType: "text/markdown", sizeBytes: 1600, summary: "Concept for AI agent helping students find jobs", tagsJson: JSON.stringify(["startup", "jobs", "students"]), sourceType: "manual_text" },
    { id: "file-7", wikiId, sourceId: "src-karpathy", name: "Karpathy-LLM-Wiki.md", path: "/University/Karpathy-LLM-Wiki.md", extension: "md", mimeType: "text/markdown", sizeBytes: 900, summary: "Karpathy notes on LLMs as operating systems", tagsJson: JSON.stringify(["llm", "os", "karpathy"]), sourceType: "manual_text" },
  ];

  for (const f of fileItems) {
    db.fileItem.create({ data: f });
  }

  // Entities
  const entities = [
    { id: "ent-hydradb", name: "HydraDB", type: "Product", description: "Graph-first context infrastructure for AI agents", pageId: "page-hydradb" },
    { id: "ent-context-graph", name: "Context Graph", type: "Concept", description: "Graph that tracks entities and relationships", pageId: "page-context-graph" },
    { id: "ent-vector-db", name: "Vector Database", type: "Product", description: "Traditional semantic search database", pageId: "page-vector-search" },
    { id: "ent-llm-wiki", name: "LLM Wiki", type: "Concept", description: "Pattern for AI-maintained knowledge bases", pageId: "page-llm-wiki" },
    { id: "ent-rag", name: "RAG", type: "Concept", description: "Retrieval-Augmented Generation", pageId: "page-rag-vs-wiki" },
    { id: "ent-contradiction-detection", name: "Contradiction Detection", type: "Concept", description: "Automated identification of conflicting claims", pageId: "page-contradiction" },
    { id: "ent-pkos", name: "Personal Knowledge OS", type: "Concept", description: "Unified knowledge management system", pageId: "page-personal-kos" },
    { id: "ent-student-agent", name: "Student Job Agent", type: "Concept", description: "AI agent for student job search", pageId: "page-student-job-agent" },
  ];

  for (const e of entities) {
    db.entity.create({ data: { wikiId, ...e } });
  }

  // Relations
  const relations = [
    { id: "rel-1", fromPageId: "page-hydradb", toPageId: "page-context-graph", relationType: "BUILDS", weight: 0.9 },
    { id: "rel-2", fromPageId: "page-hydradb", toPageId: "page-vector-search", relationType: "CONTRASTS_WITH", weight: 0.85 },
    { id: "rel-3", fromPageId: "page-llm-wiki", toPageId: "page-hydradb", relationType: "USES", weight: 0.8 },
    { id: "rel-4", fromPageId: "page-context-graph", toPageId: "page-contradiction", relationType: "ENABLES", weight: 0.75 },
    { id: "rel-5", fromPageId: "page-rag-vs-wiki", toPageId: "page-llm-wiki", relationType: "COMPARES", weight: 0.7 },
    { id: "rel-6", fromPageId: "page-rag-vs-wiki", toPageId: "page-vector-search", relationType: "REFERENCES", weight: 0.65 },
    { id: "rel-7", fromPageId: "page-personal-kos", toPageId: "page-llm-wiki", relationType: "USES", weight: 0.8 },
    { id: "rel-8", fromPageId: "page-personal-kos", toPageId: "page-hydradb", relationType: "BUILDS_ON", weight: 0.85 },
    { id: "rel-9", fromPageId: "page-student-job-agent", toPageId: "page-hydradb", relationType: "USES", weight: 0.7 },
  ];

  for (const r of relations) {
    db.relation.create({ data: { wikiId, ...r } });
  }

  // Claims
  const claims = [
    { id: "claim-1", pageId: "page-hydradb", subject: "HydraDB", predicate: "is", object: "a graph-first memory infrastructure for AI agents", confidence: 0.9, status: "supported", sourceIdsJson: JSON.stringify(["src-hydradb"]) },
    { id: "claim-2", pageId: "page-vector-search", subject: "Vector Database", predicate: "returns", object: "similarity not relevance for stateful agents", confidence: 0.85, status: "supported", sourceIdsJson: JSON.stringify(["src-vector-limits"]) },
    { id: "claim-3", pageId: "page-rag-vs-wiki", subject: "RAG", predicate: "is", object: "stateless by design", confidence: 0.88, status: "supported", sourceIdsJson: JSON.stringify(["src-vector-limits"]) },
    { id: "claim-4", pageId: "page-hydradb", subject: "Vector Database", predicate: "is", object: "sufficient for agent memory with proper configuration", confidence: 0.65, status: "disputed", explanation: "These claims disagree about 'Vector Database': one says 'returns similarity not relevance for stateful agents' while another says 'is sufficient for agent memory with proper configuration'.", sourceIdsJson: JSON.stringify(["src-counter"]) },
    { id: "claim-5", pageId: "page-llm-wiki", subject: "LLM Wiki", predicate: "enables", object: "persistent, compounding knowledge that improves with each source", confidence: 0.92, status: "supported", sourceIdsJson: JSON.stringify(["src-llm-wiki"]) },
    { id: "claim-6", pageId: "page-vector-search", subject: "Vector Search", predicate: "is", object: "only useful for simple recommendation systems", confidence: 0.45, status: "disputed", explanation: "These claims disagree about 'Vector Search': one says 'is only useful for simple recommendation systems' while another says 'is sufficient for agent memory with proper configuration'.", sourceIdsJson: JSON.stringify(["src-vector-limits"]) },
    { id: "claim-7", pageId: "page-personal-kos", subject: "Personal Knowledge OS", predicate: "should be", object: "permission-first", confidence: 0.9, status: "supported", sourceIdsJson: JSON.stringify(["src-pkos"]) },
    { id: "claim-8", pageId: "page-student-job-agent", subject: "Student Job Agent", predicate: "needs", object: "persistent memory to be useful", confidence: 0.85, status: "supported", sourceIdsJson: JSON.stringify(["src-student-agent"]) },
  ];

  for (const c of claims) {
    db.claim.create({ data: { wikiId, ...c } });
  }

  // Citations
  const citations = [
    { id: "cite-1", pageId: "page-hydradb", sourceId: "src-hydradb", quote: "HydraDB is a graph-first context infrastructure for AI agents.", location: "HydraDB Overview" },
    { id: "cite-2", pageId: "page-hydradb", sourceId: "src-counter", quote: "Vector databases alone are sufficient for agent memory.", location: "Counter: Vector DBs Are Sufficient" },
    { id: "cite-3", pageId: "page-vector-search", sourceId: "src-vector-limits", quote: "Vector databases are search engines. They answer one question well: What is most similar to this query?", location: "Vector Search Limitations" },
    { id: "cite-4", pageId: "page-llm-wiki", sourceId: "src-llm-wiki", quote: "The LLM Wiki pattern lets an LLM incrementally build and maintain a persistent wiki.", location: "LLM Wiki Pattern" },
    { id: "cite-5", pageId: "page-rag-vs-wiki", sourceId: "src-vector-limits", quote: "The failure mode is not the embedding model - it is the assumption that semantic similarity equals relevance.", location: "Vector Search Limitations" },
    { id: "cite-6", pageId: "page-context-graph", sourceId: "src-hydradb", quote: "It builds an ontology-first context graph over your data.", location: "HydraDB Overview" },
    { id: "cite-7", pageId: "page-personal-kos", sourceId: "src-pkos", quote: "A Personal Knowledge OS should connect all your tools without replacing them.", location: "Personal Knowledge OS Notes" },
    { id: "cite-8", pageId: "page-student-job-agent", sourceId: "src-student-agent", quote: "A student job agent needs persistent memory.", location: "Student Job Agent Concept" },
  ];

  for (const c of citations) {
    db.citation.create({ data: { wikiId, ...c } });
  }

  // Ingest jobs
  db.ingestJob.create({
    data: { id: "job-demo-1", wikiId, sourceId: "src-hydradb", status: "completed", step: "done", logsJson: JSON.stringify(["Source compiled: HydraDB Overview"]) },
  });

  // Ask sessions
  db.askSession.create({
    data: { id: "ask-1", wikiId, question: "What is HydraDB and how does it differ from vector databases?", answer: "HydraDB is a graph-first context infrastructure for AI agents that builds an ontology-first context graph over ingested data. Unlike vector databases which return semantic similarity, HydraDB returns relevance by tracking entities, relationships, and temporal signals.", contextJson: JSON.stringify([{ source: "src-hydradb", quote: "HydraDB is a graph-first context infrastructure..." }, { source: "src-vector-limits", quote: "Vector databases return similarity..." }]) },
  });

  // Demo connectors
  db.connector.create({
    data: { id: "conn-hydradb", wikiId, name: "HydraDB", type: "api_key", status: "connected", authMode: "api_key", metadataJson: JSON.stringify({ apiKey: "hydra_demo_key", tenantId: `qyntra_${wikiId}` }), lastSyncAt: now },
  });

  db.connector.create({
    data: { id: "conn-notion", wikiId, name: "Notion", type: "oauth", status: "connected", authMode: "session_token", metadataJson: JSON.stringify({ tokenMode: "session", note: "Session-only token for hackathon demo" }), lastSyncAt: now },
  });

  db.connector.create({
    data: { id: "conn-local", wikiId, name: "Local Folder", type: "file", status: "connected", authMode: "browser", metadataJson: JSON.stringify({ path: "/demo/files", fileCount: 7 }), lastSyncAt: now },
  });

  db.connector.create({
    data: { id: "conn-drive", wikiId, name: "Google Drive", type: "oauth", status: "disconnected", authMode: "oauth", metadataJson: JSON.stringify({}), lastSyncAt: null },
  });

  db.connector.create({
    data: { id: "conn-linkedin", wikiId, name: "LinkedIn Export", type: "file", status: "disconnected", authMode: "export_import", metadataJson: JSON.stringify({ mode: "export_import" }), lastSyncAt: null },
  });

  db.connector.create({
    data: { id: "conn-instagram", wikiId, name: "Instagram Export", type: "file", status: "disconnected", authMode: "export_import", metadataJson: JSON.stringify({ mode: "export_import" }), lastSyncAt: null },
  });

  _seeded = true;
  _seeding = false;
}

seedIfEmpty();

export const prisma = db;
