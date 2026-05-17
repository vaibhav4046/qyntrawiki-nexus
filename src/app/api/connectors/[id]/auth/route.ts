import { NextRequest, NextResponse } from "next/server";
import { connectorStore, getConnectorImpl } from "@/lib/connectors";

export async function POST(
  req: NextRequest,
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

    if (connector.authType !== "oauth") {
      return NextResponse.json(
        { success: false, message: "Connector does not use OAuth" },
        { status: 400 }
      );
    }

    const impl = getConnectorImpl(connector.type);
    let redirectUrl: string | undefined;
    if (impl?.getAuthUrl) {
      redirectUrl = impl.getAuthUrl(id, connector.config);
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const simulateCallback = body.simulate !== false;

    if (!simulateCallback) {
      return NextResponse.json(
        {
          success: true,
          redirectUrl,
          message: "OAuth initiation simulated. Set simulate=true (default) to complete flow.",
        },
        { status: 200 }
      );
    }

    const mockCredentials = {
      accessToken: `mock_at_${connector.type}_${Date.now()}`,
      refreshToken: `mock_rt_${connector.type}_${Date.now()}`,
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    };

    const updated = connectorStore.update(id, {
      connected: true,
      credentials: mockCredentials,
    });

    return NextResponse.json(
      {
        success: true,
        redirectUrl,
        connector: updated,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("POST /api/connectors/[id]/auth error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
