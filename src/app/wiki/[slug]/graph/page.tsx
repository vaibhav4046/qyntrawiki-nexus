import { prisma } from "@/lib/prisma";
import GraphClient from "./GraphClient";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function GraphPage({ params }: Props) {
  const { slug } = await params;

  const wiki = prisma.wiki.findUnique({ where: { slug } });
  if (!wiki) return null;
  const wikiId = wiki.id as string;

  const entities = prisma.entity.findMany({ where: { wikiId } });
  const relations = prisma.relation.findMany({ where: { wikiId } });
  const pages = prisma.page.findMany({ where: { wikiId } });

  const pageData = pages.map(p => ({
    id: p.id as string,
    title: p.title as string,
    slug: p.slug as string,
  }));

  const entityData = entities.map(e => ({
    id: e.id as string,
    name: e.name as string,
    type: e.type as string,
    description: e.description as string | undefined,
    pageId: e.pageId as string | undefined,
  }));

  const relationData = relations.map(r => ({
    id: r.id as string,
    fromPageId: r.fromPageId as string,
    toPageId: r.toPageId as string,
    relationType: r.relationType as string,
    weight: r.weight as number,
  }));

  return (
    <GraphClient
      slug={slug}
      initialEntities={entityData}
      initialRelations={relationData}
      initialPages={pageData}
    />
  );
}
