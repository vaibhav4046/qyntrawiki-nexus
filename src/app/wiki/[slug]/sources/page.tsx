import { prisma } from "@/lib/prisma";
import SourcesClient from "./SourcesClient";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function SourcesPage({ params }: Props) {
  const { slug } = await params;

  const wiki = prisma.wiki.findUnique({ where: { slug } });
  if (!wiki) return null;
  const wikiId = wiki.id as string;

  const sources = prisma.source.findMany({ where: { wikiId }, orderBy: { createdAt: "desc" } });

  const sourceData = sources.map(s => ({
    id: s.id as string,
    type: s.type as string,
    title: s.title as string,
    url: (s.url as string) || "",
    status: s.status as string,
    error: (s.error as string) || "",
    createdAt: s.createdAt as string,
  }));

  return <SourcesClient slug={slug} initialSources={sourceData} />;
}
