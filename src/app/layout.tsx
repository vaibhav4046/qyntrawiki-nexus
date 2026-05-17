import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "QyntraWiki — Personal Wikipedia powered by HydraDB",
  description:
    "Your own Wikipedia, built from your life. Connect files, notes, links, exports, and cloud knowledge. QyntraWiki compiles them into a cited, searchable, HydraDB-powered personal wiki.",
  keywords: [
    "personalized wiki", "knowledge base", "HydraDB", "QyntraWiki",
    "connectors", "notion", "google drive", "linkedin", "instagram", "graph database",
  ],
  openGraph: {
    title: "QyntraWiki Nexus — Personal Wikipedia powered by HydraDB",
    description: "Build your own Wikipedia from local files, cloud docs, and daily knowledge. Cited, searchable, HydraDB-powered.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-black text-white">
        {children}
      </body>
    </html>
  );
}
