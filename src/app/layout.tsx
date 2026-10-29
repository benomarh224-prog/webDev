import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alex Carter — Full-Stack Developer & UI Designer",
  description:
    "Portfolio of Alex Carter, a full-stack developer crafting fast, accessible and beautiful web applications. Projects, skills, experience and contact.",
  keywords: [
    "portfolio",
    "full-stack developer",
    "web developer",
    "React",
    "Next.js",
    "TypeScript",
  ],
  authors: [{ name: "Alex Carter" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Alex Carter — Full-Stack Developer & UI Designer",
    description:
      "Fast, accessible and beautiful web applications. Explore projects, skills and experience.",
    siteName: "Alex Carter Portfolio",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
