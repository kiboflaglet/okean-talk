import { useRoomStore } from "@/stores/useRoomStore";
import { cn } from "../../../../lib/utils";
import { Languages } from "../../../../types";
import { UserCard } from "../UserCard";
import RoomBottomToolsMobile from "./RoomBottomToolsMobile";
import UserSettingsMobile from "./UserSettingsMobile";

const RoomMobileVersion = () => {
  const roomData = useRoomStore((s) => s.roomData);

  return (
    <div
      className="relative flex flex-col bg-gray-950 overflow-hidden"
      style={{ height: "100dvh" }}
    >
      <div className="shrink-0 flex items-start justify-between px-4 pt-5 pb-3">
        <div className="">
          <p className="text-gray-300 text-sm font-medium line-clamp-2">
            {roomData?.topic}
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
        <UserSettingsMobile />
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        <div className="min-h-full flex items-center justify-center py-6">
          <div
            className={cn(
              "grid grid-cols-2 gap-3 w-full max-w-md",
              roomData?.users?.length === 1 && "grid-cols-1"
            )}
          >
            {roomData?.users?.map((item) => (
              <div
                key={item.participant.id}
                className={cn(
                  "bg-gray-900 border border-gray-800 rounded-2xl flex flex-col items-center justify-center gap-2 py-6 transition-all",
                  (roomData?.users?.length === 1 ||
                    roomData?.users?.length === 2) &&
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
        <RoomBottomToolsMobile />
      </div>
    </div>
  );
};

export default RoomMobileVersion;
