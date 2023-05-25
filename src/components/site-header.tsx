"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"

const navItems = [
  {
    title: "Server Controlled",
    href: "/",
  },
  {
    title: "Client Controlled",
    href: "/client-controlled",
  },
]

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 w-full bg-background">
      <div className="container flex h-16 items-center">
        <nav className="hidden items-center space-x-6 text-sm font-semibold sm:flex">
          {navItems.map(
            (navItem, i) =>
              navItem.href && (
                <Link
                  key={i}
                  href={navItem.href}
                  className={cn(
                    "flex items-center text-muted-foreground transition-colors hover:text-foreground/80",
                    pathname === navItem.href && "text-foreground"
                  )}
                >
                  {navItem.title}
                </Link>
              )
          )}
        </nav>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-9 px-0 hover:bg-transparent focus:ring-0 sm:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            sideOffset={24}
            className="max-h-[calc(100vh-10rem)] w-48 overflow-y-auto"
          >
            {navItems?.map((navItem, i) => (
              <DropdownMenuItem
                key={i}
                asChild
                className={cn(
                  "flex items-center gap-2.5",
                  pathname === navItem.href &&
                    "bg-accent text-accent-foreground"
                )}
              >
                <Link href={navItem.href}>
                  <span className="line-clamp-1">{navItem.title}</span>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
