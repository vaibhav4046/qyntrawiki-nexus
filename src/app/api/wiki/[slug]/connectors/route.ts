import { NextRequest, NextResponse } from "next/server";
import { connectorStore } from "@/lib/connectors";

export interface Connector {
  id: string;
  name: string;
  description: string;
  type: "oauth" | "apikey" | "file";
  icon: string;
  connected: boolean;
  syncing: boolean;
  lastSyncedAt: string | null;
  apiKey?: string;
}

function mapAuthType(authType: string): Connector["type"] {
  if (authType === "oauth") return "oauth";
  if (authType === "apikey" || authType === "apiKey" || authType === "token") return "apikey";
  return "file";
}

function toUiConnector(c: ReturnType<typeof connectorStore.findMany>[number]): Connector {
  const credentials = c.credentials;
  const apiKey = credentials && typeof credentials.apiKey === "string" ? credentials.apiKey : undefined;
  return {
    id: c.id,
    name: c.name,
    description: c.description,
    type: mapAuthType(c.authType),
    icon: c.icon,
    connected: c.connected,
    syncing: false,
    lastSyncedAt: c.lastSyncedAt,
    apiKey,
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  try {
    const { slug } = await params;
    void slug;
    const connectors = connectorStore.findMany().map(toUiConnector);
    return NextResponse.json(connectors, { status: 200 });
  } catch (error: unknown) {
    console.error("GET /api/wiki/[slug]/connectors error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  try {
    const { slug } = await params;
    const body = (await req.json()) as Record<string, unknown>;
    void slug;
    return NextResponse.json({ success: true, ...body }, { status: 200 });
  } catch (error: unknown) {
    console.error("POST /api/wiki/[slug]/connectors error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
