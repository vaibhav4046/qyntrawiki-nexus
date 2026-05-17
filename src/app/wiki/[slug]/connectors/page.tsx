import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ConnectorsClient } from "./ConnectorsClient";
import { connectorStore } from "@/lib/connectors";

function mapAuthType(authType: string): "oauth" | "apikey" | "file" {
  if (authType === "oauth") return "oauth";
  if (authType === "apikey" || authType === "api_key" || authType === "token") return "apikey";
  return "file";
}

function toUiConnector(c: ReturnType<typeof connectorStore.findMany>[number]) {
  const credentials = c.credentials as Record<string, string> | null;
  const apiKey = credentials?.apiKey || credentials?.accessToken || undefined;
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

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ConnectorsPage({ params }: Props) {
  const { slug } = await params;

  const wiki = prisma.wiki.findUnique({ where: { slug } });
  if (!wiki) notFound();

  const connectors = connectorStore.findMany().map(toUiConnector);

  return (
    <ConnectorsClient
      wikiName={(wiki.name as string) || slug}
      slug={slug}
      initialConnectors={connectors}
    />
  );
}
