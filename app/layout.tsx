import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AudioProvider } from "@/lib/AudioContext";
import { UserPreferencesProvider } from "@/lib/UserPreferencesContext";
import { ThemeProvider } from "@/lib/ThemeContext";
import GlobalAudioPlayer from "@/components/GlobalAudioPlayer";
import WhatsOnNow from "@/components/WhatsOnNow";
import { Analytics } from "@vercel/analytics/react";
import getStations from "@/lib/api";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Commons - Community Radio",
  description: "Listen to independent and community radio stations.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Commons",
  },
  openGraph: {
    title: "Commons - Community Radio",
    description: "Listen to independent and community radio stations.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d9488",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const stations = await getStations();
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          <UserPreferencesProvider>
            <AudioProvider stations={stations}>
              {children}
              <GlobalAudioPlayer />
              <WhatsOnNow />
            </AudioProvider>
          </UserPreferencesProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
