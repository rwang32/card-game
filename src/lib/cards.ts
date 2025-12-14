export type CategoryId =
  | "truth"
  | "dare"
  | "group"
  | "challenge"
  | "wildcard";

export type Spicyness = 0 | 1 | 2;

export interface Card {
  id: string;
  title: string;
  description: string;
  categoryId: CategoryId;
  tags: string[];
  spicyness: Spicyness;
  createdAt?: string; // ISO date
  requiresPlayers?: number; // minimum number of players required (default 1)
}

export interface Category {
  id: CategoryId;
  name: string;
  color: string; // hex or tailwind class
}

export const CATEGORIES: Category[] = [
  { id: "truth", name: "Truth", color: "#60A5FA" },
  { id: "dare", name: "Dare", color: "#F97316" },
  { id: "group", name: "Group", color: "#34D399" },
  { id: "challenge", name: "Challenge", color: "#F59E0B" },
  { id: "wildcard", name: "Wildcard", color: "#F87171" },
];

const VALID_CATEGORY_IDS = new Set(CATEGORIES.map((c) => c.id));

export const loadCards = async (): Promise<Card[]> => {
  const res = await fetch("/cards.json");
  const data = (await res.json()) as unknown[];

  return (data || []).map((c) => {
    const item = c as Record<string, unknown>;

    // normalize spicyness to a 0..2 scale
    // raw data may be 0..5 (or other). We'll linearly map 0..5 -> 0..2 and round.
    const rawSpiceVal = item["spicyness"] ?? 0;
    const rawSpiceNum = Number(
      typeof rawSpiceVal === "string" || typeof rawSpiceVal === "number" ? rawSpiceVal : 0
    );
    // map: new = round((raw / 5) * 2)
    const mapped = Math.round((Math.max(0, Math.min(5, rawSpiceNum)) / 5) * 2);
    const spicyness: Spicyness = (mapped < 0 ? 0 : mapped > 2 ? 2 : mapped) as Spicyness;

    // ensure categoryId is valid; default to 'wildcard' when unknown
    const rawCategory = item["categoryId"];
    const catStr = typeof rawCategory === "string" ? rawCategory : "";
    const categoryId = VALID_CATEGORY_IDS.has(catStr as CategoryId) ? (catStr as CategoryId) : ("wildcard" as CategoryId);

    const id = item["id"] ?? "";
    const title = item["title"] ?? "";
    const description = item["description"] ?? "";
    const tagsRaw = item["tags"];

    return {
      id: String(id),
      title: String(title),
      description: String(description),
      categoryId,
      tags: Array.isArray(tagsRaw) ? tagsRaw.map((t) => String(t)) : [],
      spicyness,
      createdAt: typeof item["createdAt"] === "string" ? (item["createdAt"] as string) : undefined,
      requiresPlayers: typeof item["requiresPlayers"] === "number" ? (item["requiresPlayers"] as number) : undefined,
    } as Card;
  });
};
