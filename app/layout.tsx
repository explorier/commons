import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AudioProvider } from "@/lib/AudioContext";
import GlobalAudioPlayer from "@/components/GlobalAudioPlayer";

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
      <body className={`${inter.className} antialiased`}>
        <AudioProvider>
          {children}
          <GlobalAudioPlayer />
        </AudioProvider>
      </body>
    </html>
  );
}
