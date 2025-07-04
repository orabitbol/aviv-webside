import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL || '';
} 