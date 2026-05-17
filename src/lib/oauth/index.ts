export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authorizeUrl: string;
  tokenUrl: string;
  scope: string;
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  tokenType?: string;
}

export interface ConnectorFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  modifiedTime?: string;
  downloadUrl?: string;
  content?: string;
}

export interface OAuthProvider {
  name: string;
  getAuthUrl(state?: string): string;
  exchangeCode(code: string): Promise<OAuthTokens>;
  refreshToken(tokens: OAuthTokens): Promise<OAuthTokens>;
  listFiles(tokens: OAuthTokens, query?: string): Promise<ConnectorFile[]>;
  downloadFile(tokens: OAuthTokens, fileId: string): Promise<string>;
}

function getRedirectUri(): string {
  const base = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || "http://localhost:3000";
  const url = base.startsWith("http") ? base : `https://${base}`;
  return `${url}/api/oauth/callback`;
}

export function getGoogleOAuthConfig(): OAuthConfig {
  return {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    redirectUri: getRedirectUri(),
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scope: "https://www.googleapis.com/auth/drive.readonly",
  };
}

export function getMicrosoftOAuthConfig(): OAuthConfig {
  return {
    clientId: process.env.MICROSOFT_CLIENT_ID || "",
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "",
    redirectUri: getRedirectUri(),
    authorizeUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    tokenUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    scope: "Files.Read Files.Read.All openid profile email offline_access",
  };
}

export function getNotionOAuthConfig(): OAuthConfig {
  return {
    clientId: process.env.NOTION_CLIENT_ID || "",
    clientSecret: process.env.NOTION_CLIENT_SECRET || "",
    redirectUri: getRedirectUri(),
    authorizeUrl: "https://api.notion.com/v1/oauth/authorize",
    tokenUrl: "https://api.notion.com/v1/oauth/token",
    scope: "",
  };
}
