import { NextRequest, NextResponse } from "next/server";
import { connectorStore } from "@/lib/connectors";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const connector = connectorStore.findById(id);
    if (!connector) {
      return NextResponse.json(
        { error: "Connector not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(connector, { status: 200 });
  } catch (error: unknown) {
    console.error("GET /api/connectors/[id] error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const connector = connectorStore.findById(id);
    if (!connector) {
      return NextResponse.json(
        { error: "Connector not found" },
        { status: 404 }
      );
    }

    const updated = connectorStore.update(id, {
      connected: false,
      credentials: null,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error: unknown) {
    console.error("DELETE /api/connectors/[id] error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
