import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function getApiBaseUrl() {
  return import.meta.env.VITE_API_URL;
} 
export function getPhoneNumber() {
  return import.meta.env.VITE_PHONE_NUMBER || '';
} 


