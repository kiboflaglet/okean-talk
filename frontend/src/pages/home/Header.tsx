import { LogOut, LogOutIcon } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";

import { useBreakpoint } from "@/hooks/useBreakpoint";
import { supabase } from "@/lib/supabaseClient";
import type { HomeLoader } from "@/types";
import { useMemo, useState, useTransition } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Separator } from "../../components/ui/seperator";
import { useBackButtonClose } from "@/hooks/useBackButtonClose";
import SignInButton from "./SignInButton";

type HeaderProps = {
  homeLoader: HomeLoader;
};

const Header = ({ homeLoader }: HeaderProps) => {
  const { isMobile } = useBreakpoint();
  const [signOutLoading, setSignOutLoading] = useTransition();
  const [openUserSettings, setOpenUserSettings] = useState(false);

  const userInitials = useMemo(() => {
    if (!homeLoader?.userData) return "";
    return homeLoader.userData?.fullName
      .split(" ")
      .map((word: string) => word[0])
      .join("");
  }, [homeLoader]);

  const logOut = () => {
    setSignOutLoading(async () => {
      await supabase.auth.signOut();
      window.location.reload();
    });
  };

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
    <header className="flex items-center justify-between gap-4 mt-6">
      <div className="flex flex-1 items-center gap-3 justify-between">
        <div className="flex flex-col">
          <h1
            className="text-2xl font-bold tracking-tight text-white"
            style={{ textShadow: "0 0 24px rgba(255,255,255,0.18)" }}
          >
            Okean Talk
          </h1>
          <a
            className="text-xs text-white/30 hover:text-white/60 transition-colors"
            href={window.origin + "/privacy-and-terms"}
          >
            Privacy &amp; Terms
          </a>
        </div>

        {isMobile && (
          <div className="flex gap-2 items-center">
            {homeLoader?.userData ? (
              <Drawer
                open={openUserSettings}
                onOpenChange={(open) => {
                  !open ? handleClose() : setOpenUserSettings(open);
                }}
              >
                <DrawerTrigger asChild>
                  <Avatar className="size-9 ring-2 ring-white/20">
                    <AvatarImage
                      alt={homeLoader?.userData?.fullName}
                      src={homeLoader?.userData?.avatar_url}
                    />
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
                            alt={homeLoader?.userData?.fullName}
                            src={homeLoader?.userData?.avatar_url}
                          />
                          <AvatarFallback className="bg-white/10 text-white text-xl">
                            {userInitials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-white">
                          {homeLoader?.userData?.fullName}
                        </span>
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
            ) : (
              <SignInButton />
            )}
          </div>
        )}
      </div>

      {!isMobile && homeLoader?.userData && (
        <div className="flex items-center gap-5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="size-9 cursor-pointer ring-2 ring-white/20 hover:ring-white/40 transition-all">
                <AvatarImage
                  alt={homeLoader?.userData?.fullName}
                  src={homeLoader.userData?.avatar_url}
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
              {/* User info header */}
              <div className="flex items-center gap-3 px-3 py-3">
                <Avatar className="size-11 ring-2 ring-white/20">
                  <AvatarImage
                    alt={homeLoader?.userData?.fullName}
                    src={homeLoader.userData?.avatar_url}
                  />
                  <AvatarFallback className="bg-white/10 text-white text-sm">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-white truncate">
                    {homeLoader?.userData?.fullName}
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
                <LogOutIcon className="w-4 h-4 mr-2" />
                {signOutLoading ? "Signing out..." : "Log out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      <div>
        {!isMobile && !homeLoader?.userData && <SignInButton showTitle />}
      </div>
    </header>
  );
};

export default Header;
