import { z } from "zod";

export const messageCreateSchema = z.object({
  content: z.string().min(1),
  roomId: z.string(),
  userId: z.string(),
  tempId: z.string()
});

export type TmessageCreate = z.infer<typeof messageCreateSchema>
