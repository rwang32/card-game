"use client";

import React, { useMemo, useState, useRef, useEffect, useLayoutEffect } from "react";
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
  align-items: flex-start; /* push PlayCard to top */
  justify-content: center;
  padding: 8px; /* reduce margin around card so dropdown/modal has less outer spacing */
  position: relative;
  touch-action: none; /* prevent default touch behaviors */
`;

const PlayCard = styled(BaseCard)`
  width: 100%;
  max-width: 94vw; /* allow the card to occupy almost entire viewport width */
  height: 86vh; /* target overall card height */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative; /* allow overlay dropdown */
  touch-action: none; /* prevent default touch behaviors */
`;

const TopBar = styled.div`
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid rgba(255, 255, 255, 0.02);
  flex: 0 0 20%; /* occupy 20% of PlayCard height */
  min-height: 96px;
`;

const LogoSlot = styled.div`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: flex-start; /* keep logo to the left */
  padding: 6px 12px;
  /* let the SVG fill a reasonable height */
  svg {
    height: 48px;
    width: auto;
    display: block;
  }

  @media (max-width: 640px) {
    justify-content: center; /* center logo on mobile */
    padding: 8px 12px;
    svg {
      height: 72px; /* reasonably large logo on mobile */
      width: auto;
    }
  }
`;

// ensure FilterBar stretches full width
const FilterBar = styled(BaseSection)`
  /* compact filter bar when used inside the TopBar */
  padding: 0 12px;
  border-bottom: none;
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  width: 100%;
  flex: 1;
  box-sizing: border-box;

  @media (max-width: 640px) {
    padding: 8px 12px;
  }
`;

const FilterHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
`;

const HeaderLeft = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex: 1;
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
  top: 0; /* actual top will be set dynamically via inline style so dropdown sits below FilterBar */
  border-radius: 14px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.78);
  backdrop-filter: blur(10px);
  color: var(--foreground);
  box-shadow: 0 12px 36px rgba(2, 6, 23, 0.6);
  border: 1px solid rgba(255,255,255,0.04);

  /* animate open/close */
  transform-origin: top center;
  transform: ${(p) =>
    p.open ? "translateY(0) scale(1)" : "translateY(-6px) scale(0.995)"};
  opacity: ${(p) => (p.open ? "1" : "0")};
  pointer-events: ${(p) => (p.open ? "auto" : "none")};
  transition: opacity 220ms ease, transform 220ms cubic-bezier(0.2, 0.9, 0.2, 1);
  z-index: 60;
  max-height: calc(100% - 140px);
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
  width: 90%;
  max-width: 90%;
  height: 100%; /* fill the DeckArea height */
  border-radius: 14px;
  position: relative;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center; /* center inner text vertically */
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
  pointer-events: auto; /* ensure card can receive touches */
  touch-action: none;
`;

const CardInner = styled.div`
  width: 100%;
  flex: 1 1 auto;
  background: transparent; /* removed dark inner card */
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--foreground);
  text-align: center;
  font-size: 18px;
  line-height: 1.3;
  overflow: visible; /* changed from auto to prevent scroll interference */
  padding: 0; /* allow outer padding to define spacing */
  touch-action: none;
`;

const CardCategoryLabel = styled.div`
  position: absolute;
  right: 12px;
  bottom: 8px;
  font-size: 12px;
  color: var(--muted);
`;

const PepperIcon = styled.div<{ show?: boolean }>`
  position: absolute;
  left: 12px;
  bottom: 12px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${(p) => (p.show ? 1 : 0)};
  transition: opacity 200ms ease, transform 200ms ease;
  transform: ${(p) => (p.show ? "scale(1)" : "scale(0.85)")};
  pointer-events: none;
`;

const DeckArea = styled.div`
  flex: 1 1 90%; /* take ~90% of PlayCard height */
  padding: 12px 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: none; /* prevent default touch behaviors */
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

export function DrinkWithIreneLogo() {
  return (
    <svg
      viewBox="0 0 640 180"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="96"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Drink with Irene logo"
    >
      <defs>
        <linearGradient id="dwiAccent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FB7185" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>

        <filter id="dwiShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx={0} dy={4} stdDeviation={5} floodColor="#000000" floodOpacity={0.15} />
        </filter>
      </defs>

      {/* Cards + glass icon (kept to the left of the text) */}
      <g transform="translate(36,36)" filter="url(#dwiShadow)">
        <rect x={0} y={6} width={72} height={96} rx={10} fill="#E5E7EB" stroke="#9CA3AF" strokeWidth={2} transform="rotate(-8 0 6)" />
        <rect x={22} y={4} width={72} height={96} rx={10} fill="#FFFFFF" stroke="#111827" strokeWidth={2.6} transform="rotate(6 22 4)" />
        <rect x={34} y={20} width={52} height={12} rx={6} fill="url(#dwiAccent)" opacity={0.95} transform="rotate(6 34 20)" />
        <circle cx={42} cy={48} r={5} fill="#111827" transform="rotate(6 42 48)" />

        <path d="M38 64 L82 64 L76 104 H44 Z" fill="#FFFFFF" stroke="#111827" strokeWidth={2.6} strokeLinejoin="round" />
        <path d="M42 74 L78 74 L74 98 H46 Z" fill="url(#dwiAccent)" opacity={0.9} />

        <line x1={52} y1={82} x2={62} y2={94} stroke="#F9FAFB" strokeWidth={2.2} strokeLinecap="round" />
        <line x1={64} y1={84} x2={74} y2={96} stroke="#F9FAFB" strokeWidth={2.2} strokeLinecap="round" />
      </g>

      {/* Left column: DRINK / WITH stacked */}
      <g transform="translate(140,18)">
        <text
          x={8}
          y={60}
          fontSize={40}
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          fill="#6B7280"
          fontWeight={800}
          letterSpacing={2}
        >
          DRINK
        </text>
        <text
          x={8}
          y={110}
          fontSize={40}
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          fill="#6B7280"
          fontWeight={800}
          letterSpacing={2}
        >
          WITH
        </text>
      </g>

      {/* Right: Irene, larger and pink */}
      <text
        x={305}
        y={98}
        fontSize={120}
        fontWeight={900}
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fill="#FB7185"
        style={{ dominantBaseline: 'middle' }}
      >
        Irene
      </text>

      {/* Accent underline to the right of Irene */}
      <path
        d="M360 132 L600 132"
        stroke="url(#dwiAccent)"
        strokeWidth={6}
        strokeLinecap="round"
      />
    </svg>
  );
}

const PlayPage: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    ALL_CATEGORIES.forEach((c) => (map[c.id] = true));
    return map;
  });
  // refs to handle outside clicks and measurements
  const playCardRef = useRef<HTMLDivElement | null>(null);
  const filterBarRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);

  const [dropdownTop, setDropdownTop] = useState<number>(96);

  const selectedCategories = useMemo(
    () => ALL_CATEGORIES.filter((c) => selected[c.id]),
    [selected]
  );

  const [cards, setCards] = useState<GameCard[]>([]);

  const shuffleArray = <T,>(arr: T[]) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const FILTER_KEY = "card_filters_v1";

  useEffect(() => {
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

  const filteredCards = useMemo(() => {
    // use explicit boolean check to treat undefined as selected=true
    const list = cards.filter((c) => selected[c.categoryId] !== false);
    // return a shuffled copy so order is random every time filters change or cards reload
    return shuffleArray(list);
  }, [cards, selected]);

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
    setSelected((s: Record<string, boolean>) => ({ ...s, [id]: !s[id] }));
    // reset index if none selected
    setCurrentIdx(0);
  };

  // drag state
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement | null>(null);
  // RAF batching for pointer moves to avoid many React renders on mobile
  const rafRef = useRef<number | null>(null);
  const pendingDrag = useRef({ x: 0, y: 0 });
   const [animating, setAnimating] = useState(false);
   const [showDrink, setShowDrink] = useState(false);

  // Lock body scroll during drag and prevent touch events
  useEffect(() => {
    if (isDragging) {
      // Store original styles
      const originalStyle = window.getComputedStyle(document.body).overflow;
      const originalPosition = window.getComputedStyle(document.body).position;
      const scrollY = window.scrollY;
      const htmlStyle = window.getComputedStyle(document.documentElement).overflow;
      
      // Lock scroll
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.documentElement.style.overflow = 'hidden';
      
      // Prevent touchmove at document level to stop scrolling
      const preventTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
      };
      
      // Use capture phase to catch events early - only prevent touchmove which causes scrolling
      document.addEventListener('touchmove', preventTouchMove, { passive: false, capture: true });
      
      return () => {
        // Restore scroll
        document.body.style.overflow = originalStyle;
        document.body.style.position = originalPosition;
        document.body.style.top = '';
        document.body.style.width = '';
        document.documentElement.style.overflow = htmlStyle;
        window.scrollTo(0, scrollY);
        
        // Remove touch listener
        document.removeEventListener('touchmove', preventTouchMove, { capture: true } as EventListenerOptions);
      };
    }
  }, [isDragging]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (animating) return;
    dragging.current = true;
    setIsDragging(true);
    start.current = { x: e.clientX, y: e.clientY };
    (e.target as Element).setPointerCapture(e.pointerId);
    // Prevent default to stop background scrolling on mobile
    e.preventDefault();
    e.stopPropagation();
  };
 
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    // Prevent default to stop background scrolling on mobile
    e.preventDefault();
    e.stopPropagation();
    // update pending values and start RAF if not running
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    pendingDrag.current = { x: dx, y: dy };
    if (rafRef.current == null) {
      rafRef.current = requestAnimationFrame(function step() {
        // flush pending to state in one render
        setDrag({ x: pendingDrag.current.x, y: pendingDrag.current.y });
        rafRef.current = requestAnimationFrame(step);
      });
    }
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
    e.preventDefault();
    e.stopPropagation();
    try {
      (e.target as Element).releasePointerCapture(e.pointerId);
    } catch {}

    // cancel RAF loop and ensure latest pending values are flushed
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    // use the last pending values if available to compute final direction
    const dx = pendingDrag.current.x ?? drag.x;
    const dy = pendingDrag.current.y ?? drag.y;

    // also write the final values into state so UI is consistent
    setDrag({ x: dx, y: dy });

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
    willChange: "transform",
  } as React.CSSProperties;

  // cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // compute dropdown top so it sits just below the FilterBar
  useLayoutEffect(() => {
    const compute = () => {
      try {
        const fb = filterBarRef.current;
        const pc = playCardRef.current;
        if (!fb || !pc) return;
        // offsetTop is relative to PlayCard (the offsetParent)
        const top = fb.offsetTop + fb.offsetHeight + 8; // 8px gap
        setDropdownTop(top);
      } catch {
        // ignore
      }
    };

    compute();
    const onResize = () => compute();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open]);

  // close dropdown when clicking outside it or pressing Escape
  useEffect(() => {
    if (!open) return;
    const onPointer = (ev: PointerEvent) => {
      const target = ev.target as Node | null;
      if (
        dropdownRef.current?.contains(target as Node) ||
        filterBarRef.current?.contains(target as Node) ||
        toggleRef.current?.contains(target as Node)
      ) {
        // click was inside dropdown or the filter bar/toggle, keep open
        return;
      }
      setOpen(false);
    };

    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <Container>
      <PlayCard ref={playCardRef}>
        <TopBar>
          <LogoSlot>
            {/* logo SVG (transparent background) */}
            <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
              <DrinkWithIreneLogo />
            </div>
          </LogoSlot>

          <FilterBar ref={filterBarRef} style={{display: 'flex', alignItems: 'center' }}>
           <FilterHeader>
             <HeaderLeft>
               <FilterTitle style={{ fontSize: 18 }} />
               <ColorPills>
                 {selectedCategories.map((c, i) => (
                   <Pill key={i} color={c.color} />
                 ))}
               </ColorPills>
             </HeaderLeft>

             <ToggleButton
               ref={toggleRef}
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
           </FilterHeader>

          {/* Dropdown removed from here so it won't be clipped */}
          </FilterBar>
        </TopBar>

        {/* Dropdown is now positioned relative to PlayCard (which is position: relative)
            top is set dynamically (inline style) so it sits below the FilterBar and never covers it.
        */}
        <Dropdown
          open={open}
          aria-hidden={!open}
          ref={dropdownRef}
          style={{ top: dropdownTop }}
        >
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

        <DeckArea>
          <div
            style={{
              position: "relative",
              width: "100%",
              display: "flex",
              alignItems: "stretch",
              justifyContent: "center",
              height: '100%',
              touchAction: "none"
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onTouchMove={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div
              ref={cardRef}
              style={{ 
                touchAction: "none", 
                width: '100%',
                height: '100%',
                position: 'relative',
                ...transformStyle 
              }}
            >
              <CardPlaceholderOuter color={activeCategory.color}>
                <CardInner>
                  <div style={{ width: "100%" }}>
                    {activeCard ? (
                      <>
                        <div style={{ fontSize: "clamp(18px, 5.5vw, 26px)", lineHeight: 1.3, whiteSpace: "normal" }}>
                          {activeCard.description}
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontWeight: 700, marginBottom: 8, fontSize: "20px", textAlign: "center" }}>
                          No cards
                        </div>
                        <div style={{ fontSize: 14, textAlign: "center" }}>
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
