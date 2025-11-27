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
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);

        // Legacy format: stored plain array
        if (Array.isArray(parsed)) {
          const arr = parsed as string[];
          // treat legacy as fresh
          setPlayers(arr.length >= 2 ? arr : ["", ""]);
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
            setPlayers(arr.length >= 2 ? arr : ["", ""]);
          }
        }
      }
    } catch (e) {
      // ignore parse errors
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ players, savedAt: Date.now() })
      );
    } catch (e) {
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
    } catch (e) {}
    router.push("/play");
  };

  return (
    <PageWrapper>
      <Card>
        <Section>
          <Title>Add players</Title>
          <Subtitle>Add at least 2 players</Subtitle>

          <PlayersList>
            {players.map((p, i) => (
              <Row key={i}>
                <TextInput
                  value={p}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPlayerName(i, e.target.value)
                  }
                  placeholder={`Player ${i + 1}`}
                />
                <IconButton
                  onClick={() => removePlayer(i)}
                  faded={players.length <= 2}
                  aria-label={
                    players.length <= 2 ? "cannot remove" : "remove player"
                  }
                >
                  ×
                </IconButton>
              </Row>
            ))}

            <Center>
              <IconButton
                onClick={addPlayer}
                faded={false}
                style={{ background: "var(--accent)" }}
              >
                +
              </IconButton>
            </Center>
          </PlayersList>

          <div style={{ marginTop: 18 }}>
            <PrimaryButton onClick={startGame} disabled={!canStart}>
              Start game
            </PrimaryButton>
          </div>
        </Section>

        <SecondarySection>
          <SecondaryButton onClick={startWithoutPlayers}>
            Start without adding players
          </SecondaryButton>
          <Note>Some cards will be unavailable without player names</Note>
        </SecondarySection>
      </Card>
    </PageWrapper>
  );
};

export default GameUI;
