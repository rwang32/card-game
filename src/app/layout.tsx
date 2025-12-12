"use client";

import React from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./styles/globals.css";
import { GlobalStyle } from "@/styles/globalStyles";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const RootLayout: React.FC<Readonly<{ children: React.ReactNode }>> = ({
  children,
}) => {
  return (
    <html lang="en">
      <head>
        <title>Drink with Irene</title>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GlobalStyle />
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
