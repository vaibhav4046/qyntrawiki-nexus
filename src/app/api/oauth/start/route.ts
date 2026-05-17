import { NextResponse } from "next/server";
import { googleProvider } from "@/lib/oauth/google";
import { microsoftProvider } from "@/lib/oauth/microsoft";
import { notionProvider } from "@/lib/oauth/notion";

const providers: Record<string, { getAuthUrl: (state?: string) => string }> = {
  "google-drive": googleProvider,
  "microsoft": microsoftProvider,
  "notion": notionProvider,
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get("provider");
  const redirect = searchParams.get("redirect") || "/app/connect";

  if (!provider || !providers[provider]) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }

  const authUrl = providers[provider].getAuthUrl(`${provider}|${redirect}`);

  if (!authUrl) {
    return NextResponse.json(
      { error: `OAuth not configured for ${provider}. Add client ID to environment variables.` },
      { status: 400 }
    );
  }

  return NextResponse.json({ url: authUrl });
}
