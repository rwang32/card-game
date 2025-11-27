import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  :root{
    --background: #0a0a0a;
    --foreground: #ededed;
    --muted: #9ca3af;
    --card: #0f1720;
    --accent: #10b981;
  }

  @media (prefers-color-scheme: light) {
    :root{
      --background: #ffffff;
      --foreground: #171717;
      --muted: #6b7280;
      --card: #ffffff;
      --accent: #10b981;
    }
  }

  *,*::before,*::after{box-sizing:border-box}
  html,body,#__next{height:100%}
  body{
    margin:0;
    background:var(--background);
    color:var(--foreground);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
    -webkit-font-smoothing:antialiased;
    -moz-osx-font-smoothing:grayscale;
  }

  input,button,textarea{font-family:inherit}
`;
