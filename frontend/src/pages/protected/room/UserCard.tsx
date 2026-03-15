import type { IUser } from "@/interfaces";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
type UserCardProps = {
  participant: IUser;
  voiceConnected?: boolean;
};

export function UserCard({ participant, voiceConnected }: UserCardProps) {
  const initials = useMemo(
    () =>
      participant?.fullName
        ?.split(" ")
        .map((w: string) => w[0])
        .join("") || "?",
    [participant]
  );

  return (
    <div className="flex flex-col items-center gap-3 relative">
      <div
        className={cn(
          "relative w-16 h-16 rounded-full ring-2 transition-all duration-500",
          voiceConnected ? "ring-emerald-700/50" : "ring-gray-700/50"
        )}
      >
        <Avatar className="size-16">
          <AvatarImage
            alt={participant?.fullName}
            src={(participant as any)?.avatar_url}
          />
          <AvatarFallback className="text-lg font-semibold bg-gray-800 text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
        {voiceConnected && (
          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-gray-900" />
        )}
        {/* Enable this code once you implement the feature others can see your mic activity */}
        {/* <div className="absolute -top-3 -right-10">
          <MicOff className="size-5 text-destructive/40" />
        </div> */}
      </div>
      <p className="text-gray-300 text-xs font-medium text-center leading-tight  ">
        {participant?.fullName}
      </p>
    </div>
  );
}
