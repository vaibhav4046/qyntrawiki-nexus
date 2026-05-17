import { OAuthConfig, OAuthTokens, ConnectorFile, getGoogleOAuthConfig } from "./index";

export const googleProvider = {
  name: "google-drive",

  getAuthUrl(state?: string): string {
    const cfg = getGoogleOAuthConfig();
    if (!cfg.clientId) return "";
    const params = new URLSearchParams({
      client_id: cfg.clientId,
      redirect_uri: cfg.redirectUri,
      response_type: "code",
      scope: cfg.scope,
      access_type: "offline",
      prompt: "consent",
      include_granted_scopes: "true",
    });
    if (state) params.set("state", state);
    return `${cfg.authorizeUrl}?${params.toString()}`;
  },

  async exchangeCode(code: string): Promise<OAuthTokens> {
    const cfg = getGoogleOAuthConfig();
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
    if (!res.ok) throw new Error(`Google token exchange failed: ${res.status}`);
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
    const cfg = getGoogleOAuthConfig();
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
    if (!res.ok) throw new Error("Google refresh failed");
    const data = await res.json();
    return {
      accessToken: data.access_token,
      refreshToken: tokens.refreshToken,
      expiresAt: Date.now() + data.expires_in * 1000,
      tokenType: data.token_type,
    };
  },

  async listFiles(tokens: OAuthTokens, query?: string): Promise<ConnectorFile[]> {
    const url = query
      ? `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(`name contains '${query}' and trashed=false`)}&fields=files(id,name,mimeType,size,modifiedTime)&pageSize=50`
      : "https://www.googleapis.com/drive/v3/files?fields=files(id,name,mimeType,size,modifiedTime)&pageSize=50&q=trashed=false";
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    });
    if (!res.ok) throw new Error(`Google Drive list failed: ${res.status}`);
    const data = await res.json();
    return (data.files || []).map((f: Record<string, unknown>) => ({
      id: f.id as string,
      name: f.name as string,
      mimeType: f.mimeType as string,
      size: (f.size as string) ? parseInt(f.size as string, 10) : undefined,
      modifiedTime: f.modifiedTime as string,
    }));
  },

  async downloadFile(tokens: OAuthTokens, fileId: string): Promise<string> {
    // First get the file metadata to check mimeType
    const metaRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType`, {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    });
    if (!metaRes.ok) throw new Error("Failed to get file metadata");
    const meta = await metaRes.json() as Record<string, string>;

    // For Google Docs/Sheets/Slides, export as text
    const isGoogleDoc = meta.mimeType.startsWith("application/vnd.google-apps.");
    let downloadUrl: string;
    if (isGoogleDoc) {
      const exportMap: Record<string, string> = {
        "application/vnd.google-apps.document": "text/plain",
        "application/vnd.google-apps.spreadsheet": "text/csv",
        "application/vnd.google-apps.presentation": "text/plain",
      };
      downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=${encodeURIComponent(exportMap[meta.mimeType] || "text/plain")}`;
    } else {
      downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    }

    const res = await fetch(downloadUrl, {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    });
    if (!res.ok) throw new Error(`Google Drive download failed: ${res.status}`);
    return await res.text();
  },
};
