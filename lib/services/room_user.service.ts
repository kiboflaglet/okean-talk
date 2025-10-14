import { supabase } from "../supabaseClient";
import { Crud, Room, Result, RoomUser } from "../types";
import { handleError, handleSupabase } from "../utils";

export class RoomUserService implements Crud<RoomUser> {
    async create(item: Omit<RoomUser, "id" | "created_at">): Promise<Result<RoomUser>> {
        try {
            const { data, error } = await supabase
                .from("room_users")
                .insert({
                    room_id: item.room_id,
                    user_id: item.user_id,
                })
                .select()
                .single();

            return handleSupabase<RoomUser>(data, error)
        } catch (err: unknown) {
            return handleError(err)
        }
    }

    async update(id: string, item: Partial<RoomUser>): Promise<Result<RoomUser>> {
        try {
            const { data, error } = await supabase
                .from("room_users")
                .update({
                    room_id: item.room_id,
                    user_id: item.user_id,
                })
                .eq("id", id)
                .select()
                .single();
            return handleSupabase<RoomUser>(data, error)
        } catch (err: unknown) {
            return handleError(err)
        }
    }

    async delete(id: string): Promise<Result<null>> {
        try {
            const { error } = await supabase.from("room_users").delete().eq("id", id);
            return handleSupabase<null>(null, error)
        } catch (err: unknown) {
            return handleError(err)
        }
    }

    async deleteByUser(id: string): Promise<Result<null>> {
        try {
            const { error } = await supabase.from("room_users").delete().eq("user_id", id);
            return handleSupabase<null>(null, error)
        } catch (err: unknown) {
            return handleError(err)
        }
    }

    async getAll(): Promise<Result<RoomUser[]>> {
        try {
            const { data, error } = await supabase
                .from("room_users")
                .select(`
                id,
                name,
                limit,
                created_at,
                room_users (
                    user_id,
                    room_id,
                    users (
                        id,
                        name,
                        picture,
                        email
                    )
                )
            `);

            return handleSupabase<RoomUser[]>(data as unknown as RoomUser[] ?? [], error)
        } catch (err: unknown) {
            return handleError(err)
        }
    }


    async getById(id: string): Promise<Result<RoomUser | null>> {
        try {
            const { data, error } = await supabase
                .from("room_users")
                .select(`
                    id,
                    name,
                    limit,
                    created_at,
                    room_users (
                    user_id,
                    room_id,
                    users (
                        id,
                        name,
                        picture,
                        email
                    )
                    )
                `)
                .eq("id", id)
                .single();

            return handleSupabase<RoomUser>(data as unknown as RoomUser, error)
        } catch (err: unknown) {
            return handleError(err)
        }
    }
}
