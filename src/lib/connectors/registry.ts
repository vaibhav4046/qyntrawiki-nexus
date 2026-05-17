// src/lib/connectors/registry.ts
// Registry of all available external-data connectors for QyntraWiki.

import { ConnectorConfig } from "./types";

export interface RegistryEntry {
  id: string;
  name: string;
  type: ConnectorConfig["type"];
  icon: string;
  description: string;
  authFields: ConnectorConfig["authFields"];
  authType: ConnectorConfig["type"];
}

export const CONNECTOR_REGISTRY: RegistryEntry[] = [
  {
    id: "notion",
    name: "Notion",
    type: "oauth",
    authType: "oauth",
    icon: "NotepadText",
    description: "Sync pages and databases from your Notion workspace.",
    authFields: [
      { name: "integrationToken", label: "Integration Token", type: "password", required: true, placeholder: "secret_..." },
    ],
  },
  {
    id: "google-drive",
    name: "Google Drive",
    type: "oauth",
    authType: "oauth",
    icon: "HardDrive",
    description: "Import documents, slides, and sheets from Google Drive.",
    authFields: [
      { name: "clientId", label: "OAuth Client ID", type: "text", required: true },
      { name: "clientSecret", label: "OAuth Client Secret", type: "password", required: true },
    ],
  },
  {
    id: "dropbox",
    name: "Dropbox",
    type: "oauth",
    authType: "oauth",
    icon: "Cloud",
    description: "Sync files and folders from your Dropbox account.",
    authFields: [
      { name: "appKey", label: "App Key", type: "text", required: true },
      { name: "appSecret", label: "App Secret", type: "password", required: true },
    ],
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    type: "oauth",
    authType: "oauth",
    icon: "Linkedin",
    description: "Import articles and activity from your LinkedIn profile.",
    authFields: [
      { name: "clientId", label: "Client ID", type: "text", required: true },
      { name: "clientSecret", label: "Client Secret", type: "password", required: true },
    ],
  },
  {
    id: "instagram",
    name: "Instagram",
    type: "oauth",
    authType: "oauth",
    icon: "Instagram",
    description: "Pull captions and media metadata from Instagram.",
    authFields: [
      { name: "clientId", label: "Client ID", type: "text", required: true },
      { name: "clientSecret", label: "Client Secret", type: "password", required: true },
    ],
  },
  {
    id: "x-twitter",
    name: "X / Twitter",
    type: "oauth",
    authType: "oauth",
    icon: "Twitter",
    description: "Sync tweets, threads, and bookmarks from X.",
    authFields: [
      { name: "bearerToken", label: "Bearer Token", type: "password", required: true, placeholder: "AAAAAAAA..." },
      { name: "apiKey", label: "API Key", type: "text", required: false },
      { name: "apiSecret", label: "API Secret", type: "password", required: false },
    ],
  },
  {
    id: "github",
    name: "GitHub",
    type: "oauth",
    authType: "oauth",
    icon: "Github",
    description: "Import READMEs, issues, and wiki pages from GitHub repos.",
    authFields: [
      { name: "personalAccessToken", label: "Personal Access Token", type: "password", required: true, placeholder: "ghp_..." },
      { name: "org", label: "Organization (optional)", type: "text", required: false },
    ],
  },
  {
    id: "slack",
    name: "Slack",
    type: "oauth",
    authType: "oauth",
    icon: "MessageSquare",
    description: "Ingest messages and files from Slack channels.",
    authFields: [
      { name: "botToken", label: "Bot User OAuth Token", type: "password", required: true, placeholder: "xoxb-..." },
      { name: "channels", label: "Channel IDs (comma-separated)", type: "text", required: false, placeholder: "#general, #engineering" },
    ],
  },
  {
    id: "obsidian",
    name: "Obsidian",
    type: "file",
    authType: "file",
    icon: "BookMarked",
    description: "Import Markdown vaults from your local Obsidian folder.",
    authFields: [
      { name: "vaultPath", label: "Vault Path", type: "text", required: true, placeholder: "/Users/you/Documents/Obsidian" },
    ],
  },
  {
    id: "browser-history",
    name: "Browser History",
    type: "browser",
    authType: "browser",
    icon: "Globe",
    description: "Sync recently visited pages from your browser history.",
    authFields: [
      { name: "daysBack", label: "Days Back", type: "select", required: true, options: [
        { label: "7 days", value: "7" },
        { label: "30 days", value: "30" },
        { label: "90 days", value: "90" },
      ]},
    ],
  },
  {
    id: "local-files",
    name: "Local Files",
    type: "file",
    authType: "file",
    icon: "FolderOpen",
    description: "Index Markdown, TXT, and PDF files from a local directory.",
    authFields: [
      { name: "directory", label: "Directory Path", type: "text", required: true, placeholder: "/Users/you/Documents" },
      { name: "recursive", label: "Recursive", type: "checkbox", required: false },
    ],
  },
  {
    id: "hydradb",
    name: "HydraDB",
    type: "api_key",
    authType: "api_key",
    icon: "Database",
    description: "Connect to your HydraDB tenant for graph-powered recall and ingestion.",
    authFields: [
      { name: "apiKey", label: "API Key", type: "password", required: true, placeholder: "hydra_..." },
      { name: "tenantId", label: "Tenant ID", type: "text", required: false, placeholder: "qyntra_..." },
    ],
  },
];

/** Quick lookup by connector id. */
export function getRegistryEntry(id: string): RegistryEntry | undefined {
  return CONNECTOR_REGISTRY.find((c) => c.id === id);
}
