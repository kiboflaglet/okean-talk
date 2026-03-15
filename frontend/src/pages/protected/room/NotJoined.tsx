import {
    Loader,
    Mic,
    MicOff
} from "lucide-react";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "../../../components/ui/avatar";
import { Button } from "../../../components/ui/button";
import { cn } from "../../../lib/utils";
import { type RoomLoader } from "../../../types";

type NotJoinedProps = {
  roomLoader: RoomLoader;
  userInitials: string;
  handleMicToggle: () => void;
  micEnabled: boolean;
  micPermissionGranted: boolean | null;
  joinRoom: () => void;
  error: string | null;
  userJoinLoading: boolean;
  count: number;
};

const NotJoined = ({
  roomLoader,
  userInitials,
  handleMicToggle,
  micEnabled,
  micPermissionGranted,
  joinRoom,
  error,
  userJoinLoading,
  count,
}: NotJoinedProps) => {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
            You're about to join
          </p>
          <h1 className="text-white text-xl font-semibold leading-snug line-clamp-2">
            {roomLoader.roomData?.topic}
          </h1>
        </div>

        <div className="relative">
          <div className="w-24 h-24 rounded-full ring-2 ring-gray-700 overflow-hidden bg-gray-800 flex items-center justify-center">
            <Avatar className="size-24">
              <AvatarImage
                alt={roomLoader.userData?.fullName}
                src={roomLoader.userData?.avatar_url}
              />
              <AvatarFallback className="text-2xl bg-gray-800 text-white">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <p className="text-gray-300 text-base font-medium">
          {roomLoader.userData?.fullName}
        </p>

        <button
          type="button"
          onClick={handleMicToggle}
          className={cn(
            "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200",
            micEnabled
              ? "border-emerald-700/60 bg-emerald-950/40 text-emerald-300"
              : "border-gray-700 bg-gray-900 text-gray-400"
          )}
        >
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
              micEnabled ? "bg-emerald-800/60" : "bg-gray-800"
            )}
          >
            {micEnabled ? (
              <Mic className="w-5 h-5" />
            ) : (
              <MicOff className="w-5 h-5" />
            )}
          </div>
          <div className="text-left">
            <p className="text-sm font-medium">
              {micEnabled ? "Microphone on" : "Microphone off"}
            </p>
            <p className="text-xs opacity-60 mt-0.5">
              {micEnabled
                ? "Others will hear you"
                : "You'll join muted — tap to enable"}
            </p>
          </div>
          <div
            className={cn(
              "ml-auto w-5 h-5 rounded-full border-2 transition-colors shrink-0",
              micEnabled
                ? "bg-emerald-400 border-emerald-400"
                : "border-gray-600"
            )}
          />
        </button>

        {micPermissionGranted === false && (
          <p className="text-xs text-red-400 text-center -mt-2">
            Microphone access was denied. Check your browser settings.
          </p>
        )}

        {error && <p className="text-xs text-red-400 text-center">{error}</p>}

        <Button
          onClick={joinRoom}
          disabled={userJoinLoading}
          className="w-full h-12 rounded-2xl bg-white text-black hover:bg-gray-100 font-semibold text-sm transition-all"
        >
          {userJoinLoading ? (
            <>
              <Loader className="animate-spin w-4 h-4 mr-2" /> Joining…
            </>
          ) : (
            "Join Room"
          )}
        </Button>

        <p className="text-xs text-gray-600">
          {count > 0
            ? `${count} ${count === 1 ? "person" : "people"} already inside`
            : "Be the first to join"}
        </p>
      </div>
    </div>
  );
};

export default NotJoined;
