// lib/contradictions.ts

export interface ClaimData {
  id: string;
  subject: string;
  predicate: string;
  object: string;
  confidence: number;
}

export interface Contradiction {
  claimA: ClaimData;
  claimB: ClaimData;
  explanation: string;
  status: "disputed" | "resolved" | "pending";
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

function isOpposite(a: string, b: string): boolean {
  const oppositePairs = [
    ["is", "is not"], ["can", "cannot"], ["does", "does not"],
    ["supports", "contradicts"], ["enables", "prevents"], ["increases", "decreases"],
  ];
  const na = normalize(a);
  const nb = normalize(b);
  return na !== nb;
}

export function detectContradictions(newClaims: ClaimData[], existingClaims: ClaimData[]): Contradiction[] {
  const contradictions: Contradiction[] = [];

  for (const nc of newClaims) {
    for (const ec of existingClaims) {
      const subjMatch = normalize(nc.subject) === normalize(ec.subject);
      const predMatch = normalize(nc.predicate) === normalize(ec.predicate);
      const objDiff = isOpposite(nc.object, ec.object);

      if (subjMatch && predMatch && objDiff) {
        contradictions.push({
          claimA: nc,
          claimB: ec,
          explanation: `These claims disagree about "${nc.subject}": one says "${nc.predicate} ${nc.object}" while another says "${ec.predicate} ${ec.object}".`,
          status: "disputed",
        });
      }
    }
  }

  return contradictions;
}

export function computeHealthScore(data: {
  citationCount: number;
  sourceCount: number;
  contradictionCount: number;
  backlinkCount: number;
  daysSinceUpdate: number;
}): number {
  let score = 0;
  score += Math.min(data.citationCount / 10, 1) * 0.35;
  score += Math.min(data.sourceCount / 5, 1) * 0.25;
  score += Math.max(0, 1 - data.daysSinceUpdate / 90) * 0.15;
  score += Math.min(data.backlinkCount / 10, 1) * 0.10;
  score += Math.max(0, 1 - data.contradictionCount / 3) * 0.15;
  return Math.round(score * 100) / 100;
}
