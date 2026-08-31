import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ballon d'Or Vote",
  description: "A private live vote to decide the boys' Ballon d'Or winner.",
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
