import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "For Zainab · The Little Love Pharmacy",
  description: "A little prescription of tenderness, and a promise to move at your pace.",
  robots: { index: false, follow: false },
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
