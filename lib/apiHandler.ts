import { PostgrestError } from "@supabase/supabase-js";
import { ApiResult } from "./types";

// to fetch data from Supabase
export const fetchSupabase = async <T>(queryFunction: () => Promise<{
    data: T | null
    error: Error | PostgrestError | null
}>): Promise<ApiResult<T>> => {
    try {
        const {data, error} = await queryFunction()
        return { data, error}
    } catch (err: unknown) {
        const customError = err instanceof Error ? err : new Error(JSON.stringify(err));
        return { data: null, error: customError };
    }
}