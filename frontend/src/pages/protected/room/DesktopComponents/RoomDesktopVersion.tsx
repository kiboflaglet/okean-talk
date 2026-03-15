import {
  Copy,
  Loader,
  LogOutIcon,
  MessageSquareText,
  Mic,
  MicOff,
  Phone,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../../components/ui/avatar";
import { Button } from "../../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import { cn } from "../../../../lib/utils";
import { Languages, type RoomLoader } from "../../../../types";
import Chat from "../Chat";
import type { VoiceStatus } from "../types";
import { UserCard } from "../UserCard";

type RoomDesktopVersionProps = {
  roomLoader: RoomLoader;
  userInitials: string;
  leaveRoom: (roomId: string | null) => void;
  toggleMute: () => void;
  count: number;
  userLeaveLoading: boolean;
  isMuted: boolean;
  logOut: () => void;
  signOutLoading: boolean;
  micEnabled: boolean;
  roomId: string | null;
  roomData: RoomLoader["roomData"];
};

const RoomDesktopVersion = ({
  roomLoader,
  userInitials,
  leaveRoom,
  toggleMute,
  count,
  userLeaveLoading,
  isMuted,
  logOut,
  signOutLoading,
  micEnabled,
  roomId,
  roomData,
}: RoomDesktopVersionProps) => {
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

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="size-9 cursor-pointer ring-2 ring-white/20 hover:ring-white/40 transition-all">
                <AvatarImage
                  alt={roomLoader?.userData?.fullName}
                  src={roomLoader.userData?.avatar_url}
                />
                <AvatarFallback className="bg-white/10 text-white text-sm">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="z-40 w-56 bg-gray-950 border-white/10 text-white"
              side="bottom"
              align="end"
            >
              <div className="flex items-center gap-3 px-3 py-3">
                <Avatar className="size-11 ring-2 ring-white/20">
                  <AvatarImage
                    alt={roomLoader?.userData?.fullName}
                    src={roomLoader.userData?.avatar_url}
                  />
                  <AvatarFallback className="bg-white/10 text-white text-sm">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-white truncate">
                    {roomLoader?.userData?.fullName}
                  </span>
                </div>
              </div>

              <DropdownMenuSeparator className="bg-white/10" />

              <DropdownMenuItem
                disabled={signOutLoading}
                onClick={logOut}
                variant="destructive"
                className="mx-1 mb-1 cursor-pointer"
              >
                <LogOutIcon className=" mr-2" />
                {signOutLoading ? "Signing out..." : "Log out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
                    "bg-gray-900 border border-gray-800 rounded-3xl aspect-square flex flex-col items-center justify-center gap-3 transition-all duration-300",
                 
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
              onClick={() => leaveRoom(roomId)}
              disabled={userLeaveLoading}
              className={cn(
                "rounded-full size-12 p-0 transition-all bg-red-900/70 hover:bg-red-800/80 text-red-200 border border-red-800/50 "
              )}
            >
              {userLeaveLoading ? (
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
                onClick={toggleMute}
                disabled={
                  !micEnabled
                }
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
              onClick={() => navigator.clipboard.writeText(roomId || "")}
            >
              <Copy className="w-3 h-3" /> Copy link
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
          <Chat
            user={roomLoader.userData}
            roomId={roomId || ""}
            userId={roomLoader.userData?.id || ""}
          />
        </div>
      </div>
    </div>
  );
};

export default RoomDesktopVersion;
