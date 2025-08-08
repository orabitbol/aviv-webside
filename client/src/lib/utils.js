import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function getApiBaseUrl() {
  // לוקאלי - תמיד השתמש בשרת המקומי
  return import.meta.env.VITE_API_BASE_URL;
} 
export function getPhoneNumber() {
  return import.meta.env.VITE_PHONE_NUMBER || '';
} 


