import {
  HomeIcon,
  Languages as LangIcon,
  ListFilter,
  LogOut,
  LogOutIcon,
  Search,
} from "lucide-react";
import Select, { type MultiValue } from "react-select";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useLoaderData } from "react-router";
import { Languages, type HomeLoader, type TLanguage } from "../../../src/types";
import { Button } from "../../components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../../components/ui/input-group";
import { Separator } from "../../components/ui/seperator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { supabase } from "../../lib/supabaseClient";
import { cn } from "../../lib/utils";
import { useRoomsContext } from "../../provider/roomsContext";
import { RoomCreate } from "./room-create";
import Rooms from "./rooms";
import SignInButton from "./sign-in-button";

const Home = () => {
  const homeLoader: HomeLoader = useLoaderData();
  const [signOutLoading, setSignOutLoading] = useTransition();
  const [selectedLanguages, setSelectedLanguages] = useState<TLanguage[]>([]);
  const { setFilters, rooms } = useRoomsContext();
  const { isMobile } = useBreakpoint();
  const [openMobileFilters, setOpenMobileFilters] = useState(false);
  useEffect(() => {
    setFilters({ languages: selectedLanguages.map((item) => item.value) });
  }, [selectedLanguages]);

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

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-2 font-sans text-gray-12">
      {!isMobile && (
        <aside className="[&>div]:cursor-pointer flex w-20 flex-col items-center border-r border-gray-4 bg-color-gray-1 py-6">
          <div className="mb-10 h-8 w-8 rounded  flex justify-center items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <HomeIcon />
              </TooltipTrigger>
              <TooltipContent className="text-sm" side="right" sideOffset={10}>
                Rooms
              </TooltipContent>
            </Tooltip>
          </div>

          {/* <div className="flex flex-col gap-8">
            <div className="h-6 w-6 rounded  flex justify-center items-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Users />
                </TooltipTrigger>
                <TooltipContent
                  className="text-sm"
                  side="right"
                  sideOffset={10}
                >
                  Friends
                </TooltipContent>
              </Tooltip>
            </div>
          </div> */}

          <div className="mt-auto flex flex-col gap-6">
            {/* <div className="h-6 w-6 rounded  flex justify-center items-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Settings />
                </TooltipTrigger>
                <TooltipContent
                  className="text-sm"
                  side="right"
                  sideOffset={10}
                >
                  Settings
                </TooltipContent>
              </Tooltip>
            </div> */}
            <div className="h-6 w-6 rounded  flex justify-center items-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  {homeLoader?.userData ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Avatar className="size-9">
                          <AvatarImage
                            alt={homeLoader?.userData?.fullName}
                            src={homeLoader.userData?.avatar_url}
                          />
                          <AvatarFallback>{userInitials}</AvatarFallback>
                        </Avatar>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="z-40" side="left">
                        <DropdownMenuItem
                          disabled={signOutLoading}
                          onClick={logOut}
                          variant="destructive"
                        >
                          <LogOutIcon />
                          Log out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <SignInButton />
                  )}
                </TooltipTrigger>
                <TooltipContent
                  className="text-sm"
                  side="right"
                  sideOffset={10}
                >
                  Profile
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </aside>
      )}

      <main className="flex flex-1 flex-col overflow-y-auto px-8  ">
        <header
          className={cn(
            "flex  items-center gap-4 mt-6 justify-between",
            isMobile && "justify-between"
          )}
        >
          <div className="flex gap-2">
            <h1 className="text-2xl font-bold">Okean Talk</h1>
            {isMobile ? (
              <div className="flex gap-2 items-center">
                <RoomCreate
                  canCreate={
                    !!rooms.find(
                      (item) => item.ownerId === homeLoader?.userData?.id
                    )
                      ? false
                      : true
                  }
                />
                {homeLoader?.userData ? (
                  <Drawer>
                    <DrawerTrigger>
                      <Avatar className="size-9">
                        <AvatarImage
                          alt={homeLoader?.userData?.fullName}
                          src={homeLoader?.userData?.avatar_url}
                        />
                        <AvatarFallback>{userInitials}</AvatarFallback>
                      </Avatar>
                    </DrawerTrigger>
                    <DrawerContent className="">
                      <DrawerHeader>
                        <DrawerTitle className="flex justify-center">
                          <div className="flex flex-col gap-2 items-center">
                            <Avatar className="size-16">
                              <AvatarImage
                                alt={homeLoader?.userData?.fullName}
                                src={homeLoader?.userData?.avatar_url}
                              />
                              <AvatarFallback>{userInitials}</AvatarFallback>
                            </Avatar>
                            <span>{homeLoader?.userData?.fullName}</span>
                          </div>
                        </DrawerTitle>
                      </DrawerHeader>
                      <Separator />

                      <div className="mb-6 flex flex-col gap-2 [&>div]:mx-15 [&>div]:p-2 [&>div]:flex [&>div]:justify-between [&>div]:items-center [&>div]:border [&>div]:border-gray-5 [&>div]:rounded-lg">
                        <div className=" text-red-400">
                          <span>Log out</span>
                          <LogOut className="w-5 h-5" />
                        </div>
                      </div>
                    </DrawerContent>
                  </Drawer>
                ) : (
                  <SignInButton />
                )}
              </div>
            ) : (
              <RoomCreate
                canCreate={
                  !!rooms.find(
                    (item) => item.ownerId === homeLoader?.userData?.id
                  )
                    ? false
                    : true
                }
              />
            )}
          </div>

          <div className="flex flex-col gap-1 [&>a]:text-gray-11">
            <a
              className="h-3 p-0 m-0 border-none"
              href={window.origin + "/privacy-and-terms"}
            >
              Privacy Policy and Terms
            </a>
          </div>
        </header>

        <div
          className={cn(
            "flex items-center gap-4  mt-5 ",
            isMobile && "justify-between"
          )}
        >
          <div className="min-w-0 flex-1">
            <InputGroup className="rounded-2xl h-7  text-2xl  w-full  ">
              <InputGroupAddon className="text-xs text-gray-9">
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                onChange={(e) => setFilters({ searchQuery: e.target.value })}
                className="text-xs  "
                placeholder="Search..."
              />
            </InputGroup>
          </div>
          {isMobile ? (
            <>
              <Button
                onClick={() => setOpenMobileFilters(true)}
                variant={"ghost"}
              >
                <ListFilter />
              </Button>

              <Drawer
                open={openMobileFilters}
                onOpenChange={setOpenMobileFilters}
              >
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Filters</DrawerTitle>
                  </DrawerHeader>
                  <div className="px-4 pb-4">
                    <Select
                      isMulti
                      options={Languages}
                      value={selectedLanguages}
                      onChange={
                        (newValue: MultiValue<TLanguage>) =>
                          setSelectedLanguages([...newValue]) // convert readonly array to mutable
                      }
                      closeMenuOnSelect={false}
                      hideSelectedOptions={false}
                      placeholder={
                        <div className="flex items-center gap-1">
                          <LangIcon className={"w-4 h-4"} />
                          <span className="font-bold">Filter by language:</span>
                          <span>
                            {selectedLanguages.length
                              ? selectedLanguages.map((s) => s.label).join(", ")
                              : "Any"}
                          </span>
                        </div>
                      }
                      menuPlacement="auto"
                      menuPosition="absolute"
                      classNamePrefix={"react-select"}
                      className="select-style"
                    />
                  </div>
                  <DrawerFooter>
                    <DrawerClose asChild>
                      <Button>Done</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            </>
          ) : (
            <div className="flex items-center gap-2 ">
              <div style={{ width: 400 }}>
                <Select
                  isMulti
                  options={Languages}
                  value={selectedLanguages}
                  onChange={
                    (newValue: MultiValue<TLanguage>) =>
                      setSelectedLanguages([...newValue]) // convert readonly array to mutable
                  }
                  closeMenuOnSelect={false}
                  hideSelectedOptions={false}
                  placeholder={
                    <div className="flex items-center gap-1">
                      <LangIcon className={"w-4 h-4"} />
                      <span className="font-bold">Filter by language:</span>
                      <span>
                        {selectedLanguages.length
                          ? selectedLanguages.map((s) => s.label).join(", ")
                          : "Any"}
                      </span>
                    </div>
                  }
                  menuPlacement="auto"
                  menuPosition="absolute"
                  classNamePrefix={"react-select"}
                  className="select-style"
                />
              </div>
            </div>
          )}
        </div>
        <Rooms />
      </main>
    </div>
  );
};

export default Home;
