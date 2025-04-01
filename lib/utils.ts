import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function validatePhoneNumber(str: string): boolean {
  const pattern = /^\d{10}$/;
  return pattern.test(str.trim());
}

export function hasNumbers(t: string) {
  const regex = /\d/g;
  return regex.test(t);
}

export function formatPhoneNumber(input: string): string {
  let value = input.replace(/\D/g, ""); // Remove non-numeric characters

  if (value.length > 10) {
    value = value.slice(0, 10); // Limit to 10 digits
  }

  if (value.length > 6) {
    return `${value.slice(0, 3)}-${value.slice(3, 6)}-${value.slice(6)}`;
  } else if (value.length > 3) {
    return `${value.slice(0, 3)}-${value.slice(3)}`;
  }

  return value;
}
