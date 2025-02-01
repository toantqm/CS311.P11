import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";

export const metadata: Metadata = {
  title: "Demo",
  applicationName: "Demo",
  description: "",
  keywords: [],
};

export default function LocaleLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  return (
    <html lang={locale} className="dark:[color-scheme:dark]">
      <body>{children}</body>
    </html>
  );
}
