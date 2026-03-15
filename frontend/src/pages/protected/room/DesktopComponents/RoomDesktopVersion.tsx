import { useVoiceRoom } from "@/hooks/useVoiceRoom";
import { useRoomStore } from "@/stores/useRoomStore";
import {
  Check,
  Copy,
  Loader,
  MessageSquareText,
  Mic,
  MicOff,
  Phone,
} from "lucide-react";
import { useMemo } from "react";
import { Button } from "../../../../components/ui/button";
import { cn } from "../../../../lib/utils";
import { Languages } from "../../../../types";
import Chat from "../Chat";
import { UserCard } from "../UserCard";
import UserSettingsDesktop from "./UserSettingsDesktop";

const RoomDesktopVersion = () => {
  const roomData = useRoomStore((s) => s.roomData);
  const userId = useRoomStore((s) => s.userData?.id) || "";
  const roomId = useRoomStore((s) => s.roomId) || "";
  const micEnabled = useRoomStore((s) => s.micEnabled);
  const leaveRoom = useRoomStore((s) => s.leaveRoom);
  const leaveLoading = useRoomStore((s) => s.leaveLoading);
  const copyRoomLink = useRoomStore((s) => s.copyRoomLink);
  const isMuted = useRoomStore((s) => s.isMuted);
  const handleMute = useVoiceRoom().handleMute;
  const voiceCleanup = useVoiceRoom().voiceCleanup;
  const roomLinkCopied = useRoomStore((s) => s.roomLinkCopied);

  const count = useMemo(() => {
    return roomData?.users?.length || 0;
  }, []);
  return (
    <div className="h-screen bg-gray-950 flex flex-col overflow-hidden">
      <div className="shrink-0 border-b border-gray-800/60 px-6 h-20 flex items-center justify-between">
        <div className="flex flex-col gap-2 min-w-0">
          <h1 className="text-white text-sm font-medium  ">
            {roomData?.topic}
          </h1>
          <div className="flex gap-1.5 shrink-0">
            {roomData?.languages?.map((item, i) => (
              <span
                key={i}
                className="text-xs bg-gray-800 text-gray-400 rounded px-2 py-0.5"
              >
                {Languages.find((l) => l.value === item)?.label}
              </span>
            ))}
          </div>
        </div>
        <UserSettingsDesktop />
      </div>

      <div className="flex-1 flex min-h-0">
        <div className="flex-1 flex flex-col  min-w-0">
          <div className="flex-1 flex items-center justify-center">
            <div
              className={cn(
                "grid gap-4 w-full",
                count <= 1
                  ? "grid-cols-1 max-w-xs"
                  : count <= 2
                  ? "grid-cols-2 max-w-lg"
                  : count <= 4
                  ? "grid-cols-2 max-w-2xl"
                  : "grid-cols-3 max-w-3xl"
              )}
            >
              {roomData?.users?.map((item) => (
                <div
                  key={item.participant.id}
                  className={cn(
                    "bg-gray-900 border border-gray-800 rounded-3xl aspect-square flex flex-col items-center justify-center gap-3 transition-all duration-300"
                  )}
                >
                  <UserCard
                    participant={item.participant}
                    voiceConnected={false}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="shrink-0 flex items-center justify-between py-4 px-6 border-t border-gray-800/50">
            <Button
              onClick={() => {
                leaveRoom(roomId, userId);
                voiceCleanup(true);
              }}
              disabled={leaveLoading}
              className={cn(
                "rounded-full size-12 p-0 transition-all bg-red-900/70 hover:bg-red-800/80 text-red-200 border border-red-800/50 "
              )}
            >
              {leaveLoading ? (
                <>
                  <Loader className="animate-spin size-5 " />
                </>
              ) : (
                <>
                  <Phone className="size-5 " />
                </>
              )}
            </Button>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleMute}
                disabled={!micEnabled}
                className={cn(
                  "rounded-full size-12 p-0 border transition-all",
                  isMuted
                    ? "bg-red-900/60 border-red-800/50 hover:bg-red-800/60"
                    : "bg-gray-800 border-gray-700 hover:bg-gray-700"
                )}
              >
                {isMuted ? (
                  <MicOff className="size-5 text-red-300" />
                ) : (
                  <Mic className="size-5 text-gray-200" />
                )}
              </Button>
            </div>

            <Button
              variant="ghost"
              className="text-gray-500 hover:text-gray-300 text-xs font-mono flex items-center gap-2 hover:bg-gray-800 rounded-xl px-3 h-9"
              onClick={() => {
                copyRoomLink(roomId);
              }}
            >
              {roomLinkCopied ? (
                <>
                  <Check className="w-3 h-3" /> Copy link
                </>
              ) : (
                <>
                <Copy className="w-3 h-3" /> Copy link
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex flex-col w-100  border-l border-gray-800/60">
          <div className="px-4 py-3 border-b border-gray-800/60 flex items-center gap-2 shrink-0">
            <MessageSquareText className="w-4 h-4 text-gray-500" />
            <span className="text-gray-400 text-sm">Chat</span>
            <span className="ml-auto text-gray-600 text-xs">
              {count} {count === 1 ? "person" : "people"}
            </span>
          </div>
          <Chat />
        </div>
      </div>
    </div>
  );
};

export default RoomDesktopVersion;
