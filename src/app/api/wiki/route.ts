import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as hydra from "@/lib/hydradb";

export async function POST(req: NextRequest) {
  try {
    const { name, description, topic } = await req.json();

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 64);

    const wiki = prisma.wiki.create({
      data: {
        name: name.trim(),
        slug,
        description: (description || "").trim(),
        topic: (topic || "").trim(),
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
        } catch {
          // infra check may fail during provisioning
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    return NextResponse.json(wiki, { status: 201 });
  } catch (error) {
    console.error("POST /api/wiki error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
