import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Contrarian Club Live",
  description: "A Menti-style live audience room for debate events.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
