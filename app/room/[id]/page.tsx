import { RoomService } from "@/lib/services/room.service";
import View from "./view";
import { Debug } from "@/components/custom/log";

// Dynamic route receives params automatically
export default async function RoomPage({ params }: { params: { id: string } }) {
    const roomId = params.id;

    const roomService = new RoomService()

    // Fetch the room from Supabase
    const res = await roomService.getById(roomId);

    if (!res.success || !res.data) return <p>Room not found</p>;

    const canJoin = (res.data.room_users?.length ?? 0) < res.data.limit


    if (!canJoin) {
        return <Debug data={'room is full'} />
    }  

    return <View room={res.data} />;
}
