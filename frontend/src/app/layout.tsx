import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "AlgoVision — Watch your algorithms run",
  description:
    "Paste Python, provide inputs, and watch your algorithm execute one line at a time.",
};

// Set the theme class before first paint to avoid a flash of the wrong theme.
const themeScript = `(function(){try{var t=localStorage.getItem('algovision-theme');if(t!=='light')t='dark';document.documentElement.classList.add(t);}catch(e){document.documentElement.classList.add('dark');}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
