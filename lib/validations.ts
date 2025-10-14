import z from "zod";

export const room = z.object({
  name: z.string().optional().nullable(),
  limit: z.number().min(0)
});

export type RoomInput = z.infer<typeof room>;



export const message = z.object({
  content: z.string().min(1, "Too short"),
  user_id: z.string(),
  room_id: z.string(),
});

export type MessageInput = z.infer<typeof message>;

