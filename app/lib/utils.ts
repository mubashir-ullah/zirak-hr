import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines multiple class names into a single string, merging Tailwind classes efficiently.
 * Uses clsx for conditional classes and tailwind-merge to handle conflicting Tailwind classes.
 * 
 * @param inputs - Class values to be combined
 * @returns A string of combined and merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
