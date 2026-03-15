import { Loader, Mic, MicOff, Phone } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../../../components/ui/drawer";
import { cn } from "../../../../lib/utils";
import { type RoomLoader } from "../../../../types";
import ChatMobileSheet from "./ChatMobileSheet";

type RoomBottomToolsMobileProps = {
  roomLoader: RoomLoader;
  userInitials: string;
  logOut: () => void;
  leaveRoom: (roomId: string | null) => void;
  toggleMute: () => void;
  count: number;
  userLeaveLoading: boolean;
  isMuted: boolean;
  roomId: string | null;
  micEnabled: boolean;
};

const RoomBottomToolsMobile = ({
  roomLoader,
  userInitials,
  logOut,
  leaveRoom,
  toggleMute,
  count,
  userLeaveLoading,
  isMuted,
  roomId,
  micEnabled,
}: RoomBottomToolsMobileProps) => {
  return (
    <>
      <Drawer>
        <DrawerTrigger asChild>
          <Button
            variant="destructive"
            className="rounded-full w-12 h-12 p-0 bg-red-900/80 hover:bg-red-800 border border-red-800/50"
            disabled={userLeaveLoading}
          >
            {userLeaveLoading ? (
              <Loader className="animate-spin w-4 h-4" />
            ) : (
              <Phone className="size-5" />
            )}
          </Button>
        </DrawerTrigger>
        <DrawerContent className="bg-gray-950 border-gray-800">
          <DrawerHeader>
            <DrawerTitle className="text-white">Leave this room?</DrawerTitle>
          </DrawerHeader>
          <DrawerFooter>
            <Button
              onClick={() => leaveRoom(roomId)}
              disabled={userLeaveLoading}
              variant="destructive"
            >
              {userLeaveLoading ? (
                <>
                  <Loader className="animate-spin w-4 h-4 mr-2" />
                  Leaving
                </>
              ) : (
                "Leave Room"
              )}
            </Button>
            <DrawerClose asChild>
              <Button
                variant="outline"
                className="border-gray-700 text-gray-300"
              >
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Button
        onClick={toggleMute}
        disabled={!micEnabled}
        className={cn(
          "rounded-full w-12 h-12 p-0 border transition-all",
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

      <ChatMobileSheet
        roomLoader={roomLoader}
        userInitials={userInitials}
        logOut={logOut}
        count={count}
        roomId={roomId}
      />
    </>
  );
};

export default RoomBottomToolsMobile;
