import { useVoiceRoom } from "@/hooks/useVoiceRoom";
import { useRoomStore } from "@/stores/useRoomStore";
import { useEffect } from "react";
import { useLoaderData } from "react-router";
import { useBreakpoint } from "../../../hooks/useBreakpoint";
import { supabase } from "../../../lib/supabaseClient";
import { type RoomLoader } from "../../../types";
import RoomDesktopVersion from "./DesktopComponents/RoomDesktopVersion";
import RoomMobileVersion from "./MobileComponents/RoomMobileVersion";
import NotJoined from "./NotJoined";

const RoomPage = () => {
  const roomLoader: RoomLoader = useLoaderData();
  const roomId = useRoomStore((s) => s.roomId);
  const isMobile = useBreakpoint().isMobile;
  const userJoined = useRoomStore((s) => s.userJoined);
  const micEnabled = useRoomStore((s) => s.micEnabled);

  const setRoomData = useRoomStore((s) => s.setRoomData);
  const setRoomId = useRoomStore((s) => s.setRoomId);
  const setUserData = useRoomStore((s) => s.setUserData);

  const voiceCleanup = useVoiceRoom().voiceCleanup;
  const startVoice = useVoiceRoom().startVoice;

  useEffect(() => {
    setRoomId(roomLoader?.roomData?.id || null);
    setRoomData(roomLoader?.roomData || null);
    setUserData(roomLoader?.userData || null);
  }, []);

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
        useRoomStore.getState().fetchRoom
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "roomparticipants",
          filter: `roomid=eq.${roomId}`,
        },
        useRoomStore.getState().fetchRoom
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  useEffect(() => () => voiceCleanup(true), []);

  useEffect(() => {
    if (userJoined && micEnabled && roomId) {
      startVoice(roomId);
    }
    if (!userJoined) {
      voiceCleanup(false);
    }
  }, [userJoined]);

  if (!userJoined) {
    return <NotJoined />;
  }

  if (isMobile) {
    return <RoomMobileVersion />;
  }

  return <RoomDesktopVersion />;
};

export default RoomPage;
