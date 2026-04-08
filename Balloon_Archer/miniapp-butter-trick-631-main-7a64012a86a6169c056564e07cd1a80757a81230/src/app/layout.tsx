import type { Metadata } from "next";
import localFont from "next/font/local";
import '@coinbase/onchainkit/styles.css';
import "./globals.css";
import { ResponseLogger } from "@/components/response-logger";
import { cookies } from "next/headers";
import { ReadyNotifier } from "@/components/ready-notifier";
import { Providers } from "./providers";
import FarcasterWrapper from "@/components/FarcasterWrapper";

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
        <html lang="en">
          <head>
            {requestId && <meta name="x-request-id" content={requestId} />}
          </head>
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            {/* Do not remove this component, we use it to notify the parent that the mini-app is ready */}
            <ReadyNotifier />
            <Providers>
      <FarcasterWrapper>
        {children}
      </FarcasterWrapper>
      </Providers>
            <ResponseLogger />
          </body>
        </html>
      );
}

export const metadata: Metadata = {
        title: "Balloon Archer",
        description: "Engage in a top-down physics game where you control a bow and arrow to pop balloons. Drag to adjust arrow intensity and angle, using touch controls for precise shooting.",
        other: { 
          "base:app_id": "69510fdd4d3a403912ed8394",
          "fc:frame": JSON.stringify({
            "version": "next",
            "imageUrl": "https://files.catbox.moe/ugigc7.jpeg",
            "button": {
              "title": "Open with Ohara",
              "action": {
                "type": "launch_frame",
                "name": "Balloon Archer",
                "url": "https://butter-trick-631.app.ohara.ai",
                "splashImageUrl": "https://usdozf7pplhxfvrl.public.blob.vercel-storage.com/farcaster/splash_images/splash_image1.svg",
                "splashBackgroundColor": "#ffffff"
              }
            }
          }
        ) 
        }
    };
