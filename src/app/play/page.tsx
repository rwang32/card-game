"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import styled from "styled-components";
import {
  Card as BaseCard,
  Section as BaseSection,
  Title,
} from "../styles/GameUIStyles";
import {
  loadCards,
  Card as GameCard,
  CATEGORIES as ALL_CATEGORIES,
} from "../../lib/cards";

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px; /* reduce margin around card so dropdown/modal has less outer spacing */
`;

const PlayCard = styled(BaseCard)`
  width: 100%;
  max-width: 94vw; /* allow the card to occupy almost entire viewport width */
  height: 86vh; /* target overall card height */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative; /* allow overlay dropdown */
`;

const LogoBar = styled.div`
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.02);
`;

const FilterBar = styled(BaseSection)`
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  position: relative;
  z-index: 2;
`;

const FilterHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const HeaderLeft = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const FilterTitle = styled(Title)`
  font-size: 16px;
  text-align: left;
`;

const ToggleButton = styled.button`
  background: transparent;
  color: var(--muted);
  border: 1px solid rgba(255, 255, 255, 0.04);
  padding: 6px 10px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ColorPills = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;

const Pill = styled.div<{ color: string }>`
  width: 14px;
  height: 14px;
  border-radius: 999px;
  background: ${(p) => p.color};
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.2) inset;
  border: 1px solid rgba(0, 0, 0, 0.15);
`;

// Dropdown overlay (covers card, absolute) — expanded to leave smaller margins
const Dropdown = styled.div<{ open?: boolean }>`
  position: absolute;
  left: 12px;
  right: 12px;
  top: 84px; /* below logo + filter header */
  border-radius: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(8px);
  color: var(--foreground);

  /* animate open/close */
  transform-origin: top center;
  transform: ${(p) =>
    p.open ? "translateY(0) scale(1)" : "translateY(-6px) scale(0.995)"};
  opacity: ${(p) => (p.open ? "1" : "0")};
  pointer-events: ${(p) => (p.open ? "auto" : "none")};
  transition: opacity 220ms ease, transform 220ms cubic-bezier(0.2, 0.9, 0.2, 1);
  z-index: 50;
  max-height: calc(100% - 120px);
  overflow: auto;
`;

const CategoryRow = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 6px;
`;

const Checkbox = styled.input.attrs({ type: "checkbox" })`
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: transparent;
  display: inline-block;
  vertical-align: middle;
  cursor: pointer;

  &:checked {
    background: var(--accent);
    border-color: var(--accent);
  }
`;

const CategoryName = styled.div`
  font-size: 14px;
  color: var(--foreground);
`;

// Placeholder card styling
const CardPlaceholderOuter = styled.div<{ color: string }>`
  width: 360px;
  max-width: 92%;
  height: 520px; /* larger fixed height for the card */
  border-radius: 14px;
  position: relative;
  padding: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto; /* center the card horizontally */
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.02),
    rgba(255, 255, 255, 0.01)
  );
  border-top: 12px solid ${(p) => p.color};
  border-bottom: 12px solid ${(p) => p.color};
  border-left: 2px solid ${(p) => p.color};
  border-right: 2px solid ${(p) => p.color};
  box-shadow: 0 12px 36px rgba(2, 6, 23, 0.6);
`;

const CardInner = styled.div`
  width: 86%;
  height: 62%;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  color: var(--foreground);
  text-align: center;
  font-size: 14px;
`;

const CardCategoryLabel = styled.div`
  position: absolute;
  right: 12px;
  bottom: 8px;
  font-size: 12px;
  color: var(--muted);
`;

const DeckArea = styled.div`
  flex: 1 1 auto; /* take remaining space */
  padding: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const swipeThreshold = 80; // px

const DrinkOverlay = styled.div<{ show?: boolean }>`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 40;
  opacity: ${(p) => (p.show ? 1 : 0)};
  transform: ${(p) => (p.show ? "scale(1)" : "scale(0.9)")};
  transition: opacity 200ms ease, transform 220ms cubic-bezier(0.2, 0.9, 0.2, 1);
`;

const DrinkText = styled.div`
  background: rgba(239, 68, 68, 0.95);
  color: white;
  font-weight: 800;
  padding: 18px 28px;
  border-radius: 12px;
  font-size: 22px;
  box-shadow: 0 10px 30px rgba(239, 68, 68, 0.22);
`;

const PlayPage: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    ALL_CATEGORIES.forEach((c) => (map[c.id] = true)); // default all selected
    return map;
  });

  const selectedCategories = useMemo(
    () => ALL_CATEGORIES.filter((c) => selected[c.id]),
    [selected]
  );

  const [cards, setCards] = useState<GameCard[]>([]);

  // helper: shuffle an array (Fisher-Yates)
  const shuffleArray = <T,>(arr: T[]) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // persist/load filter selections
  const FILTER_KEY = "card_filters_v1";

  useEffect(() => {
    // load saved filters first
    try {
      const raw = localStorage.getItem(FILTER_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          // ensure keys exist for all categories
          const map: Record<string, boolean> = {};
          ALL_CATEGORIES.forEach(
            (c) =>
              (map[c.id] = parsed[c.id] === undefined ? true : !!parsed[c.id])
          );
          // schedule setState to avoid synchronous setState inside effect
          setTimeout(() => setSelected(map), 0);
        }
      }
    } catch {
      // ignore
    }

    let mounted = true;
    loadCards()
      .then((data) => {
        if (!mounted) return;
        // shuffle once on load
        setCards(shuffleArray(data));
      })
      .catch((e) => {
        console.error("Failed to load cards:", e);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // save filters whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(FILTER_KEY, JSON.stringify(selected));
    } catch {
      // ignore
    }
  }, [selected]);

  const filteredCards = useMemo(
    () => cards.filter((c) => selected[c.categoryId]),
    [cards, selected]
  );

  const [currentIdx, setCurrentIdx] = useState(0);

  // reset index when filters change
  useEffect(() => {
    // schedule reset after render to avoid cascading renders
    const t = setTimeout(() => setCurrentIdx(0), 0);
    return () => clearTimeout(t);
  }, [filteredCards.length]);

  const activeCard =
    filteredCards.length > 0
      ? filteredCards[currentIdx % filteredCards.length]
      : null;

  const activeCategory = activeCard
    ? ALL_CATEGORIES.find((cat) => cat.id === activeCard.categoryId) ??
      ALL_CATEGORIES[0]
    : ALL_CATEGORIES[0];

  const toggleCategory = (id: string) => {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
    // reset index if none selected
    setCurrentIdx(0);
  };

  // drag state
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [animating, setAnimating] = useState(false);
  const [showDrink, setShowDrink] = useState(false);

  const onPointerDown = (e: React.PointerEvent) => {
    if (animating) return;
    dragging.current = true;
    setIsDragging(true);
    start.current = { x: e.clientX, y: e.clientY };
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    setDrag({ x: dx, y: dy });
  };

  const resetCardPosition = (delay = 0) => {
    setTimeout(() => {
      setDrag({ x: 0, y: 0 });
      setAnimating(false);
    }, delay);
  };

  const showNextCard = (direction: "up" | "right") => {
    if (filteredCards.length === 0) {
      // no cards to advance
      resetCardPosition(120);
      return;
    }

    setAnimating(true);
    // animate off-screen by setting drag to large value
    if (direction === "up")
      setDrag((d) => ({ x: d.x, y: -window.innerHeight }));
    else setDrag((d) => ({ x: window.innerWidth, y: d.y }));

    setTimeout(() => {
      setAnimating(false);
      setDrag({ x: 0, y: 0 });
      setCurrentIdx((i) =>
        filteredCards.length ? (i + 1) % filteredCards.length : 0
      );
    }, 260);
  };

  const triggerDrink = (direction: "down" | "left") => {
    setAnimating(true);
    // small fling to show feedback
    if (direction === "down")
      setDrag((d) => ({ x: d.x, y: window.innerHeight * 0.35 }));
    else setDrag((d) => ({ x: -window.innerWidth * 0.5, y: d.y }));

    setTimeout(() => {
      setShowDrink(true);

      setTimeout(() => {
        setShowDrink(false);
        setDrag({ x: 0, y: 0 });
        // advance to next card after showing DRINK
        setCurrentIdx((i) =>
          filteredCards.length ? (i + 1) % filteredCards.length : 0
        );
        setAnimating(false);
      }, 900);
    }, 200);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    setIsDragging(false);
    try {
      (e.target as Element).releasePointerCapture(e.pointerId);
    } catch {}

    const dx = drag.x;
    const dy = drag.y;

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    // determine primary direction
    if (absX > absY) {
      // horizontal
      if (dx > swipeThreshold) {
        showNextCard("right");
      } else if (dx < -swipeThreshold) {
        triggerDrink("left");
      } else {
        resetCardPosition(120);
      }
    } else {
      // vertical
      if (dy < -swipeThreshold) {
        showNextCard("up");
      } else if (dy > swipeThreshold) {
        triggerDrink("down");
      } else {
        resetCardPosition(120);
      }
    }
  };

  const transformStyle = {
    transform: `translate3d(${drag.x}px, ${drag.y}px, 0) rotate(${(
      drag.x / 20
    ).toFixed(2)}deg)`,
    transition: animating
      ? "transform 220ms cubic-bezier(.2,.9,.2,1)"
      : isDragging
      ? "none"
      : "transform 160ms ease",
  } as React.CSSProperties;

  return (
    <Container>
      <PlayCard>
        <LogoBar>{/* logo placeholder - leave space for logo here */}</LogoBar>

        <FilterBar>
          <FilterHeader>
            <HeaderLeft>
              <FilterTitle>Filters</FilterTitle>
              <ColorPills>
                {selectedCategories.map((c, i) => (
                  <Pill key={i} color={c.color} />
                ))}
              </ColorPills>
            </HeaderLeft>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <ToggleButton
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-label="toggle categories"
              >
                <span
                  style={{
                    transform: open ? "rotate(180deg)" : "rotate(0deg)",
                    display: "inline-block",
                    transition: "transform 200ms",
                  }}
                >
                  ▾
                </span>
              </ToggleButton>
            </div>
          </FilterHeader>

          <Dropdown open={open} aria-hidden={!open}>
            {ALL_CATEGORIES.map((c) => (
              <CategoryRow key={c.id}>
                <Checkbox
                  checked={!!selected[c.id]}
                  onChange={() => toggleCategory(c.id)}
                />
                <Pill color={c.color} />
                <CategoryName>{c.name}</CategoryName>
              </CategoryRow>
            ))}
          </Dropdown>
        </FilterBar>

        <DeckArea>
          <div
            style={{
              position: "relative",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              ref={cardRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              style={{ touchAction: "none", ...transformStyle }}
            >
              <CardPlaceholderOuter color={activeCategory.color}>
                <CardInner>
                  <div>
                    {activeCard ? (
                      <>
                        <div style={{ fontWeight: 700, marginBottom: 8 }}>
                          {activeCard.title}
                        </div>
                        <div style={{ fontSize: 13 }}>
                          {activeCard.description}
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontWeight: 700, marginBottom: 8 }}>
                          No cards
                        </div>
                        <div style={{ fontSize: 13 }}>
                          Enable some categories to load cards into the deck.
                        </div>
                      </>
                    )}
                  </div>
                </CardInner>
                <CardCategoryLabel>
                  {activeCard
                    ? ALL_CATEGORIES.find((c) => c.id === activeCard.categoryId)
                        ?.name ?? ""
                    : ""}
                </CardCategoryLabel>
              </CardPlaceholderOuter>
            </div>

            <DrinkOverlay show={showDrink}>
              <DrinkText>DRINK</DrinkText>
            </DrinkOverlay>
          </div>
        </DeckArea>
      </PlayCard>
    </Container>
  );
};

export default PlayPage;
