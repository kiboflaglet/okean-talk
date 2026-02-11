import { z } from "zod";

export const roomSchema = z.object({
  topic: z.string().min(0),
  languages: z
    .array(z.string().min(1).max(3))
    .min(1, "Pick at least one language").max(3),
  maxParticipants: z.coerce.number().int().min(0).max(20),
});

export type RoomFormValues = z.infer<typeof roomSchema>;
