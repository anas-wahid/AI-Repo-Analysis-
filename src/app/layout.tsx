import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Sidebar } from "@/components/sidebar";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "AI Testing Automation Agent",
  description:
    "AI generated repository tests with GitHub, Playwright, Browserbase, Neon, and Drizzle.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={jakarta.variable}>
      <body suppressHydrationWarning>
        <div className="app-shell">
          <Sidebar />
          <main className="main-panel">{children}</main>
        </div>
      </body>
    </html>
  );
}