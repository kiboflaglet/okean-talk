import {
  HomeIcon,
  Languages as LangIcon,
  LogOutIcon,
  Search,
  Settings,
  SettingsIcon,
  Users
} from "lucide-react";
import Select, { type MultiValue } from "react-select";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";

import type { User } from "@supabase/supabase-js";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useLoaderData } from "react-router";
import { Languages, type TLanguage } from "../../../src/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../../components/ui/input-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { supabase } from "../../lib/supabaseClient";
import { useRoomsContext } from "../../provider/roomsContext";
import { RoomCreate } from "./room-create";
import Rooms from "./rooms";
import SignInButton from "./sign-in-button";

const Home = () => {
  const user: User = useLoaderData();
  const [signOutLoading, setSignOutLoading] = useTransition();
  const [selectedLanguages, setSelectedLanguages] = useState<TLanguage[]>([]);
  const {setFilters} = useRoomsContext()
  useEffect(() => {
    setFilters({languages: selectedLanguages.map(item => item.value)})
  }, [selectedLanguages, ])


  const userInitials = useMemo(() => {
    if (!user) return "";
    return user.user_metadata.full_name
      .split(" ")
      .map((word: string) => word[0])
      .join("");
  }, [user]);

  const logOut = () => {
    setSignOutLoading(async () => {
      await supabase.auth.signOut();
      window.location.reload();
    });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-2 font-sans text-gray-12">
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

        <div className="flex flex-col gap-8">
          <div className="h-6 w-6 rounded  flex justify-center items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Users />
              </TooltipTrigger>
              <TooltipContent className="text-sm" side="right" sideOffset={10}>
                Friends
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-6">
          <div className="h-6 w-6 rounded  flex justify-center items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Settings />
              </TooltipTrigger>
              <TooltipContent className="text-sm" side="right" sideOffset={10}>
                Settings
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="h-6 w-6 rounded  flex justify-center items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Avatar className="size-9">
                        <AvatarImage
                          alt={user.user_metadata.full_name}
                          src={user.user_metadata.avatar_url}
                        />
                        <AvatarFallback>{userInitials}</AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="z-40" side="left">
                      <DropdownMenuItem>
                        <SettingsIcon />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
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
              <TooltipContent className="text-sm" side="right" sideOffset={10}>
                Profile
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </aside>

      <main className="flex flex-1 flex-col overflow-y-auto px-8 ">
        <header className="flex items-center justify-between mt-6   ">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Okean Talk</h1>
            <RoomCreate />
          </div>
        </header>

        <div className="flex items-center gap-4  mt-5  ">
          <div className="">
            <InputGroup className="rounded-2xl h-7  text-2xl   ">
              <InputGroupAddon className="text-xs text-gray-9">
                <Search />
              </InputGroupAddon>
              <InputGroupInput
              onChange={(e) => 
                setFilters({searchQuery: e.target.value})
              }
              className="text-xs " placeholder="Search ..." />
            </InputGroup>
          </div>
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
        </div>

        <Rooms />
      </main>
    </div>
  );
};

export default Home;
