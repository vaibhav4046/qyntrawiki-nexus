import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import IngestClient from "./IngestClient";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function IngestPage({ params }: Props) {
  const { slug } = await params;

  const wiki = prisma.wiki.findUnique({ where: { slug } });
  if (!wiki) notFound();

  const wikiId = wiki.id as string;
  const sources = prisma.source.findMany({
    where: { wikiId },
    orderBy: { createdAt: "desc" },
  });
  const pages = prisma.page.findMany({
    where: { wikiId },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <IngestClient
      slug={slug}
      data={{
        wiki: { id: wikiId, slug, name: (wiki.name as string) || slug },
        sources: sources as any[],
        pages: pages as any[],
      }}
    />
  );
}
