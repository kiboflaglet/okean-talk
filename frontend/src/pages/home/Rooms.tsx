import { useRoomsContext } from "@/provider/roomsContext";
import type { HomeLoader } from "@/types";
import { MessageSquareDashed } from "lucide-react";
import { useState } from "react";
import { useLoaderData } from "react-router";
import RoomSingle from "./RoomSingle";
import { SignInDialog } from "./SignInDialog";
import { RoomCreate } from "./RoomForm";
import type { IRoom } from "@/interfaces";
import { RoomDelete } from "./RoomDelete";

export const Rooms = () => {
  const { rooms, loading } = useRoomsContext();
  const loaderData: HomeLoader = useLoaderData();
  const [signInOpen, setSignInOpen] = useState(false);
  const [openRoomForm, setOpenRoomForm] = useState(false);
  const [editRoomData, setEditRoomData] = useState<IRoom | null>(null);
  const [openDeleteRoom, setOpenDeleteRoom] = useState(false);
  const [deleteRoomId, setDeleteRoomId] = useState<string | null>(null);

  return (
    <section className="mt-6 pb-10">
      {loading && (
        <div className="grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <RoomCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && rooms.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <MessageSquareDashed className="w-7 h-7 text-gray-400 dark:text-gray-500" />
          </div>
          <div>
            <p className="font-semibold text-gray-700 dark:text-gray-300">
              No rooms yet
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Be the first — tap the <strong>+</strong> icon to create one
            </p>
          </div>
        </div>
      )}

      {!loading && rooms.length > 0 && (
        <div className="grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
          {rooms.map((item, i) => (
            <div
              key={item.id}
              className="animate-zoom-in"
              style={{
                animationDelay: `${i * 40}ms`,
                animationFillMode: "both",
              }}
            >
              <RoomSingle
                joinRoom={() => {
                  if (!loaderData?.userData) {
                    setSignInOpen(true);
                  } else {
                    window.open(
                      `${window.location.origin}/room/${item.id}`,
                      "_blank"
                    );
                  }
                }}
                isOwner={loaderData?.userData?.id === item.ownerId}
                onEdit={(e) => {
                  setEditRoomData(e);
                  setOpenRoomForm(true);
                }}
                onDelete={(e) => {
                  setDeleteRoomId(e)
                  setOpenDeleteRoom(true);
                }}
                {...item}
              />
            </div>
          ))}
        </div>
      )}

      <RoomCreate
        canCreate
        isEdit
        room={editRoomData}
        open={openRoomForm}
        onOpenChange={setOpenRoomForm}
        onSuccess={() => {
          setOpenRoomForm(false);
        }}
      />


      <RoomDelete
        roomId={deleteRoomId}
        open={openDeleteRoom}
        onOpenChange={setOpenDeleteRoom}
        onSuccess={() => {
          setOpenDeleteRoom(false);
        }}
      />

      <SignInDialog
        description="You need to have an account to join a room"
        open={signInOpen}
        onOpenChange={setSignInOpen}
      />
    </section>
  );
};

function RoomCardSkeleton() {
  return (
    <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 h-64 flex flex-col justify-between animate-pulse">
      <div className="flex justify-between">
        <div className="h-5 w-32 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="h-8 w-9 rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-3/4 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-1/2 rounded-full bg-gray-200 dark:bg-gray-700" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700"
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="space-y-1.5">
          <div className="h-3 w-24 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </div>
  );
}

export default Rooms;
