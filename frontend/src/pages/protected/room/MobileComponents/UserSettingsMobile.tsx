import { Separator } from "@/components/ui/seperator";
import { useBackButtonClose } from "@/hooks/useBackButtonClose";
import { useRoomStore } from "@/stores/useRoomStore";
import { LogOut } from "lucide-react";
import { useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../../components/ui/avatar";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../../../components/ui/drawer";

const UserSettingsMobile = () => {
  const userInitials = useRoomStore((s) => s.userInitials);
  const logOut = useRoomStore((s) => s.logOut);
  const userData = useRoomStore((s) => s.userData);

  const [openUserSettings, setOpenUserSettings] = useState(false);
  const handleClose = () => {
    setOpenUserSettings(false);
    if (window.history.state?.modal) {
      window.history.back();
    }
  };

  useBackButtonClose(openUserSettings, () => {
    setOpenUserSettings(false);
  });
  return (
    <Drawer
      open={openUserSettings}
      onOpenChange={(open) => {
        !open ? handleClose() : setOpenUserSettings(open);
      }}
    >
      <DrawerTrigger asChild>
        <Avatar className="size-9 ring-2 ring-white/20">
          <AvatarImage alt={userData?.fullName} src={userData?.avatar_url} />
          <AvatarFallback className="bg-white/10 text-white">
            {userInitials}
          </AvatarFallback>
        </Avatar>
      </DrawerTrigger>
      <DrawerContent className="bg-gray-950 border-white/10">
        <DrawerHeader>
          <DrawerTitle className="flex justify-center">
            <div className="flex flex-col gap-2 items-center">
              <Avatar className="size-16 ring-2 ring-white/20">
                <AvatarImage
                  alt={userData?.fullName}
                  src={userData?.avatar_url}
                />
                <AvatarFallback className="bg-white/10 text-white text-xl">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <span className="text-white">{userData?.fullName}</span>
            </div>
          </DrawerTitle>
        </DrawerHeader>
        <Separator className="bg-white/10" />
        <div className="mb-6 flex flex-col gap-2 [&>div]:mx-6 [&>div]:p-3 [&>div]:flex [&>div]:justify-between [&>div]:items-center [&>div]:border [&>div]:border-white/10 [&>div]:rounded-xl mt-4">
          <div
            className="text-red-400 cursor-pointer hover:bg-white/5 transition-colors"
            onClick={logOut}
          >
            <span className="text-sm">Log out</span>
            <LogOut className="w-4 h-4" />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default UserSettingsMobile;
