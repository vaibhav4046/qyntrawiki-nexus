import { NextRequest, NextResponse } from "next/server";
import { connectorStore } from "@/lib/connectors";

export async function GET(_req: NextRequest): Promise<NextResponse> {
  try {
    const connectors = connectorStore.findMany();
    return NextResponse.json(connectors, { status: 200 });
  } catch (error: unknown) {
    console.error("GET /api/connectors error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const { id, config } = body;

    if (typeof id !== "string" || !id.trim()) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    if (!config || typeof config !== "object" || Array.isArray(config)) {
      return NextResponse.json(
        { error: "config must be an object" },
        { status: 400 }
      );
    }

    const updated = connectorStore.update(id, {
      config: config as Record<string, unknown>,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error: unknown) {
    console.error("POST /api/connectors error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
