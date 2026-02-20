import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const toPgArray = (arr: string[]) =>
  `{${arr.map((v) => `"${v}"`).join(",")}}`;

export const sleep = async (ms: number, message?: string) => {
  // I believe i will use AI someday for this, but this is classic approach ig
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(message);
    }, ms);
  });
};
