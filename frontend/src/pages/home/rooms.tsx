import { useRoomsContext } from "../../provider/roomsContext";
import RoomSingle from "./room-single";

const Rooms = () => {

  const {rooms, error} = useRoomsContext()

  const copyRoomId = (id: string) => {
    navigator.clipboard.writeText(id);
  };

  return (
    <section className="grid grid-cols-1 gap-x-15 gap-y-8  pb-10 md:grid-cols-2 lg:grid-cols-3 mt-6">
      {error}
      {rooms.map((item) => (
        <RoomSingle key={item.id} {...item} copyId={() => copyRoomId(item.id)} />
      ))}
    </section>
  );
};

export default Rooms;
