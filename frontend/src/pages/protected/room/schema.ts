import { z } from "zod";

export const messageCreateSchema = z.object({
  content: z.string().min(1),
  roomId: z.uuid(),
  userId: z.uuid(),
  tempId: z.uuid()
});

export type TmessageCreate = z.infer<typeof messageCreateSchema>
