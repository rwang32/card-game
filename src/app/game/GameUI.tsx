"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import {
  PageWrapper,
  Card,
  Section,
  Title,
  Subtitle,
  PlayersList,
  Row,
  TextInput,
  IconButton,
  Center,
  PrimaryButton,
  SecondarySection,
  SecondaryButton,
  Note,
} from "../styles/GameUIStyles";

const STORAGE_KEY = "players";
const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

const GameUI: React.FC = () => {
  const router = useRouter();
  const [players, setPlayers] = useState<string[]>(["", ""]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    router.replace("/play");
  }, [router]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);

        if (Array.isArray(parsed)) {
          const arr = parsed as string[];
          setTimeout(() => setPlayers(arr.length >= 2 ? arr : ["", ""]), 0);
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ players: arr, savedAt: Date.now() })
          );
        } else if (parsed && typeof parsed === "object") {
          const savedAt =
            typeof parsed.savedAt === "number" ? parsed.savedAt : 0;
          if (Date.now() - savedAt > EXPIRY_MS) {
            localStorage.removeItem(STORAGE_KEY);
          } else if (Array.isArray(parsed.players)) {
            const arr = parsed.players as string[];
            setTimeout(() => setPlayers(arr.length >= 2 ? arr : ["", ""]), 0);
          }
        }
      }
    } catch {
    }
    setTimeout(() => setHydrated(true), 0);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ players, savedAt: Date.now() })
      );
    } catch {
      // ignore storage errors
    }
  }, [players, hydrated]);

  const setPlayerName = (index: number, value: string) => {
    setPlayers((prev) => prev.map((p, i) => (i === index ? value : p)));
  };

  const addPlayer = () => {
    setPlayers((prev) => [...prev, ""]);
  };

  const removePlayer = (index: number) => {
    if (players.length <= 2) return; // don't remove below 2 inputs
    setPlayers((prev) => prev.filter((_, i) => i !== index));
  };

  const filledCount = players.filter((p) => p.trim().length > 0).length;
  const canStart = filledCount >= 2;

  const startGame = () => {
    if (!canStart) return;
    // players already persisted via effect
    router.push("/play");
  };

  const startWithoutPlayers = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    router.push("/play");
  };

  void PageWrapper;
  void Card;
  void Section;
  void Title;
  void Subtitle;
  void PlayersList;
  void Row;
  void TextInput;
  void IconButton;
  void Center;
  void PrimaryButton;
  void SecondarySection;
  void SecondaryButton;
  void Note;

  void setPlayerName;
  void addPlayer;
  void removePlayer;
  void startGame;
  void startWithoutPlayers;
  void styled;

  return null;
};

export default GameUI;
