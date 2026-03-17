import { LogOutIcon } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import { useRoomStore } from "@/stores/useRoomStore";

const UserSettingsDesktop = () => {
  const userData = useRoomStore((s) => s.userData);
  const userInitials = useRoomStore((s) => s.userInitials);
  const logOutLoading = useRoomStore((s) => s.logOutLoading);
  const logOut = useRoomStore((s) => s.logOut);

  return (
    <div className="flex items-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar className="size-9 cursor-pointer ring-2 ring-white/20 hover:ring-white/40 transition-all">
            <AvatarImage alt={userData?.fullName} src={userData?.avatar_url} />
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
                alt={userData?.fullName}
                src={userData?.avatar_url}
              />
              <AvatarFallback className="bg-white/10 text-white text-sm">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-white truncate">
                {userData?.fullName}
              </span>
            </div>
          </div>

          <DropdownMenuSeparator className="bg-white/10" />

          <DropdownMenuItem
            disabled={logOutLoading}
            onClick={logOut}
            variant="destructive"
            className="mx-1 mb-1 cursor-pointer"
          >
            <LogOutIcon className=" mr-2" />
            {logOutLoading ? "Signing out..." : "Log out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserSettingsDesktop;
