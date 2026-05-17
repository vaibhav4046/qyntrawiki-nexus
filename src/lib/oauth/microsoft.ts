import { OAuthTokens, getMicrosoftOAuthConfig } from "./index";

export const microsoftProvider = {
  name: "microsoft",

  getAuthUrl(state?: string): string {
    const cfg = getMicrosoftOAuthConfig();
    if (!cfg.clientId) return "";
    const params = new URLSearchParams({
      client_id: cfg.clientId,
      redirect_uri: cfg.redirectUri,
      response_type: "code",
      scope: cfg.scope,
      response_mode: "query",
    });
    if (state) params.set("state", state);
    return `${cfg.authorizeUrl}?${params.toString()}`;
  },

  async exchangeCode(code: string): Promise<OAuthTokens> {
    const cfg = getMicrosoftOAuthConfig();
    const res = await fetch(cfg.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: cfg.clientId,
        client_secret: cfg.clientSecret,
        code,
        redirect_uri: cfg.redirectUri,
        grant_type: "authorization_code",
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Microsoft token exchange failed: ${res.status} - ${text}`);
    }
    const data = await res.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + data.expires_in * 1000,
      tokenType: data.token_type,
    };
  },

  async refreshToken(tokens: OAuthTokens): Promise<OAuthTokens> {
    if (!tokens.refreshToken) return tokens;
    const cfg = getMicrosoftOAuthConfig();
    const res = await fetch(cfg.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: cfg.clientId,
        client_secret: cfg.clientSecret,
        refresh_token: tokens.refreshToken,
        grant_type: "refresh_token",
      }),
    });
    if (!res.ok) throw new Error("Microsoft refresh failed");
    const data = await res.json();
    return {
      accessToken: data.access_token,
      refreshToken: tokens.refreshToken,
      expiresAt: Date.now() + data.expires_in * 1000,
      tokenType: data.token_type,
    };
  },

  async listFiles(tokens: OAuthTokens): Promise<{ id: string; name: string; mimeType: string; size?: number; modifiedTime?: string }[]> {
    const res = await fetch("https://graph.microsoft.com/v1.0/me/drive/root/children?$select=id,name,size,lastModifiedDateTime,file,mimeType", {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    });
    if (!res.ok) throw new Error(`Microsoft Graph list failed: ${res.status}`);
    const data = await res.json();
    return (data.value || []).map((f: Record<string, unknown>) => ({
      id: f.id as string,
      name: f.name as string,
      mimeType: (f.file as Record<string, unknown>)?.mimeType as string || "application/octet-stream",
      size: f.size as number,
      modifiedTime: f.lastModifiedDateTime as string,
    }));
  },

  async downloadFile(tokens: OAuthTokens, fileId: string): Promise<string> {
    const res = await fetch(`https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/content`, {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    });
    if (!res.ok) throw new Error(`Microsoft download failed: ${res.status}`);
    return await res.text();
  },
};
