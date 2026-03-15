import { useBackButtonClose } from "@/hooks/useBackButtonClose";
import { useVisualViewport } from "@/hooks/useVisualViewport";
import { ArrowLeft, MessageSquareText } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../../components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "../../../../components/ui/sheet";
import { type RoomLoader } from "../../../../types";
import Chat from "../Chat";
import UserSettingsMobile from "./UserSettingsMobile";

type ChatMobileSheetProps = {
  roomLoader: RoomLoader;
  userInitials: string;
  logOut: () => void;
  count: number;
  roomId: string | null;
};

const ChatMobileSheet = ({
  roomLoader,
  userInitials,
  logOut,
  count,
  roomId,
}: ChatMobileSheetProps) => {
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
    <Sheet open={openChatSheet} 
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
            <UserSettingsMobile
              roomLoader={roomLoader}
              userInitials={userInitials}
              logOut={logOut}
            />
          </div>
          <div className="flex-1 min-h-0">
            <Chat
              user={roomLoader.userData}
              roomId={roomId || ""}
              userId={roomLoader.userData?.id || ""}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ChatMobileSheet;
