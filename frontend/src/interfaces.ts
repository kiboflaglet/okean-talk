import type { PostgrestError } from "@supabase/supabase-js";
import type { MessageStatus } from "./types";

export interface IUser {
  id: string;
  fullName: string;
  avatar_url?: string;
}

export interface IRoom {
  id: string;
  topic: string;
  languages: string[];
  users?: { participant: IUser }[];
  ownerId: string;
  owner?: IUser;
  createdAt: string;
  maxParticipants: number;
}

export interface IMessage {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  createdAt: string;
  user?: IUser;
  tempId: string;
  status: MessageStatus
}

export type ApiResult<T> = {
  data: T | null;
  error: Error | PostgrestError | string | null;
};

export interface RoomFilters {
  searchQuery?: string | null;
  languages?: string[];
}
