import {
  BadgeCheckIcon,
  ChevronRight,
  Copy,
  CreditCardIcon,
  Ellipsis,
  LogOutIcon,
  MicOff,
  SettingsIcon,
  UserIcon
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { ButtonGroup } from "../../components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import type { IRoom, IUser } from "../../interfaces";
import { Languages } from "../../types";

const RoomSingle = ({
  copyId,
  ...props
}: IRoom & {
  copyId: () => void;
}) => {
  const languageLabels = props.languages
    .map((l) => Languages.find((i) => i.value === l)?.label)
    .filter(Boolean)
    .join(", ");

  return (
    <div className="p-4 outline-2 outline-gray-5 border-b-4 border-gray-5 rounded-xl bg-gray-1 shadow-sm h-64 flex flex-col justify-between">
      <div className="flex justify-between">
        <div className="flex flex-col gap-1">
          {/* <div className="font-bold text-xl text-gray-10 gap-1">
            {topicLabels && <span>{topicLabels}</span>}
          </div> */}
          <div className="font-bold text-lg text-gray-10 gap-1">
            {languageLabels && <span>{languageLabels}</span>}
          </div>
        </div>

        <ButtonGroup>
          <Button
            onClick={copyId}
            size={"lg"}
            className="bg-gray-5 text-gray-12 hover:bg-gray-6 "
          >
            <Copy />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size={"lg"}
                className="bg-gray-5 text-gray-12 hover:bg-gray-6"
              >
                <Ellipsis />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="z-40" side="left">
              <DropdownMenuItem>
                <UserIcon />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCardIcon />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <SettingsIcon />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <LogOutIcon />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ButtonGroup>
      </div>

      <p>{props.topic}</p>

      <div className="flex gap-2 flex-wrap">
        {props?.users?.map((item) => (
          <UserInRoomCard key={item.id} {...item} />
        ))}
        {Array.from(
          { length: props.maxParticipants - (props.users?.length || 0) },
          (_, i) => (
            <div
              className="w-10 h-10 border border-dashed bg-gray-5 rounded-full"
              key={"empty-user-" + i}
            >
              {""}
            </div>
          )
        )}
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-start gap-3">
          <Avatar className="size-9">
            <AvatarImage alt="@shadcn" src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 font-semibold leading-none tracking-tight">
              {props.owner?.fullName}{" "}
              <BadgeCheckIcon className="size-4.5 fill-blue-500 text-white" />
            </div>
            <span className="text-muted-foreground text-xs leading-none">
              5 followers
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <MicOff className="w-4 h-4 text-gray-9" />
          <Button className="bg-gray-12 rounded-full w-9.5  p-1 mr-1">
            <ChevronRight className="text-gray-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoomSingle;

type UserInRoomCardProps = IUser;

function UserInRoomCard({ ...props }: UserInRoomCardProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Avatar className="size-9">
          <AvatarImage alt="@shadcn" src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </TooltipTrigger>
      <TooltipContent className="text-sm" side="top" sideOffset={10}>
        {props.fullName}
      </TooltipContent>
    </Tooltip>
  );
}
