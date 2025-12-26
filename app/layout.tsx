import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Community Radio",
  description: "Listen to independent and community radio stations.",
  openGraph: {
    title: "Community Radio",
    description: "Listen to independent and community radio stations",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-stone-50 text-stone-900`}>
        {children}
      </body>
    </html>
  );
}
