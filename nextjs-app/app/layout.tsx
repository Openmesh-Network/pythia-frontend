import "@/app/global.css";

import { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { siteConfig } from "@/config/site";
import { Header } from "@/components/header";
import { cn } from "@/lib/utils";

const inter = localFont({
  src: "./InterVariable.ttf",
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html>
        <head />
        <body
          className={cn("h-screen antialiased flex flex-col", inter.className)}
        >
          <Header />
          {children}
        </body>
      </html>
    </>
  );
}
