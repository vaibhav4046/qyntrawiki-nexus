// lib/wiki-compiler.ts - Core compilation engine

import { prisma } from "./prisma";
import * as hydra from "./hydradb";
import * as ai from "./ai";
import { detectContradictions, computeHealthScore } from "./contradictions";

export async function compileSource(sourceId: string) {
  const source = prisma.source.findUnique({ where: { id: sourceId } });
  if (!source) throw new Error("Source not found");

  const wikiId = source.wikiId as string;

  prisma.source.update({ where: { id: sourceId }, data: { status: "processing" } });

  const job = prisma.ingestJob.create({
    data: { wikiId, sourceId, status: "processing", step: "started", logsJson: "[]" },
  });

  const log: string[] = [];

  function logStep(name: string) {
    log.push(`[${new Date().toISOString()}] ${name}`);
    const existing = JSON.parse((job.logsJson as string) || "[]") as string[];
    existing.push(name);
    prisma.ingestJob.update({ where: { id: job.id as string }, data: { step: name, logsJson: JSON.stringify(existing) } });
  }

  try {
    const tenantId = (source.tenantId as string) || `qyntra_${(source.slug as string) || "wiki"}`;

    // Step 1: Upload to HydraDB
    logStep("Uploading to HydraDB");
    const result = await hydra.uploadKnowledge(tenantId, (source.rawText as string) || (source.title as string), source.title as string, (source.url as string) || undefined);
    const hydraSourceId = (result.results?.[0]?.source_id as string) || "";
    if (hydraSourceId) {
      prisma.source.update({ where: { id: sourceId }, data: { hydraSourceId, status: "indexing" } });
    }

    // Step 2: Verify processing
    logStep("Verifying HydraDB processing");
    if (hydraSourceId) {
      let tries = 0;
      while (tries < 20) {
        const status = await hydra.verifyProcessing(tenantId, hydraSourceId);
        if (status.results?.[0]?.indexing_status === "completed") break;
        if (status.results?.[0]?.indexing_status === "errored") throw new Error("HydraDB processing failed");
        await new Promise(r => setTimeout(r, 2000));
        tries++;
      }
    }

    // Step 3: Recall context
    logStep("Recalling related context from HydraDB");
    const recall = await hydra.fullRecall(tenantId, `Summarize ${source.title}`);
    const chunksCount = (recall.chunks as unknown[])?.length || 0;
    const graphPaths = (recall.graph_context as Record<string, unknown>)?.query_paths as unknown[];
    const pathsCount = graphPaths?.length || 0;
    log.push(`Recalled ${chunksCount} chunks, ${pathsCount} graph paths`);

    // Step 4: Extract entities and claims
    logStep("Extracting entities and claims");
    const text = ((source.rawText as string) || (source.title as string)).slice(0, 10000);
    const extracted = await ai.extractEntitiesAndClaims(text);

    for (const ent of extracted.entities) {
      prisma.entity.upsert({
        where: { id: `${wikiId}_${ent.name}`.slice(0, 25) },
        create: { id: `${wikiId}_${ent.name}`.slice(0, 25), wikiId, name: ent.name, type: ent.type, description: ent.description },
        update: { description: ent.description, type: ent.type },
      });
    }

    for (const claim of extracted.claims) {
      prisma.claim.create({
        data: {
          wikiId, pageId: wikiId,
          subject: claim.subject, predicate: claim.predicate, object: claim.object,
          confidence: claim.confidence, sourceIdsJson: JSON.stringify([sourceId]),
          status: "supported",
        },
      });
    }

    // Step 5: Generate/update pages
    logStep("Generating wiki pages");
    const recall2 = await hydra.fullRecall(tenantId, source.title as string);
    const chunks = (recall2.chunks || []) as Array<{ chunk_content: string }>;
    const context = chunks.map((c) => c.chunk_content).join("\n");

    const pageData = await ai.extractEntitiesAndClaims((source.rawText as string) || context);

    for (const candidate of pageData.candidatePages) {
      const slug = candidate.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").slice(0, 64);
      const article = await ai.generateArticle(candidate.title, context);

      const existing = prisma.page.findFirst({ where: { wikiId, slug } });

      if (existing) {
        prisma.page.update({
          where: { id: existing.id as string },
          data: {
            contentMd: ((existing.contentMd as string) || "") + "\n\n## Updated\n\n" + (article.contentMd || "").slice(0, 2000),
            summary: article.summary || (existing.summary as string) || "",
            confidenceScore: (article.infobox?.confidence as number) || 0.7,
            coverageScore: Math.min(((existing.coverageScore as number) || 0) + 0.15, 1),
          },
        });
        prisma.pageRevision.create({
          data: { pageId: existing.id as string, contentMd: article.contentMd, summary: article.summary, reason: `Updated from: ${source.title}` },
        });
      } else {
        const page = prisma.page.create({
          data: {
            wikiId, title: candidate.title, slug,
            summary: article.summary, contentMd: article.contentMd,
            infoboxJson: JSON.stringify(article.infobox || {}),
            confidenceScore: (article.infobox?.confidence as number) || 0.7,
            coverageScore: 0.5,
            healthScore: 0.5,
          },
        });
        prisma.pageRevision.create({
          data: { pageId: page.id as string, contentMd: article.contentMd, summary: article.summary, reason: `Created from: ${source.title}` },
        });
      }
    }

    // Step 6: Create citations
    logStep("Creating citations");
    const pages = prisma.page.findMany({ where: { wikiId } });
    for (const page of pages.slice(0, 5)) {
      prisma.citation.create({
        data: { wikiId, pageId: page.id as string, sourceId, quote: ((source.rawText as string) || "").slice(0, 200), url: (source.url as string) || "", location: source.title as string },
      });
    }

    // Step 7: Detect contradictions
    logStep("Detecting contradictions");
    const allClaims = prisma.claim.findMany({ where: { wikiId } });
    const newClaims = allClaims.filter(c => {
      const ids = JSON.parse((c.sourceIdsJson as string) || "[]");
      return ids.includes(sourceId);
    }).map(c => ({
      id: c.id as string, subject: c.subject as string, predicate: c.predicate as string, object: c.object as string, confidence: c.confidence as number,
    }));
    const existingClaims = allClaims.filter(c => {
      const ids = JSON.parse((c.sourceIdsJson as string) || "[]");
      return !ids.includes(sourceId);
    }).map(c => ({
      id: c.id as string, subject: c.subject as string, predicate: c.predicate as string, object: c.object as string, confidence: c.confidence as number,
    }));
    const contradictions = detectContradictions(newClaims, existingClaims);
    for (const c of contradictions) {
      if (c.claimA.id) {
        prisma.claim.update({ where: { id: c.claimA.id }, data: { status: "disputed", explanation: c.explanation } });
      }
      if (c.claimB.id) {
        prisma.claim.update({ where: { id: c.claimB.id }, data: { status: "disputed", explanation: c.explanation } });
      }
    }

    // Step 8: Compute health scores
    logStep("Computing health scores");
    const allPages = prisma.page.findMany({ where: { wikiId } });
    for (const page of allPages) {
      const citationCount = prisma.citation.count({ where: { pageId: page.id as string } });
      const health = computeHealthScore({
        citationCount,
        sourceCount: 2,
        contradictionCount: 0,
        backlinkCount: 0,
        daysSinceUpdate: 0,
      });
      prisma.page.update({ where: { id: page.id as string }, data: { healthScore: health } });
    }

    const allEntities = prisma.entity.findMany({ where: { wikiId } });
    const allRelations = prisma.relation.findMany({ where: { wikiId } });
    const finalClaims = prisma.claim.findMany({ where: { wikiId } });
    const finalContradictions = contradictions.length;

    prisma.source.update({ where: { id: sourceId }, data: { status: "completed" } });
    prisma.ingestJob.update({ where: { id: job.id as string }, data: { status: "completed", step: "done", logsJson: JSON.stringify(log) } });

    return {
      success: true,
      log,
      claimsExtracted: extracted.claims.length,
      entitiesExtracted: allEntities.length,
      relationsExtracted: allRelations.length,
      contradictionsFound: finalContradictions,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    log.push(`ERROR: ${msg}`);
    prisma.source.update({ where: { id: sourceId }, data: { status: "error", error: msg } });
    prisma.ingestJob.update({ where: { id: job.id as string }, data: { status: "error", step: msg, logsJson: JSON.stringify(log) } });
    throw error;
  }
}
