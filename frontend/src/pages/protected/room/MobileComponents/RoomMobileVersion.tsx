import { cn } from "../../../../lib/utils";
import { Languages, type RoomLoader } from "../../../../types";
import { UserCard } from "../UserCard";
import RoomBottomToolsMobile from "./RoomBottomToolsMobile";
import UserSettingsMobile from "./UserSettingsMobile";

type RoomMobileVersionProps = {
  roomLoader: RoomLoader;
  userInitials: string;
  logOut: () => void;
  leaveRoom: (roomId: string | null) => void;
  toggleMute: () => void;
  count: number;
  userLeaveLoading: boolean;
  isMuted: boolean;
    micEnabled: boolean;
  roomId: string | null;
  roomData: RoomLoader["roomData"];
};

const RoomMobileVersion = ({
  roomLoader,
  userInitials,
  logOut,
  leaveRoom,
  toggleMute,
  count,
  userLeaveLoading,
  isMuted,
    micEnabled,
  roomId,
  roomData,
}: RoomMobileVersionProps) => {

  return (
    <div
      className="relative flex flex-col bg-gray-950 overflow-hidden"
      style={{ height: "100dvh" }}
    >
      <div className="shrink-0 flex items-start justify-between px-4 pt-5 pb-3">
        <div className="">
          <p className="text-gray-300 text-sm font-medium line-clamp-2">
            {roomLoader.roomData?.topic}
          </p>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {roomData?.languages?.map((item, i) => (
              <span
                key={i}
                className="text-xs bg-gray-800 text-gray-400 rounded-md px-2 py-0.5"
              >
                {Languages.find((l) => l.value === item)?.label}
              </span>
            ))}
          </div>
        </div>
        <UserSettingsMobile
          roomLoader={roomLoader}
          userInitials={userInitials}
          logOut={logOut}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        <div className="min-h-full flex items-center justify-center py-6">
          <div className="grid grid-cols-2 gap-3 w-full max-w-md">
            {roomData?.users?.map((item) => (
              <div
                key={item.participant.id}
                className={cn(
                  "bg-gray-900 border border-gray-800 rounded-2xl flex flex-col items-center justify-center gap-2 py-6 transition-all",
                  // voiceStatus === "connected" && "border-emerald-800/40",
                  roomData?.users?.length === 1 &&
                    "col-span-2 max-w-[50%] mx-auto w-full"
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
      </div>

      <div className="shrink-0 px-4 pb-8 pt-4 flex items-center justify-between gap-3">
        <RoomBottomToolsMobile
          roomLoader={roomLoader}
          userInitials={userInitials}
          logOut={logOut}
          leaveRoom={leaveRoom}
          toggleMute={toggleMute}
          count={count}
          userLeaveLoading={userLeaveLoading}
          isMuted={isMuted}
          roomId={roomId}
          micEnabled={micEnabled}
        />
      </div>
    </div>
  );
};

export default RoomMobileVersion;
