import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import type { IRoom, RoomFilters } from "../interfaces";
import { toPgArray } from "../lib/utils";

export const useRooms = (filters?: RoomFilters) => {
  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchRooms = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("rooms")
      .select(`* , owner:users!rooms_ownerId_fkey(*)`)
      .order("created_at", { ascending: false });
    if (!!filters?.languages?.length) {
      query = query.filter("languages", "cs", toPgArray(filters?.languages));
    }

   if (filters?.searchQuery) {
  query = query.ilike("topic", `%${filters.searchQuery}%`)
} 

    const { data, error } = await query;
    if (error) setError(error.message);
    else setRooms(data || []);
    setLoading(false);
  }, [filters]);
  const addRoom = useCallback(async (room: Partial<IRoom>) => {
    const { data, error } = await supabase
      .from("rooms")
      .insert([room])
      .select()
      .single();
    if (error) setError(error.message);
    else setRooms((prev) => [...prev, data]);
  }, []);
  const updateRoom = useCallback(
    async (id: string, updates: Partial<IRoom>) => {
      const { data, error } = await supabase
        .from("rooms")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) setError(error.message);
      else setRooms((prev) => prev.map((r) => (r.id === id ? data : r)));
    },
    []
  );
  const deleteRoom = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from("rooms")
      .delete()
      .eq("id", id)
      .select()
      .single();
    if (error) setError(error.message);
    else setRooms((prev) => prev.filter((r) => r.id !== id));
  }, []);
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);
  useEffect(() => {
    const roomsChannel = supabase
      .channel("on_rooms_change")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rooms" },
        () => {
          fetchRooms();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(roomsChannel);
    };
  }, []);
  return { rooms, loading, error, fetchRooms, addRoom, updateRoom, deleteRoom };
};
