import { supabase } from "../supabaseClient";
import { Crud, Result, User } from "../types";
import { handleError, handleSupabase } from "../utils";

export class UserService implements Crud<User> {
    async create(item: Omit<User, "id" | "created_at">): Promise<Result<User>> {
        try {
            const { data, error } = await supabase
                .from("users")
                .insert(item)
                .select(`
                      id,
                    name,
                    email,
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
                .single();

            return handleSupabase<User>(data, error)
        } catch (err: unknown) {
            return handleError(err)
        }
    }

    async update(id: string, item: Partial<User>): Promise<Result<User>> {
        try {
            const { data, error } = await supabase
                .from("users")
                .update({ item })
                .eq("id", id)
                .select()
                .single();

            return handleSupabase<User>(data, error)
        } catch (err: unknown) {
            return handleError(err)
        }
    }

    async updateByAuth(auth_id: string, item: Partial<User>): Promise<Result<User>> {
        try {
            const { data, error } = await supabase
                .from("users")
                .update({
                    name: item.name,
                    email: item.email,
                    picture: item.picture
                })
                .eq("auth_id", auth_id)
                .select()
                .single();

            return handleSupabase<User>(data, error)
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
    async getAll(): Promise<Result<User[]>> {
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

            return handleSupabase<User[]>(data as unknown as User[] ?? [], error)
        } catch (err: unknown) {
            return handleError(err)
        }
    }


    async getById(id: string): Promise<Result<User | null>> {
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

            return handleSupabase<User>(data as unknown as User, error)
        } catch (err: unknown) {
            return handleError(err)
        }
    }


    async getByAuthId(auth_id: string): Promise<Result<User | null>> {
        try {
            const { data, error } = await supabase
                .from("users")
                .select(`
                    id,
                    name,
                    email,
                    picture,
                    auth_id
                `)
                .eq("auth_id", auth_id)
                .single();

            return handleSupabase<User>(data as unknown as User, error)
        } catch (err: unknown) {
            return handleError(err)
        }

    }
}
