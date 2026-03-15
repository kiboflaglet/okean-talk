import { toast } from "sonner";

export function handleError(
  userMessage: string,
  devMessage: string,
  error?: unknown
) {
  if (import.meta.env.MODE === "development") {
    console.error(`[DEV] ${devMessage}`, error ?? "");
  } else {
    toast.error(userMessage, {
      description: "Please try again or contact support if the issue persists.",
      duration: 5000,
    });
  }
}
