import { useState } from "react";
import { useLoaderData } from "react-router";
import { useRoomsContext } from "../../provider/roomsContext";
import type { HomeLoader } from "../../types";
import RoomSingle from "./room-single";
import { SignInDialog } from "./sign-in-dialog";

const Rooms = () => {
  const { rooms } = useRoomsContext();

  const loaderData: HomeLoader = useLoaderData();

  const [signInOpen, setSignInOpen] = useState(false);

  return (
    <section className="grid grid-cols-1 gap-x-15 gap-y-8  pb-10 md:grid-cols-2 lg:grid-cols-3 mt-6">
      {rooms.length <= 0 &&  <span className="text-gray-10">No room found, be the first one, click on + icon</span>}
      {rooms.map((item) => (
        <RoomSingle
          joinRoom={() => {
            if (!loaderData?.userData) {
              setSignInOpen(true);
            } else {
              window.open(`http://localhost:5173/room/${item.id}`, "_blank");
            }
          }}
          key={item.id}
          {...item}
        />
      ))}
      <SignInDialog
        description="You need to sign in to join a room"
        open={signInOpen}
        onOpenChange={setSignInOpen}
      />
    </section>
  );
};

export default Rooms;
