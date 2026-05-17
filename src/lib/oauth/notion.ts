import { OAuthTokens, getNotionOAuthConfig } from "./index";

export const notionProvider = {
  name: "notion",

  getAuthUrl(state?: string): string {
    const cfg = getNotionOAuthConfig();
    if (!cfg.clientId) return "";
    const params = new URLSearchParams({
      client_id: cfg.clientId,
      redirect_uri: cfg.redirectUri,
      response_type: "code",
      owner: "user",
    });
    if (state) params.set("state", state);
    return `${cfg.authorizeUrl}?${params.toString()}`;
  },

  async exchangeCode(code: string): Promise<OAuthTokens> {
    const cfg = getNotionOAuthConfig();
    const res = await fetch(cfg.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${cfg.clientId}:${cfg.clientSecret}`).toString("base64")}`,
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: cfg.redirectUri,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Notion token exchange failed: ${res.status} - ${text}`);
    }
    const data = await res.json();
    return {
      accessToken: data.access_token,
      tokenType: "Bearer",
      // Notion tokens don't expire
    };
  },

  async refreshToken(tokens: OAuthTokens): Promise<OAuthTokens> {
    return tokens; // Notion tokens don't expire
  },

  async listPages(tokens: OAuthTokens): Promise<{ id: string; name: string; url?: string }[]> {
    const res = await fetch("https://api.notion.com/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filter: { value: "page", property: "object" },
        page_size: 50,
      }),
    });
    if (!res.ok) throw new Error(`Notion search failed: ${res.status}`);
    const data = await res.json();
    return (data.results || []).map((p: Record<string, unknown>) => ({
      id: p.id as string,
      name: ((p.properties as Record<string, unknown>)?.title as Record<string, unknown>)?.toString() || (p.id as string),
      url: p.url as string,
    }));
  },

  async getPageContent(tokens: OAuthTokens, pageId: string): Promise<string> {
    const res = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Notion-Version": "2022-06-28",
      },
    });
    if (!res.ok) throw new Error(`Notion page fetch failed: ${res.status}`);
    const data = await res.json();
    // Flatten rich_text into plain text
    const lines: string[] = [];
    for (const block of (data.results || []) as Array<Record<string, unknown>>) {
      const type = block.type as string;
      const content = block[type as keyof typeof block] as Record<string, unknown>;
      if (content?.rich_text) {
        const text = (content.rich_text as Array<Record<string, unknown>>).map((t: Record<string, unknown>) => t.plain_text).join("");
        lines.push(text);
      }
    }
    return lines.join("\n");
  },
};
