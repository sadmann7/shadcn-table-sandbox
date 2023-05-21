import "@/styles/globals.css"
import type { Metadata } from "next"

import { fontMono, fontSans } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Shadcn Table - Unstyled Table",
  description: "Shadcn table with unstyeld table package.",
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html lang="en" suppressHydrationWarning className="bg-background">
        <head />
        <body
          className={cn(
            "font-sans antialiased",
            fontSans.variable,
            fontMono.variable
          )}
        >
          {children}
          <Toaster />
        </body>
      </html>
    </>
  )
}
