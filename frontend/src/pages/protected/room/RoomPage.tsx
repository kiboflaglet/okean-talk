import type { IRoom, IUser } from "@/src/interfaces";
import {
  ArrowRight,
  Copy,
  Ellipsis,
  Loader,
  Mic,
  MicOff,
  SettingsIcon,
  VideoOff,
} from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useLoaderData } from "react-router";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { Button } from "../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { supabase } from "../../../lib/supabaseClient";
import { Languages, type RoomLoader } from "../../../types";
import {
  roomParticipantCreateSchema,
  type roomParticipantCreate,
} from "../../home/roomSchema";
import Chat from "./Chat";

const RoomPage = () => {
  const roomLoader: RoomLoader = useLoaderData();
  const [roomId] = useState<string | null>(roomLoader.roomData?.id || null);
  const [roomData, setRoomData] = useState(roomLoader.roomData);
  const [error, setError] = useState<string | null>(null);
  const [userJoined, setUserJoined] = useState(false);
  const [userJoinLoading, setUserJoinLoading] = useState(false);
  const [userLeaveLoading, setUserLeaveLoading] = useTransition();
  const userInitials = useMemo(() => {
    if (!roomLoader?.userData) return "";
    return roomLoader.userData?.fullName
      .split(" ")
      .map((word: string) => word[0])
      .join("");
  }, []);
  const joinRoom = async () => {
    if (userJoinLoading) return;
    if (!roomId) return;
    if (!roomLoader.userData) return;

    setUserJoinLoading(true);

    try {
      const validatedRoomParticipantData =
        roomParticipantCreateSchema.safeParse({
          participantid: roomLoader.userData.id,
          roomid: roomId,
        } satisfies roomParticipantCreate);

      if (!validatedRoomParticipantData.success) {
        setError("Cannot join the room!");
        return;
      }

      await fetchRoom();

      const alreadyJoined = roomData?.users?.find(
        (item) => item.participant.id === roomLoader.userData?.id
      );

      if (alreadyJoined) {
        const { error } = await supabase
          .from("roomparticipants")
          .delete()
          .eq("participantid", roomLoader.userData.id)
          .eq("roomid", roomId);

        if (error) {
          console.log(error);
          return;
        }
      }

      const data = await fetchRoom();

      if (!data) {
        return;
      }

      if ((data?.users?.length || 0) >= (data?.maxParticipants || 0)) {
        setError("This room is full");
        return;
      }

      const { error } = await supabase
        .from("roomparticipants")
        .insert([validatedRoomParticipantData.data])
        .single();

      if (error) {
        console.log(error);
        return;
      }

      setUserJoined(true);
    } finally {
      setUserJoinLoading(false);
    }
  };

  const leaveRoom = (id: string | null) => {
    if (!id) return;
    setUserLeaveLoading(async () => {
      const { error } = await supabase
        .from("roomparticipants")
        .delete()
        .eq("participantid", roomLoader.userData?.id)
        .eq("roomid", id);
      if (error) {
        console.log(error);
        return;
      }

      setUserJoined(false);
    });
  };

  const fetchRoom = async (): Promise<IRoom | undefined> => {
    if (!roomId) return;
    const { data, error } = await supabase
      .from("rooms")
      .select(
        `*, users:roomparticipants (
       participant:users!roomparticipants_participantid_fkey(*)
      )`
      )
      .eq("id", roomId)
      .single();

    if (error) {
      console.log(error);
      return;
    }

    setRoomData(data);

    return data;
  };

  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${roomId}`,
        },
        fetchRoom
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "roomparticipants",
          filter: `roomid=eq.${roomId}`,
        },
        fetchRoom
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  if (!userJoined) {
    return (
      <div className="p-4 flex flex-col h-screen gap-4 justify-center items-center">
        {error && <>{error}</>}
        <div className="flex flex-col items-center ">
          <Avatar className="size-18">
            <AvatarImage
              alt={roomLoader.userData?.fullName}
              src={roomLoader.userData?.avatar_url}
            />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </div>
        <Button onClick={joinRoom} disabled={userJoinLoading}>
          {" "}
          {userJoinLoading ? (
            <>
              {" "}
              Joining <Loader className="animate-spin" />
            </>
          ) : (
            <>Join the room <ArrowRight /></>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className=" bg-gray-1 h-screen flex flex-col">
      <div className=" border-b border-gray-7 p-4 h-20 flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-lg">{roomLoader.roomData?.topic}</h1>
          <div className="flex gap-2 items-center">
            {roomLoader.roomData?.languages.map((item, index) => (
              <span
                key={"lang-" + index}
                className="bg-gray-7 rounded-lg px-2 py-1 "
              >
                {Languages.find((l) => l.value === item)?.label}
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-4">
          <Button variant={"ghost"}>
            <SettingsIcon />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="size-9">
                <AvatarImage
                  alt={roomLoader?.userData?.fullName}
                  src={roomLoader.userData?.avatar_url}
                />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="z-40" side="left">
              <DropdownMenuItem>
                <SettingsIcon />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex-1 p-4 flex gap-4 justify-between min-h-0">
        <div className="w-full flex flex-col">
          <div className="flex justify-center items-center gap-4">
            {roomData?.users?.map((item) => (
              <UserCard {...item} />
            ))}
          </div>
          <div className=" w-full flex-1"></div>

          <div>
            <div className="flex items-center justify-between">
              <div>
                <Button
                  className="bg-red-500 text-gray-12 hover:bg-red-400"
                  onClick={() => {
                    leaveRoom(roomId);
                  }}
                  disabled={userLeaveLoading}
                >
                  {" "}
                  {userLeaveLoading ? (
                    <>
                      {" "}
                      Leaving <Loader className="animate-spin" />
                    </>
                  ) : (
                    <>Leave Room</>
                  )}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button className="bg-red-500 text-gray-12 hover:bg-red-400">
                  <MicOff />
                </Button>
                <Button className="bg-red-500 text-gray-12 hover:bg-red-400">
                  <VideoOff />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-gray-6 text-gray-12 hover:bg-gray-6/50">
                      <Ellipsis />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="z-40" side="top">
                    <DropdownMenuItem>
                      <SettingsIcon />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <span>
                <Button className="bg-gray-6 text-gray-12 hover:bg-gray-6/50">
                  {roomId?.slice(0, 15)}...{" "}
                  <span className="text-gray-10">|</span> <Copy />
                </Button>
              </span>
            </div>
          </div>
        </div>
        <Chat
          user={roomLoader.userData}
          roomId={roomId || ""}
          userId={roomLoader.userData?.id || ""}
        />
      </div>
    </div>
  );
};

export default RoomPage;

type UserCardProps = {
  participant: IUser;
};

function UserCard({ ...props }: UserCardProps) {
  const userInitials = useMemo(() => {
    if (!props.participant) return "";
    return props.participant.fullName
      .split(" ")
      .map((word: string) => word[0])
      .join("");
  }, [props]);
  return (
    <div className="relative w-30 h-30 bg-gray-8 rounded-xl flex items-center justify-center  font-semibold">
      <div className="absolute bottom-2 left-2 bg-gray-6 p-2 rounded-xl">
        <Mic className="w-5 h-5" />
      </div>
      <div className="text-2xl">{userInitials}</div>
    </div>
  );
}
