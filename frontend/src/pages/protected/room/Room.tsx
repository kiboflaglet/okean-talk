import { Ellipsis, Loader, MicOff, Video, VideoOff } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useLoaderData } from "react-router";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { Button } from "../../../components/ui/button";
import { supabase } from "../../../lib/supabaseClient";
import type { RoomLoader } from "../../../types";
import {
  roomParticipantCreateSchema,
  type roomParticipantCreate,
} from "../../home/roomSchema";
import type { IRoom, IUser } from "@/src/interfaces";

const Room = () => {
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

      await fetchRoom(); // your function to update roomData from DB

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

  // return <>{JSON.stringify(roomData)}</>;

  if (!userJoined) {
    return (
      <div className="p-4 flex flex-col h-screen gap-2 justify-center items-center">
        {error && <>{error}</>}
        <div className="bg-gray-5 w-50 h-50">
          <div className="flex flex-col items-center">
            <Avatar className="size-9">
              <AvatarImage
                alt={roomLoader.userData?.fullName}
                src={roomLoader.userData?.avatar_url}
              />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            <div>
              <Button className="bg-gray-7 text-gray-12 hover:bg-red-400/60">
                <MicOff />
              </Button>
              <Button className="bg-gray-7 text-gray-12 hover:bg-gray-6/50">
                <VideoOff />
              </Button>
            </div>
          </div>
        </div>
        <Button onClick={joinRoom} disabled={userJoinLoading}>
          {" "}
          {userJoinLoading ? (
            <>
              {" "}
              Joining <Loader className="animate-spin" />
            </>
          ) : (
            <>Join room</>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 flex h-screen gap-2 justify-between">
      <div className="w-full flex flex-col">
        <div className=" w-full flex-1">{JSON.stringify(roomData)}</div>
        <div className="flex justify-center items-center">
          {roomData?.users?.map((item) => (
            <UserCard {...item} />
          ))}
        </div>
        <div>
          <div className="flex justify-between">
            <span></span>
            <div>
              <Button className="bg-red-400 text-gray-12 hover:bg-red-400/60">
                <MicOff />
              </Button>
              <Button className="bg-gray-6 text-gray-12 hover:bg-gray-6/50">
                <Video />
              </Button>
              <Button className="bg-gray-6 text-gray-12 hover:bg-gray-6/50">
                <Ellipsis />
              </Button>
            </div>
            <div>
              <Button
                className="bg-red-400 text-gray-12 hover:bg-red-400/60"
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
                  <>Leave room</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-5 w-100">Sidebar for settings, chat etc.</div>
    </div>
  );
};

export default Room;

type UserCardProps = {
  participant: IUser
}

function UserCard({ ...props }: UserCardProps) {
  return <div className="w-30 h-30 bg-gray-8">{props.participant.fullName}</div>;
}
