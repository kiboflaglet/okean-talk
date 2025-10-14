import { supabase } from "../supabaseClient";
import { Crud, Room, Result } from "../types";
import { handleError, handleSupabase } from "../utils";

export class RoomService implements Crud<Room> {
    async create(item: Omit<Room, "id" | "created_at">): Promise<Result<Room>> {
        try {
            const { data, error } = await supabase
                .from("rooms")
                .insert({ name: item.name })
                .select()
                .single();

            return handleSupabase<Room>(data, error)
        } catch (err: unknown) {
            return handleError(err)
        }
    }

    async update(id: string, item: Partial<Room>): Promise<Result<Room>> {
        try {
            const { data, error } = await supabase
                .from("rooms")
                .update({ name: item.name })
                .eq("id", id)
                .select()
                .single();

            return handleSupabase<Room>(data, error)
        } catch (err: unknown) {
            return handleError(err)
        }
    }

    async delete(id: string): Promise<Result<null>> {
        try {
            const { error } = await supabase.from("rooms").delete().eq("id", id);
            return handleSupabase<null>(null, error)
        } catch (err: unknown) {
            return handleError(err)
        }
    }
    async getAll(): Promise<Result<Room[]>> {
        try {
            const { data, error } = await supabase
                .from("rooms")
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

            return handleSupabase<Room[]>(data as unknown as Room[] ?? [], error)
        } catch (err: unknown) {
            return handleError(err)
        }
    }


    async getById(id: string): Promise<Result<Room | null>> {
        try {
            const { data, error } = await supabase
                .from("rooms")
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

            return handleSupabase<Room>(data as unknown as Room, error)
        } catch (err: unknown) {
            return handleError(err)
        }
    }
}
