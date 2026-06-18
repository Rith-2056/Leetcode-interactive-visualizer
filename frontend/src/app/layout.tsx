import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "AlgoVision — Watch your algorithms run",
  description:
    "Paste Python, provide inputs, and watch your algorithm execute one line at a time.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
