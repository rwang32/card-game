"use client";

import React from "react";
import GameUI from "./game/GameUI";
import styled from "styled-components";

const Shell = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
`;

const Inner = styled.main`
  width: 100%;
  max-width: 720px;
`;

const Home: React.FC = () => {
  return (
    <Shell>
      <Inner>
        <GameUI />
      </Inner>
    </Shell>
  );
};

export default Home;
