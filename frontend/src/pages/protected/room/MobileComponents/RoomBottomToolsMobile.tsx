import { useVoiceRoom } from "@/hooks/useVoiceRoom";
import { useRoomStore } from "@/stores/useRoomStore";
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
import ChatMobileSheet from "./ChatMobileSheet";
import { useBackButtonClose } from "@/hooks/useBackButtonClose";
import { useState } from "react";

const RoomBottomToolsMobile = () => {
  const handleMute = useVoiceRoom().handleMute;
  const isMuted = useRoomStore((s) => s.isMuted);
  const micEnabled = useRoomStore((s) => s.micEnabled);
  const roomId = useRoomStore((s) => s.roomId) || "";
  const userId = useRoomStore((s) => s.userData?.id) || "";
  const leaveLoading = useRoomStore((s) => s.leaveLoading);

  const leaveRoom = useRoomStore((s) => s.leaveRoom);
  const voiceCleanup = useVoiceRoom().voiceCleanup;

  const [openLeaveDrawer, setOpenLeaveDrawer] = useState(false);
  const handleClose = () => {
    setOpenLeaveDrawer(false);
    if (window.history.state?.modal) {
      window.history.back();
    }
  };

  useBackButtonClose(openLeaveDrawer, () => {
    setOpenLeaveDrawer(false);
  });

  return (
    <>
      <Drawer
        open={openLeaveDrawer}
        onOpenChange={(open) => {
          !open ? handleClose() : setOpenLeaveDrawer(open);
        }}
      >
        <DrawerTrigger asChild>
          <Button
            variant="destructive"
            className="rounded-full w-12 h-12 p-0 bg-red-900/80 hover:bg-red-800 border border-red-800/50"
            disabled={leaveLoading}
          >
            {leaveLoading ? (
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
              onClick={() => {
                leaveRoom(roomId, userId);
                voiceCleanup(true);
              }}
              className={"text-sm py-4.5 px-6  border-destructive/40"}
              disabled={leaveLoading}
              variant="destructive"
            >
              {leaveLoading ? (
                <>
                  <Loader className="animate-spin w-4 h-4 mr-2" />
                  Leaving
                </>
              ) : (
                "Leave Room"
              )}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className={"text-sm py-4.5 px-6"}>
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Button
        onClick={handleMute}
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

      <ChatMobileSheet />
    </>
  );
};

export default RoomBottomToolsMobile;
