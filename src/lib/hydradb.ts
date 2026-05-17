// lib/hydradb.ts - HydraDB API integration

const HYDRADB_BASE = "https://api.hydradb.com";
const API_KEY = process.env.HYDRA_DB_API_KEY || "";
const MOCK_MODE = !API_KEY;

async function hydraFetch(method: string, path: string, body?: unknown, isForm?: boolean) {
  if (MOCK_MODE) return mockHydra(path, body);

  const headers: Record<string, string> = { Authorization: `Bearer ${API_KEY}` };
  const opts: RequestInit = { method, headers };

  if (isForm && body instanceof FormData) {
    opts.body = body;
  } else if (body) {
    headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }

  const resp = await fetch(`${HYDRADB_BASE}${path}`, opts);
  const data = await resp.json();
  if (!resp.ok) throw new Error(data?.detail?.message || `HydraDB ${resp.status}`);
  return data;
}

function mockHydra(path: string, _body?: unknown) {
  if (path.includes("tenants/create")) return { message: "Mock tenant created", tenant_id: "mock-tenant" };
  if (path.includes("infra/status")) return { vectorstore_status: { knowledge: true }, graph_status: true };
  if (path.includes("upload_knowledge")) return { results: [{ source_id: `mock_${Date.now()}`, status: "queued" }] };
  if (path.includes("verify_processing")) return { results: [{ indexing_status: "completed" }] };
  if (path.includes("full_recall") || path.includes("recall_preferences")) {
    return {
      chunks: [
        { chunk_uuid: "mock-1", source_id: "mock-src", chunk_content: "HydraDB is a graph-first context infrastructure for AI agents. It builds an ontology-first context graph over your data.", relevancy_score: 0.92, source_title: "HydraDB Overview", source_type: "webpage" },
        { chunk_uuid: "mock-2", source_id: "mock-src", chunk_content: "Vector databases return similarity. HydraDB returns relevance. The context graph tracks entities, relationships, and temporal signals.", relevancy_score: 0.88, source_title: "HydraDB vs Vector DBs", source_type: "webpage" },
      ],
      sources: [{ id: "mock-src", title: "HydraDB Docs", type: "webpage" }],
      graph_context: {
        query_paths: [{
          triplets: [
            { source: { name: "HydraDB", type: "Product" }, relation: { canonical_predicate: "BUILDS" }, target: { name: "Context Graph", type: "Concept" } },
            { source: { name: "Context Graph", type: "Concept" }, relation: { canonical_predicate: "TRACKS" }, target: { name: "Entities", type: "Concept" } },
            { source: { name: "Vector Database", type: "Product" }, relation: { canonical_predicate: "FAILS_AT" }, target: { name: "Stateful Agents", type: "Concept" } },
          ],
          relevancy_score: 0.85,
        }],
      },
    };
  }
  return { message: "Mock mode" };
}

export async function createTenant(wikiSlug: string) {
  return hydraFetch("POST", "/tenants/create", { tenant_id: `qyntra_${wikiSlug}`.slice(0, 48) });
}

export async function checkInfra(tenantId: string) {
  return hydraFetch("GET", `/tenants/infra/status?tenant_id=${tenantId}`);
}

export async function uploadKnowledge(tenantId: string, text: string, title: string, url?: string) {
  const fd = new FormData();
  fd.append("tenant_id", tenantId);
  fd.append("app_knowledge", JSON.stringify([{
    tenant_id: tenantId,
    sub_tenant_id: "default",
    id: `src_${Date.now()}`,
    title,
    type: url ? "webpage" : "text",
    url: url || "",
    timestamp: new Date().toISOString(),
    content: { text: text.slice(0, 50000) },
    metadata: { category: "wiki-source" },
  }]));
  return hydraFetch("POST", "/ingestion/upload_knowledge", fd, true);
}

export async function verifyProcessing(tenantId: string, sourceId: string) {
  return hydraFetch("POST", "/ingestion/verify_processing", { tenant_id: tenantId, file_ids: [sourceId] });
}

export async function fullRecall(tenantId: string, query: string) {
  return hydraFetch("POST", "/recall/full_recall", {
    tenant_id: tenantId,
    query,
    max_results: 8,
    mode: "thinking",
    graph_context: true,
    alpha: 0.7,
  });
}

export function isMockMode() { return MOCK_MODE; }
