import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function handleError(err: unknown): { success: false; error: string } {
    if (err instanceof Error) {
        return { success: false, error: err.message };
    }
    return { success: false, error: "Unknown error" };
}

export function handleSupabase<T> (
  data: T | undefined | null,
  error: {message: string} | null,
) {
  if (error) {
    return {success: false, error: error.message}
  }
  
  return {success: true, data: data as T }
}