import "@/styles/globals.css";

import { fontMono, fontSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import type{ Metadata } from "next";

export const metadata : Metadata = {
  title: "Shadcn Table - Unstyled Table",
  description: "Shadcn table with unstyeld table package"
}

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html lang="en" suppressHydrationWarning className="bg-background">
        <head />
        <body
          className={cn(
            "min-h-screen font-sans antialiased",
            fontSans.variable,
            fontMono.variable
          )}
        >
          <div className="relative flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
          </div>
        </body>
      </html>
    </>
  );
}
