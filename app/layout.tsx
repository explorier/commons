import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AudioProvider } from "@/lib/AudioContext";
import { UserPreferencesProvider } from "@/lib/UserPreferencesContext";
import GlobalAudioPlayer from "@/components/GlobalAudioPlayer";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Commons - Community Radio",
  description: "Listen to independent and community radio stations from across the country.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Commons",
  },
  openGraph: {
    title: "Commons - Community Radio",
    description: "Listen to independent and community radio stations from across the country.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d9488",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <UserPreferencesProvider>
          <AudioProvider>
            {children}
            <GlobalAudioPlayer />
          </AudioProvider>
        </UserPreferencesProvider>
      </body>
    </html>
  );
}
