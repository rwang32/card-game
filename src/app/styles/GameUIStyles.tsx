import styled from "styled-components";

export const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

export const Card = styled.div`
  width: 100%;
  max-width: 420px;
  border-radius: 18px;
  background: var(--card);
  box-shadow: 0 10px 30px rgba(2, 6, 23, 0.6);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.03);
`;

export const Section = styled.div`
  padding: 24px;
`;

export const Title = styled.h1`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  text-align: center;
  color: var(--foreground);
`;

export const Subtitle = styled.p`
  margin: 6px 0 0;
  text-align: center;
  font-size: 13px;
  color: var(--muted);
`;

export const PlayersList = styled.div`
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const Row = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

export const TextInput = styled.input`
  flex: 1;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.04);
  background: transparent;
  padding: 10px 12px;
  color: var(--foreground);
  font-size: 14px;
  outline: none;

  ::placeholder {
    color: var(--muted);
  }
`;

export const IconButton = styled.button<{ faded?: boolean }>`
  height: 36px;
  width: 36px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  font-size: 16px;
  ${(p: { faded?: boolean }) =>
    p.faded
      ? `background: transparent; color: var(--muted); opacity: 0.35; cursor: default;`
      : `background: #b91c1c; color: white;`}
`;

export const Center = styled.div`
  display: flex;
  justify-content: center;
`;

export const PrimaryButton = styled.button<{ disabled?: boolean }>`
  width: 100%;
  border-radius: 12px;
  padding: 12px 16px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  background: ${(p: { disabled?: boolean }) =>
    p.disabled ? "rgba(16,185,129,0.12)" : "var(--accent)"};
  color: ${(p: { disabled?: boolean }) =>
    p.disabled ? "var(--muted)" : "white"};
`;

export const SecondarySection = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.03);
  background: rgba(255, 255, 255, 0.01);
  padding: 16px 20px;
`;

export const SecondaryButton = styled.button`
  width: 100%;
  border-radius: 12px;
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.04);
  background: transparent;
  color: var(--foreground);
  cursor: pointer;
`;

export const Note = styled.p`
  margin-top: 10px;
  font-size: 12px;
  color: var(--muted);
  text-align: center;
`;
