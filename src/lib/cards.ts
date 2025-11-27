export type CategoryId =
  | "truth"
  | "dare"
  | "group"
  | "challenge"
  | "social"
  | "wildcard"
  | "partner";

export type Spicyness = 1 | 2 | 3 | 4 | 5;

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
  { id: "social", name: "Social", color: "#A78BFA" },
  { id: "wildcard", name: "Wildcard", color: "#F87171" },
  { id: "partner", name: "Partner", color: "#FB7185" },
];

export const loadCards = async (): Promise<Card[]> => {
  const res = await fetch("/cards.json");
  const data = (await res.json()) as Card[];
  return data.map((c) => ({ ...c }));
};
