import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// For merging tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// For formatting the price column
export function formatPrice(
  price: number,
  currency: "USD" | "EUR" | "GBP" | "JPY" | "RUB" | "CNY" | "BDT" = "USD"
) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(price);
}
