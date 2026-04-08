import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ResponseLogger } from "@/components/response-logger";
import { cookies } from "next/headers";
import { ReadyNotifier } from "@/components/ready-notifier";
import { Providers } from "./providers";
import FarcasterWrapper from "@/components/FarcasterWrapper";
import { Toaster } from "@/components/ui/sonner";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const requestId = cookieStore.get("x-request-id")?.value;

  return (
    <html lang="en" className="dark">
      <head>
        {requestId && <meta name="x-request-id" content={requestId} />}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}>
        <ReadyNotifier />
        <Providers>
          <FarcasterWrapper>
            {children}
          </FarcasterWrapper>
        </Providers>
        <Toaster position="top-center" richColors />
        <ResponseLogger />
      </body>
    </html>
  );
}

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Balloon Archer | Pop, Play & Earn on Base",
  description: "A fun physics-based archery game on Base blockchain. Pop balloons, earn $BALLOON tokens, and swap directly in-app. Touch controls, combos, and rewards await!",
  keywords: ["blockchain game", "Base", "balloon", "archery", "web3 game", "earn tokens"],
  openGraph: {
    title: "Balloon Archer | Pop, Play & Earn",
    description: "Pop balloons, build combos, and earn $BALLOON tokens on Base blockchain!",
    type: "website",
  },
  other: { 
    "base:app_id": "69510fdd4d3a403912ed8394",
    "fc:frame": JSON.stringify({
      "version": "next",
      "imageUrl": "https://files.catbox.moe/ugigc7.jpeg",
      "button": {
        "title": "Play Balloon Archer",
        "action": {
          "type": "launch_frame",
          "name": "Balloon Archer",
          "url": "https://butter-trick-631.app.ohara.ai",
          "splashImageUrl": "https://usdozf7pplhxfvrl.public.blob.vercel-storage.com/farcaster/splash_images/splash_image1.svg",
          "splashBackgroundColor": "#0f172a"
        }
      }
    }) 
  }
};
