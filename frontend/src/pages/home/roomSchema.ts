import { z } from "zod";

export const roomSchema = z.object({
  topic: z
    .string({ message: "Topic is required" })
    .min(0, { message: "Topic cannot be empty" })
    .max(256, { message: "Topic must be under 256 characters" }),

  languages: z
    .array(z.string())
    .min(1, { message: "Pick at least one language" })
    .max(3, { message: "You can select up to 3 languages" }),

  maxParticipants: z.coerce
    .number({ message: "Participant limit is required" })
    .int({ message: "Must be a whole number" })
    .min(1, { message: "At least 1 participants needed" })
    .max(6, { message: "Maximum 6 participants allowed" }),
});

export const roomParticipantCreateSchema = z.object({
  roomid: z.string().min(1, { message: "Room ID is required" }),
  participantid: z.string().min(1, { message: "Participant ID is required" }),
});

export type roomParticipantCreate = z.infer<typeof roomParticipantCreateSchema>;
export type RoomFormValues = z.infer<typeof roomSchema>;