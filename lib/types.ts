import { PostgrestError } from "@supabase/supabase-js";

export type Result<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type ApiResult<T> = {
  data: T | null;
  error: Error | PostgrestError | null;
}

export interface Crud<T, ID = string> {
  create(item: T): Promise<Result<T>>;
  update(id: ID, item: Partial<T>): Promise<Result<T>>;
  delete(id: ID): Promise<Result<null>>;
  getAll(): Promise<Result<T[]>>;
  getById(id: ID): Promise<Result<T | null>>;
}

export interface Room {
  id: string;
  name?: string | null;
  created_at: string;
  limit: number;
  room_users?: RoomUser[];
  owner_id: string;
  owner?: User
}

export interface RoomUser {
  created_at: string;
  user_id: string;
  room_id: string;
  role: "admin" | "manager" | "member"
  users?: User;
}

export interface User {
  id: string;
  name: string;
  picture?: string | null;
  email: string;
  created_at: string;
  auth_id?: string;
}


export interface Message {
  id: string;
  room_id: string;
  user_id: string;
  content?: string;
  created_at: string;
  users?: User
}