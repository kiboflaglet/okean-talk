import type { PostgrestError } from "@supabase/supabase-js";

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

export type ApiResult<T> = {
  data: T | null;
  error: Error | PostgrestError | string | null;
};

export interface RoomFilters {
  searchQuery?: string | null;
  languages?: string[];
}
