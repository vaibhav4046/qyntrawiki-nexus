import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "QyntraWiki — Your Autonomous Knowledge Agent",
  description:
    "QyntraWiki connects to Notion, Drive, LinkedIn, Instagram, GitHub, Slack, and more — then compiles everything into a living, self-updating knowledge base.",
  keywords: [
    "personalized wiki",
    "knowledge base",
    "graph database",
    "HydraDB",
    "QyntraWiki",
    "connectors",
    "notion",
    "google drive",
    "linkedin",
    "instagram",
  ],
  openGraph: {
    title: "QyntraWiki",
    description:
      "Your Autonomous Knowledge Agent. Connect everything. Know everything.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
