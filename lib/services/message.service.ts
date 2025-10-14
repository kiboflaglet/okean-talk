import { supabase } from "../supabaseClient";
import { Crud, Message, Result } from "../types";
import { handleError, handleSupabase } from "../utils";

export class MessageService implements Crud<Message> {
    async create(item: Omit<Message, "id" | "created_at">): Promise<Result<Message>> {
        try {
            const { data, error } = await supabase
                .from("messages")
                .insert({
                    content: item.content,
                    room_id: item.room_id,
                    user_id: item.user_id,
                })
                .select()
                .single();

            return handleSupabase<Message>(data, error)
        } catch (err: unknown) {
            return handleError(err)
        }
    }

    async update(id: string, item: Partial<Message>): Promise<Result<Message>> {
        try {
            const { data, error } = await supabase
                .from("messages")
                .update({
                    content: item.content,
                    room_id: item.room_id,
                    user_id: item.user_id,
                })
                .eq("id", id)
                .select()
                .single();


            return handleSupabase<Message>(data, error)
        } catch (err: unknown) {
            return handleError(err)
        }
    }

    async delete(id: string): Promise<Result<null>> {
        try {
            const { error } = await supabase.from("messages").delete().eq("id", id);

            return handleSupabase<null>(null, error)
        } catch (err: unknown) {
            return handleError(err)
        }
    }

    async getAll(): Promise<Result<Message[]>> {
        try {
            const { data, error } = await supabase
                .from("messages")
                .select(`
                id,
                room_id,
                user_id,
                content,
            `);

            return handleSupabase<Message[]>(data as unknown as Message[] ?? [], error)
        } catch (err: unknown) {
            return handleError(err)
        }
    }

    async getAllByRoom(room_id: string): Promise<Result<Message[]>> {
        try {
            const { data, error } = await supabase
                .from("messages")
                .select(`
                    id,
                    content,
                    room_id,
                    user_id,
                    created_at,
                    users (
                        name,
                        auth_id
                     )
                    `)
                .eq("room_id", room_id)

            return handleSupabase<Message[]>(data as unknown as Message[] ?? [], error)
        } catch (err: unknown) {
            return handleError(err)
        }
    }

    async getById(id: string): Promise<Result<Message | null>> {
        try {
            const { data, error } = await supabase
                .from("rooms")
                .select(`
                     id,
                     content,
                     room_id,
                     user_id
                    `)
                .eq("id", id)
                .single();

            return handleSupabase<Message>(data as unknown as Message, error)
        } catch (err: unknown) {
            return handleError(err)
        }
    }
}
