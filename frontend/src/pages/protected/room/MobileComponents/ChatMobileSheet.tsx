import { useBackButtonClose } from "@/hooks/useBackButtonClose";
import { useVisualViewport } from "@/hooks/useVisualViewport";
import { useRoomStore } from "@/stores/useRoomStore";
import { ArrowLeft, MessageSquareText } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../../../../components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "../../../../components/ui/sheet";
import Chat from "../Chat";
import UserSettingsMobile from "./UserSettingsMobile";

const ChatMobileSheet = () => {
  const roomData = useRoomStore((s) => s.roomData);

  const count = useMemo(() => {
    return roomData?.users?.length || 0;
  }, []);
  const [openChatSheet, setOpenChatSheet] = useState(false);

  const { height, offsetTop } = useVisualViewport();

  const handleClose = () => {
    setOpenChatSheet(false);
    if (window.history.state?.modal) {
      window.history.back();
    }
  };

  useBackButtonClose(openChatSheet, () => {
    setOpenChatSheet(false);
  });
  return (
    <Sheet
      open={openChatSheet}
      onOpenChange={(open) => {
        !open ? handleClose() : setOpenChatSheet(open);
      }}
    >
      <SheetTrigger asChild>
        <Button className="rounded-full w-12 h-12 p-0 bg-gray-800 border border-gray-700 hover:bg-gray-700">
          <MessageSquareText className="size-5 text-gray-200" />
        </Button>
      </SheetTrigger>
      <SheetContent
        showCloseButton={false}
        className="min-w-screen bg-gray-950 border-gray-800 p-0"
        style={{
          position: "fixed",
          top: offsetTop,
          height: height,
        }}
      >
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex items-center gap-3 px-4 pt-5 pb-3 shrink-0 border-b border-gray-800">
            <Button
              variant="ghost"
              className="size-9 p-0 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full"
              onClick={() => setOpenChatSheet(false)}
            >
              <ArrowLeft className="size-5" />
            </Button>
            <p className="text-white font-medium text-sm flex-1">
              Chat · {count} {count === 1 ? "person" : "people"}
            </p>
            <UserSettingsMobile />
          </div>
          <div className="flex-1 min-h-0">
            <Chat />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ChatMobileSheet;
