// Types for class-based connectors (hydradb.ts, notion.ts)

export type ConnectorStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "syncing"
  | "error";

export interface ConnectorCredentials {
  apiKey?: string;
  tenantId?: string;
  accessToken?: string;
  refreshToken?: string;
  integrationToken?: string;
  [key: string]: unknown;
}

export interface AuthField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
}

export interface ConnectorConfig {
  id: string;
  name: string;
  type: string;
  icon: string;
  description: string;
  authFields: AuthField[];
  isConnected?: boolean;
  credentials?: ConnectorCredentials;
  lastSync?: string;
  status?: ConnectorStatus;
  [key: string]: unknown;
}

export interface BaseConnector {
  config: ConnectorConfig;
  getStatus(): ConnectorStatus;
  authenticate(credentials?: ConnectorCredentials): Promise<ConnectorConfig>;
  sync(wikiId: string): Promise<SyncResult>;
  disconnect(): Promise<ConnectorConfig>;
}

export interface SyncedSource {
  id: string;
  wikiId: string;
  type: string;
  title: string;
  rawText: string;
  url: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface SyncResult {
  added: number;
  updated: number;
  errors: number;
  sources: SyncedSource[];
  message: string;
}

// Types for store-based connectors (API routes)

export type ConnectorAuthType =
  | "oauth"
  | "apiKey"
  | "token"
  | "apikey"
  | "file"
  | "browser";

export interface Connector {
  id: string;
  name: string;
  type: string;
  authType: ConnectorAuthType;
  description: string;
  icon: string;
  config: Record<string, unknown>;
  connected: boolean;
  credentials: ConnectorCredentials | null;
  lastSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SyncItem {
  title: string;
  rawText: string;
  url: string;
  type: string;
}

export interface ConnectorImplementation {
  sync(
    config: Record<string, unknown>,
    credentials: ConnectorCredentials | null
  ): Promise<SyncItem[]>;
  getAuthUrl?(connectorId: string, config: Record<string, unknown>): string;
}
