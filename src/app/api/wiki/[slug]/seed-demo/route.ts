import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as hydra from "@/lib/hydradb";
import { compileSource } from "@/lib/wiki-compiler";

const DEMO_SOURCES = [
  {
    type: "text",
    title: "HydraDB: Graph-First Context Infrastructure",
    content: `HydraDB is a graph-first context infrastructure for AI agents. Unlike traditional vector databases that return semantic similarity, HydraDB returns relationship-aware relevance.

Key features:
- Ontology-first context graph that tracks entities, relationships, and temporal signals
- Multi-modal ingestion pipeline supporting text, PDF, CSV, and API data
- Full recall with graph traversal across document boundaries
- Entity extraction and relationship mapping
- Contradiction detection across sources

The context graph is built automatically during ingestion. Each document is chunked, entities are extracted, and relationships are mapped into a knowledge graph that persists across sessions.

HydraDB enables stateful agent memory by maintaining context graphs that evolve as new information is ingested. This means agents can track how their understanding changes over time, detect contradictions between sources, and maintain provenance chains for every claim.`,
  },
  {
    type: "text",
    title: "LLM Wiki: AI-Maintained Knowledge Bases",
    content: `An LLM Wiki is a knowledge management pattern where a wiki is maintained entirely by AI agents rather than human editors. The AI handles ingestion, compilation, contradiction detection, and page generation.

The compilation pipeline works as follows:
1. Sources are ingested and uploaded to a vector/context store
2. Entities and claims are extracted from each source
3. Claims are cross-referenced against existing claims to detect contradictions
4. Wiki pages are generated or updated based on new evidence
5. Citations are automatically created linking claims back to sources

Unlike traditional wikis that require human editors to manually write and update pages, LLM Wikis can process hundreds of sources continuously, updating pages as new information becomes available.

The key advantage is scale: an LLM Wiki can maintain thousands of pages with proper citations, contradiction tracking, and confidence scoring without human intervention beyond initial configuration.`,
  },
  {
    type: "text",
    title: "Vector Search Limitations for Knowledge Bases",
    content: `Vector databases like Pinecone, Weaviate, and ChromaDB have become popular for AI applications, but they have significant limitations for knowledge base use cases.

Vector search returns similarity scores, not relevance. Two documents can have high cosine similarity but contain contradictory information. The similarity metric doesn't capture semantic disagreement.

For stateful AI agents that need to maintain consistent knowledge over time, vector-only approaches fail because:
1. They don't track relationships between entities
2. They can't detect contradictions across documents
3. They have no concept of provenance or confidence
4. They don't maintain temporal context (when was this information added?)

Graph-based approaches address these limitations by explicitly modeling entities and their relationships, enabling contradiction detection, provenance tracking, and confidence-weighted retrieval.`,
  },
  {
    type: "text",
    title: "The Case For and Against Vector Databases",
    content: `Vector databases are excellent for semantic search and are the right choice for many applications. They provide fast, scalable similarity search that works well for recommendation systems and simple RAG applications.

However, some argue that vector databases alone are insufficient for complex knowledge management. While they excel at finding semantically similar content, they lack the structured reasoning capabilities needed for maintaining a coherent knowledge base.

In practice, the best approach combines vector search for broad retrieval with graph-based systems for relationship tracking. This hybrid architecture gives you both the speed of vector search and the precision of graph-based reasoning.

Vector databases have been shown to perform well at scale, with systems like Pinecone handling billions of vectors. The question is whether similarity alone is enough for knowledge-intensive applications.`,
  },
];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    let wiki = prisma.wiki.findUnique({ where: { slug } });

    if (!wiki) {
      wiki = prisma.wiki.create({
        data: {
          name: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          slug,
          description: `Demo wiki for ${slug}`,
          topic: "Technology",
          isPublished: false,
        },
      });

      let tenantId = "";
      try {
        const tenantResult = await hydra.createTenant(slug);
        tenantId = tenantResult?.tenant_id || tenantResult?.data?.tenant_id || `qyntra_${slug}`.slice(0, 48);
        prisma.wiki.update({ where: { id: wiki.id as string }, data: { tenantId } });
      } catch (err) {
        console.error("HydraDB tenant creation failed (non-fatal):", err);
      }

      if (tenantId) {
        const start = Date.now();
        while (Date.now() - start < 30000) {
          try {
            const status = await hydra.checkInfra(tenantId);
            const vs = status?.vectorstore_status || status?.data?.vectorstore_status;
            const gs = status?.graph_status ?? status?.data?.graph_status;
            if (vs?.knowledge && gs) break;
          } catch { /* polling */ }
          await new Promise((r) => setTimeout(r, 2000));
        }
      }
    }

    const results: Array<{ title: string; status: string }> = [];

    for (const demo of DEMO_SOURCES) {
      const source = prisma.source.create({
        data: {
          wikiId: wiki.id as string,
          type: demo.type,
          title: demo.title,
          rawText: demo.content,
          status: "pending",
        },
      });

      try {
        await compileSource(source.id as string);
        results.push({ title: demo.title, status: "compiled" });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        results.push({ title: demo.title, status: `error: ${msg}` });
      }
    }

    const sourceCount = prisma.source.count({ where: { wikiId: wiki.id as string } });
    const pageCount = prisma.page.count({ where: { wikiId: wiki.id as string } });
    const claimCount = prisma.claim.count({ where: { wikiId: wiki.id as string } });

    return NextResponse.json(
      {
        wiki: { ...wiki, _count: { sources: sourceCount, pages: pageCount, claims: claimCount } },
        sources: results,
        summary: {
          total: DEMO_SOURCES.length,
          succeeded: results.filter((r) => r.status === "compiled").length,
          failed: results.filter((r) => r.status !== "compiled").length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/wiki/[slug]/seed-demo error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
