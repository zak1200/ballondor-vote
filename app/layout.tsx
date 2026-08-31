import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vote Closed | Ballon d'Or Vote",
  description: "The Ballon d'Or vote is currently offline.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
