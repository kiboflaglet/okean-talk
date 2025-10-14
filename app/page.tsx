"use client";
import { Icons } from "@/components/icons";
import { useDeleteDialog } from "@/components/providers/delete-dialog-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { Input } from "@/components/ui/input";
import { useUser } from "@/hooks/use-user";
import { fetchSupabase } from "@/lib/apiHandler";
import { createClient } from "@/lib/supabase/client";
import { Room } from "@/lib/types";
import {
  LogOut
} from 'lucide-react';
import { ChangeEvent, ChangeEventHandler, useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import SignInPage from "../components/sign-in";
import RoomCard from "./home-components/room-card";
import { RoomDialogCreate } from "./home-components/room-dialog-create";

export default function HomePage() {

  const supabase = createClient()
  const { loading, error, user } = useUser()

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }, [])

  const { confirmDeletion } = useDeleteDialog()


  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const getSelectedRoom = (id: string) => {
    const room = rooms?.find(item => item.id === id)
    setSelectedRoom(room || null)
  }

  // ✅ 1. ALL ROOMS (excluding user's own if logged in)
  const [rooms, setRooms] = useState<Room[] | null>([]);
  const [isRoomsPending, startRoomsPending] = useTransition();
  const [page, setPage] = useState(0); // page 0 = first 10 rooms
  const pageSize = 10;
  const [hasMore, setHasMore] = useState(true); // flag to know if more rooms exist

  const getAllRooms = useCallback(async (page: number, search?: string) => {
    startRoomsPending(() => {
      (async () => {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        const { data, error } = await fetchSupabase<Room[]>(async () => {
          let query = supabase
            .from("rooms")
            .select(`
              id,
              name,
              limit,
              owner_id,
              created_at,
              room_users (
                room_id,
                users (
                  id, 
                  name,
                  picture,
                  email
                )
              )
          `)
            .order("created_at", { ascending: false })
            .range(from, to);

          if (user?.id) query = query.neq("owner_id", user.id);
          if (search) query = query.ilike("name", `%${search}%`);

          const response = await query;
          return { data: response.data as Room[] | null, error: response.error };
        });

        if (error) return toast("Error", { description: error.message });

        if (data) {
          setRooms(prev => (page === 0 ? data ?? [] : [...(prev ?? []), ...(data ?? [])]));
          setHasMore(data.length === pageSize);
        }
      })();
    });
  }, [user?.id]);



  // ✅ 2. MY ROOMS (only user’s own; no user = empty)
  const [myRooms, setMyRooms] = useState<Room[] | null>([]);
  const [isMyRoomsPending, startMyRoomsPending] = useTransition();

  const getAllMyRooms = useCallback(async () => {
    if (!user?.id) {
      setMyRooms([]);
      return;
    }

    startMyRoomsPending(async () => {
      const { data, error } = await fetchSupabase<Room[]>(async () => {
        const response = await supabase
          .from("rooms")
          .select(`
          id,
          name,
          limit,
          owner_id,
          created_at,
          owner:users!rooms_owner_id_fkey (  
            id,
            name,
            picture,
            email
          ),
          room_users (
            room_id,
            users (
              id, 
              name,
              picture,
              email
            )
          )
        `)
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false });

        return {
          data: response.data as Room[] | null,
          error: response.error,
        };
      });

      setMyRooms(data);

      if (error) {
        toast("Error occurred", {
          description: `${error.message}`,
        });
      }
    });
  }, [user?.id]);


  const handleRoomDelete = useCallback((id: string) => {
    confirmDeletion(async () => {
      const { error } = await fetchSupabase<null>(async () => {
        return supabase
          .from("rooms")
          .delete()
          .eq("id", id);
      });


      if (error) {
        toast("Error occured", {
          description: `${error.message}`,
        });
      }

    })
  }, [])


  const joinRoom = async (room_id: string) => {
    window.open(`/room/${room_id}`, "_blank")
  }

  const [isEditingRoom, setIsEditingRoom] = useState<boolean>(false)

  // Search functionality
  const [searchQuery, setSearchQuery] = useState<string | null>(null)
  const handleSearchQuery = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (!!value) {
      setSearchQuery(value)
    } else {
      setSearchQuery(null)
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      if (!hasMore) return;

      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.body.offsetHeight;

      if (scrollTop + windowHeight >= docHeight - 100) {
        // near bottom
        setPage(prev => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore]);


  useEffect(() => {

    if (loading) {
      return
    }

    getAllRooms(page, searchQuery || undefined);
    getAllMyRooms();

    // subscribe to rooms table changes
    const roomsChannel = supabase
      .channel("rooms-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rooms" },
        () => {
          getAllRooms(page, searchQuery || undefined);
          getAllMyRooms();
        }
      )
      .subscribe();

    // subscribe to room_users table changes
    const roomUsersChannel = supabase
      .channel("room_users-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "room_users" },
        () => {
          getAllRooms(page, searchQuery || undefined);
          getAllMyRooms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomsChannel);
      supabase.removeChannel(roomUsersChannel);
    };
  }, [page, searchQuery, getAllRooms, getAllMyRooms, loading]);

  useEffect(() => {
    if (error) {
      toast("Error occured", {
        description: `${error.message}`,
      });
    }
  }, [error])


  return (
    <div className="p-10 max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="text-xl font-bold">🎧 Okean Talk</div>
        {!loading ? (

          !!user ? (

            <DropdownMenu >
              <DropdownMenuTrigger className="flex items-center gap-3 border-none">
                <Avatar className="size-9">
                  <AvatarImage src={user?.user_metadata?.picture || ""} alt="@shadcn" />
                  <AvatarFallback>{"LK"}</AvatarFallback>
                </Avatar>
                <div className="text-start flex flex-col">
                  <p className="text-sm font-medium">{user?.user_metadata?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mt-2 w-72">
                <DropdownMenuItem className="py-3">
                  <Avatar className="size-9">
                    <AvatarImage src={user?.user_metadata?.picture || ""} alt="user-picture" />
                    <AvatarFallback>{"LK"}</AvatarFallback>
                  </Avatar>
                  <div className="ml-1 flex flex-col">
                    <p className="text-sm font-medium">{user?.user_metadata?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleLogout}
                >
                  <LogOut className="mr-1" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          ) : (

            <SignInPage />
          )
        ) : (
          <Icons.loaderCircle className="mr-2 size-4 animate-spin" />
        )}

      </div>

      {/* Welcome */}
      <div className="text-center text-2xl font-semibold">
        Find your Okeaners
      </div>

      {/* Create Room  and Search */}
      <div className="flex justify-between">
        <RoomDialogCreate
          selectedRoom={selectedRoom}
          isEditing={isEditingRoom}
          onClose={() => {
            setIsEditingRoom(false)
            setSelectedRoom(null)
          }}
        />
        <div className="flex w-full max-w-sm items-center gap-2">
          <Input onChange={handleSearchQuery} type="text" placeholder="Search for rooms" />
          <Button type="submit" variant="outline">
            Search
          </Button>
        </div>
      </div>

      {/* My Rooms */}
      {!!myRooms?.length && (
        <>
          <h2>Your rooms</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myRooms?.map((room, index) => (
              <RoomCard
                key={index}
                room={room}
                onEdit={(id) => {
                  getSelectedRoom(id)
                  setIsEditingRoom(true)
                }}
                onDelete={handleRoomDelete}
                onJoin={joinRoom}
              />
            ))}
          </div>
        </>
      )}

      {/* All Rooms */}
      <h2>Rooms</h2>


      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms?.map((room, index) => (
          <RoomCard
            key={index}
            room={room}
            onEdit={(id) => {
              getSelectedRoom(id)
              setIsEditingRoom(true)
            }}
            onDelete={handleRoomDelete}
            onJoin={joinRoom}
          />
        ))}
      </div>

    </div >
  );
}

