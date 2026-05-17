import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as ai from "@/lib/ai";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { question } = await req.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "question is required" }, { status: 400 });
    }

    const wiki = await prisma.wiki.findUnique({ where: { slug } });
    if (!wiki) {
      return NextResponse.json({ error: "Wiki not found" }, { status: 404 });
    }

    const wikiId = wiki.id as string;
    const pages = await prisma.page.findMany({ where: { wikiId } });
    const claims = await prisma.claim.findMany({ where: { wikiId } });

    if (pages.length === 0) {
      return NextResponse.json({
        answer: "This wiki doesn't have any compiled articles yet. Add sources and compile them to build knowledge.",
        citations: [],
        context: [],
      });
    }

    const contextParts = pages.slice(0, 5).map((p) => {
      const pageClaims = claims.filter((c) => c.pageId === p.id);
      return `Page: ${p.title}\nSummary: ${p.summary || ""}\nClaims: ${pageClaims.map((c) => `${c.subject} ${c.predicate} ${c.object}`).join("; ")}`;
    });

    const fullContext = contextParts.join("\n\n---\n\n");

    let answer = "";
    let citations: { source: string; quote: string; url: string }[] = [];

    if (ai.isMockMode()) {
      // Smart mock matching
      const q = question.toLowerCase();
      const relevantPages = pages.filter((p) => {
        const t = (p.title + " " + (p.summary || "")).toLowerCase();
        return q.split(" ").some((word) => word.length > 3 && t.includes(word));
      });
      const topPages = relevantPages.length > 0 ? relevantPages : pages;

      answer = `Based on the compiled knowledge in this wiki:\n\n${topPages
        .slice(0, 5)
        .map((p) => `**${p.title}**: ${p.summary || "No summary available."}`)
        .join("\n\n")}\n\nThis answer is synthesized from ${topPages.length} wiki page${
        topPages.length !== 1 ? "s" : ""
      }.`;

      citations = topPages.slice(0, 5).map((p) => ({
        source: p.title,
        quote: (p.summary || "").slice(0, 200),
        url: "",
      }));
    } else {
      const prompt = `You are QyntraWiki, a knowledge base assistant. Answer the user's question using ONLY the provided wiki context. Cite specific pages. Be concise but thorough.

Wiki Context:
${fullContext.slice(0, 10000)}

Question: ${question}

Return JSON:
{
  "answer": "Your detailed answer with **bold** for emphasis. Mention specific page names.",
  "citations": [{"source": "Page Title", "quote": "Relevant excerpt from context"}]
}`;

      try {
        const resp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
            }),
          }
        );
        const data = await resp.json();
        const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const cleaned = raw.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        answer = parsed.answer || raw;
        citations = (parsed.citations || []).map((c: any) => ({
          source: c.source || "Wiki",
          quote: c.quote || "",
          url: "",
        }));
      } catch {
        answer = "I found relevant information in the wiki but couldn't generate a complete answer. Here are the related pages:\n\n" + pages.slice(0, 5).map((p) => `**${p.title}**: ${p.summary || ""}`).join("\n\n");
        citations = pages.slice(0, 5).map((p) => ({ source: p.title, quote: (p.summary || "").slice(0, 200), url: "" }));
      }
    }

    const context = pages.slice(0, 5).map((p) => ({
      pageTitle: p.title as string,
      pageSlug: p.slug as string,
      excerpt: ((p.summary as string) || "").slice(0, 300),
    }));

    return NextResponse.json({ answer, citations, context });
  } catch (error) {
    console.error("POST /api/wiki/[slug]/ask error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
