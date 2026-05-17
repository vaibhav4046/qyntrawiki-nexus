// lib/ai.ts - Gemini AI provider with mock fallback

const GEMINI_KEY = process.env.GEMINI_API_KEY || "";
const MOCK_MODE = !GEMINI_KEY;

interface AIResponse {
  text: string;
  parsed?: unknown;
}

async function callGemini(prompt: string): Promise<string> {
  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 4096 },
      }),
    }
  );
  const data = await resp.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

function mockExtract(text: string) {
  const excerpt = text.slice(0, 250).replace(/\n/g, " ");
  return {
    entities: [
      { name: "HydraDB", type: "Product", description: "Graph-first context infrastructure for AI agents" },
      { name: "Context Graph", type: "Concept", description: "Graph that tracks entities and relationships" },
      { name: "Vector Database", type: "Product", description: "Traditional semantic search database" },
      { name: "LLM Wiki", type: "Concept", description: "Pattern for AI-maintained knowledge bases" },
    ],
    claims: [
      { subject: "HydraDB", predicate: "is", object: "a graph-first memory infrastructure for AI agents", confidence: 0.9, quote: excerpt, sourceTitle: "Source" },
      { subject: "Vector Database", predicate: "returns", object: "similarity not relevance for stateful agents", confidence: 0.85, quote: excerpt, sourceTitle: "Source" },
    ],
    candidatePages: [
      { title: "HydraDB", summary: "Graph-first context infrastructure that builds an ontology-first context graph for AI agent memory.", sections: ["Architecture", "Context Graph", "Recall Pipeline"] },
      { title: "Context Graph", summary: "A knowledge graph that tracks entities, relationships, and temporal signals across ingested documents.", sections: ["Entity Extraction", "Relation Types", "Query Paths"] },
      { title: "Vector Search Limitations", summary: "Vector databases return semantic similarity scores but fail to track relationships, contradictions, and temporal context.", sections: ["Similarity vs Relevance", "Stateful Agent Problem", "Alternatives"] },
    ],
  };
}

export async function extractEntitiesAndClaims(text: string): Promise<{
  entities: { name: string; type: string; description: string }[];
  claims: { subject: string; predicate: string; object: string; confidence: number; quote: string; sourceTitle: string }[];
  candidatePages: { title: string; summary: string; sections: string[] }[];
}> {
  if (MOCK_MODE) return mockExtract(text);

  const prompt = `Extract entities, claims, and candidate wiki pages from this text. Output valid JSON only.

Text: ${text.slice(0, 10000)}

Return JSON:
{
  "entities": [{"name": "...", "type": "Product|Concept|Person|Organization|...", "description": "..."}],
  "claims": [{"subject": "...", "predicate": "is/uses/builds/returns/...", "object": "...", "confidence": 0.0-1.0, "quote": "exact supporting quote", "sourceTitle": "..."}],
  "candidatePages": [{"title": "...", "summary": "short paragraph", "sections": ["..."]}]
}`;

  try {
    const raw = await callGemini(prompt);
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return mockExtract(text);
  }
}

export async function generateArticle(
  pageTitle: string,
  context: string
): Promise<{ summary: string; contentMd: string; infobox: Record<string, unknown> }> {
  if (MOCK_MODE) {
    return {
      summary: `${pageTitle} is a key topic in this knowledge base.`,
      contentMd: `# ${pageTitle}\n\n${pageTitle} is an important concept covered across multiple sources.\n\n## Overview\n\nThis topic relates to knowledge compilation and graph-based memory systems.\n\n## Key Concepts\n\n- Entity extraction from sources\n- Relationship mapping via context graphs\n- Contradiction-aware knowledge synthesis\n\n## References\n\n- Sources in this wiki`,
      infobox: { type: "Concept", status: "active", confidence: 0.8, sourceCount: 2 },
    };
  }

  const prompt = `Write a Wikipedia-style article about "${pageTitle}" using this context.
Return JSON:
{
  "summary": "1-2 sentence lead paragraph",
  "contentMd": "# Title\\n\\nLead paragraph\\n\\n## Overview\\n...\\n\\n## Background\\n...\\n\\n## Key Concepts\\n...\\n\\n## Evidence\\n...\\n\\n## Related Ideas\\n...\\n\\n## Open Questions\\n...\\n\\n## References\\n...",
  "infobox": {"type": "Concept|Product|Person|...", "aliases": [], "status": "active", "confidence": 0.0-1.0, "sourceCount": 0}
}

Context: ${context.slice(0, 8000)}`;

  try {
    const raw = await callGemini(prompt);
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      summary: `${pageTitle} is a concept in this knowledge base.`,
      contentMd: `# ${pageTitle}\n\n${context.slice(0, 2000)}`,
      infobox: { type: "Concept", status: "active", confidence: 0.6 },
    };
  }
}

export function isMockMode() { return MOCK_MODE; }
