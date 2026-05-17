import { prisma } from "@/lib/prisma";
import AskClient from "./AskClient";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function AskPage({ params }: Props) {
  const { slug } = await params;

  const wiki = prisma.wiki.findUnique({ where: { slug } });
  if (!wiki) return null;
  const wikiId = wiki.id as string;

  const pages = prisma.page.findMany({
    where: { wikiId },
    orderBy: { confidenceScore: "desc" },
    take: 10,
  });

  const pageData = pages.map(p => ({
    title: p.title as string,
    summary: p.summary as string,
    slug: p.slug as string,
  }));

  return <AskClient slug={slug} pages={pageData} />;
}
