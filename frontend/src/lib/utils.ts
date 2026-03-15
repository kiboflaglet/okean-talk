import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const sleep = async (ms: number, message?: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(message);
    }, ms);
  });
};
export const toPgArray = (arr: string[]) =>
  `{${arr.map((v) => `"${v}"`).join(",")}}`;

export const NameToInitials = (name: string) => {
  return name
    .split(" ")
    .map((w: string) => w[0])
    .join("");
};
