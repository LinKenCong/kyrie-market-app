import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import "@rainbow-me/rainbowkit/styles.css";
import { Web3Providers } from "@/components/web3/Web3Providers";
import NavBtn from "@/components/ui/NavBtn";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kyrie Market App",
  description: "Kyrie Market App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div id="modal-root" />
        <Web3Providers>
          {children}
          <NavBtn />
        </Web3Providers>
      </body>
    </html>
  );
}
