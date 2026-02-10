import { useMemo } from "react";
import { useSelector } from 'react-redux';
import { roomsSelect } from "../features/rooms/roomSlice";
import RoomSingle from "./room-single";

const Rooms = () => {

  const rooms = useSelector(roomsSelect)

  const copyRoomId = (id: string) => {
    navigator.clipboard.writeText(id);
  };

  const modifiedRooms = useMemo(() => {
    return [...rooms].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [rooms]);

  return (
    <section className="grid grid-cols-1 gap-x-15 gap-y-8  pb-10 md:grid-cols-2 lg:grid-cols-3 mt-6">
      {modifiedRooms.map((item) => (
        <RoomSingle key={item.id} {...item} copyId={() => copyRoomId(item.id)} />
      ))}
    </section>
  );
};

export default Rooms;
