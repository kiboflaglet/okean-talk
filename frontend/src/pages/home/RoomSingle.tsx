import { ChevronRight, Copy } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import type { IRoom, IUser } from "../../interfaces";
import { cn, NameToInitials } from "../../lib/utils";
import { Languages } from "../../types";

type RoomSingleProps = IRoom & {
  joinRoom: () => void;
};

const RoomSingle = ({ joinRoom, ...props }: RoomSingleProps) => {
  const [copyPing, setCopyPing] = useState(false);

  const spotsLeft = props.maxParticipants - (props.users?.length || 0);
  const isRoomFull = spotsLeft <= 0;
  const totalSlots = props.maxParticipants;

  const avatarSize =
    totalSlots < 5
      ? "size-14"
      : totalSlots === 5
      ? "size-12"
      : totalSlots <= 10
      ? "size-10"
      : "size-7";

  const ringSize =
    totalSlots <= 5 ? "ring-2" : totalSlots <= 10 ? "ring-2" : "ring-1";

  const colsClass = totalSlots <= 5 ? "grid-cols-5" : "grid-cols-5";

  const copyId = () => {
    navigator.clipboard.writeText(`${window.location.origin}/room/${props.id}`);
    setCopyPing(true);
    setTimeout(() => setCopyPing(false), 1200);
  };

  const languageLabels = props.languages
    .map((l) => Languages.find((i) => i.value === l)?.label)
    .filter(Boolean)
    .join(", ");

  return (
    <div className="group relative p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 min-h-50 flex flex-col justify-between overflow-hidden">
      <div className="pointer-events-none absolute inset-0 hover:bg-gradient-to-br from-transparent to-gray-50 dark:to-gray-800/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {languageLabels ? (
            languageLabels.split(", ").map((lang) => (
              <span
                key={lang}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
              >
                {lang}
              </span>
            ))
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-400">
              Any language
            </span>
          )}
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={copyId}
              className="shrink-0 w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <Copy
                className={cn(
                  "w-3.5 h-3.5 transition-all duration-300",
                  copyPing && "scale-125 text-emerald-500"
                )}
              />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={8}>
            {copyPing ? "Copied!" : "Copy link"}
          </TooltipContent>
        </Tooltip>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed flex-1 flex items-center">
        {props.topic || (
          <span className="italic text-gray-400 dark:text-gray-600">
            No topic set
          </span>
        )}
      </p>

      <div className="flex items-center gap-2 justify-between">
        <div className={cn("grid gap-1", colsClass)}>
          {props?.users?.map((item) => (
            <UserInRoomCard
              key={item.participant.id}
              {...item}
              avatarSize={avatarSize}
              ringSize={ringSize}
            />
          ))}

          {Array.from({ length: spotsLeft }, (_, i) => (
            <div
              key={"empty-" + i}
              className={cn(
                avatarSize,
                "rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
              )}
            />
          ))}
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-block">
              <Button
                onClick={joinRoom}
                className={cn(
                  "h-9 rounded-xl px-4 text-xs font-semibold transition-all duration-200 gap-1.5 cursor-pointer",
                  isRoomFull
                    ? "bg-red-100 text-red-400 hover:bg-red-200 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900 cursor-not-allowed"
                    : "bg-gray-900 text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                )}
              >
                {isRoomFull ? "Full" : "Join"}
                {!isRoomFull && <ChevronRight className="w-3.5 h-3.5" />}
              </Button>
            </span>
          </TooltipTrigger>
          {isRoomFull && (
            <TooltipContent side="top" sideOffset={8}>
              This room is full
            </TooltipContent>
          )}
        </Tooltip>
      </div>
    </div>
  );
};

export default RoomSingle;

type UserInRoomCardProps = {
  participant: IUser;
  avatarSize?: string;
  ringSize?: string;
};

function UserInRoomCard({
  avatarSize = "size-10",
  ringSize = "ring-2",
  ...props
}: UserInRoomCardProps) {
  const userInitials = useMemo(() => {
    if (!props.participant) return "";
    return NameToInitials(props.participant.fullName);
  }, []);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Avatar
          className={cn(
            avatarSize,
            ringSize,
            "ring-white dark:ring-gray-900 cursor-default"
          )}
        >
          <AvatarImage
            alt={props.participant.fullName}
            src={props.participant.avatar_url}
          />
          <AvatarFallback className="text-lg">{userInitials}</AvatarFallback>
        </Avatar>
      </TooltipTrigger>
      <TooltipContent className="text-xs" side="top" sideOffset={8}>
        {props.participant.fullName}
      </TooltipContent>
    </Tooltip>
  );
}
