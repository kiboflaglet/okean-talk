import { create } from "zustand";
import type { IRoom, IUser } from "@/interfaces";
import { supabase } from "@/lib/supabaseClient";
import { handleError } from "@/lib/errorHandler";
import { NameToInitials } from "@/lib/utils";
import {
  roomParticipantCreateSchema,
  type roomParticipantCreate,
} from "@/pages/home/roomSchema";

interface RoomState {
  roomId: string | null;
  roomData: IRoom | null;
  userData: IUser | null;
  userJoined: boolean;
  joinLoading: boolean;
  leaveLoading: boolean;
  micEnabled: boolean;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  joinError: string | null;

  logOutLoading: boolean;
  logOut: () => Promise<void>;

  setRoomId: (id: string | null) => void;
  setRoomData: (data: IRoom | null) => void;
  setUserData: (data: IUser | null) => void;

  joinRoom: (roomId: string, userId: string) => Promise<void>;
  leaveRoom: (roomId: string, userId: string) => Promise<void>;

  setMicEnabled: (value: boolean) => void;
  fetchRoom: () => Promise<IRoom | null>;
  userInitials: string;

  roomLinkCopied: boolean;
  copyRoomLink: (roomId: string) => Promise<void>;
}

export const useRoomStore = create<RoomState>((set, get) => ({
  roomId: null,
  roomData: null,
  userData: null,
  userJoined: false,
  joinLoading: false,
  leaveLoading: false,
  micEnabled: true,
  isMuted: false,
  logOutLoading: false,
  userInitials: NameToInitials(get()?.userData?.fullName || ""),
  joinError: null,
  roomLinkCopied: false,

  setRoomId: (id) => set({ roomId: id }),

  setRoomData: (data) => set({ roomData: data }),
  setUserData: (data) => set({ userData: data }),

  joinRoom: async (roomId, userId) => {
    if (get().joinLoading || !roomId || !userId) return;
    set({ joinLoading: true });

    try {
      const validated = roomParticipantCreateSchema.safeParse({
        participantid: userId,
        roomid: roomId,
      } satisfies roomParticipantCreate);
      if (!validated.success) {
        set({ joinError: "Cannot join the room" });
        return;
      }

      const currentData = await get().fetchRoom();
      const alreadyJoined = currentData?.users?.find(
        (item) => item.participant.id === userId
      );

      if (alreadyJoined) {
        await supabase
          .from("roomparticipants")
          .delete()
          .eq("participantid", userId)
          .eq("roomid", roomId);
      }

      const fresh = await get().fetchRoom();
      if (!fresh) return;

      if ((fresh?.users?.length || 0) >= (fresh?.maxParticipants || 0)) {
        set({ joinError: "This room is full" });
        return;
      }

      const { error } = await supabase
        .from("roomparticipants")
        .insert([validated.data])
        .single();

      if (error) {
        set({ joinError: "Joining room failed" });
        handleError("Joining room failed", "joinRoom", String(error));
        return;
      }

      await get().fetchRoom();

      set({ userJoined: true });
    } finally {
      set({ joinLoading: false });
    }
  },

  leaveRoom: async (roomId, userId) => {
    if (get().leaveLoading || !roomId || !userId) return;

    set({ leaveLoading: true });

    try {
      await supabase
        .from("roomparticipants")
        .delete()
        .eq("roomid", roomId)
        .eq("participantid", userId);

      set({ userJoined: false });
    } catch (e) {
      handleError("Leaving room failed", "leaveRoom", String(e));
    } finally {
      set({ leaveLoading: false });
    }
  },

  setIsMuted(muted) {
    set({ isMuted: muted });
  },

  setMicEnabled: (value) => set({ micEnabled: value }),

  logOut: async () => {
    set({ logOutLoading: true });

    try {
      await supabase.auth.signOut();
      window.location.reload();
    } catch (e) {
      handleError("Logout failed", "Logout", String(e));
    } finally {
      set({ logOutLoading: false });
    }
  },

  fetchRoom: async () => {
    try {
      if (!get().roomId) return;
      const { data, error } = await supabase
        .from("rooms")
        .select(
          `*, users:roomparticipants (participant:users!roomparticipants_participantid_fkey(*))`
        )
        .eq("id", get().roomId)
        .single();
      if (error) {
        handleError("Logout failed", "fetchRoom", String(error));
        return;
      }
      set({ roomData: data });
      return data;
    } catch (e) {
      handleError("Logout failed", "fetchRoom", String(e));
    }
  },

  copyRoomLink: async (roomId) => {
    await navigator.clipboard.writeText(
      `${window.location.origin}/room/${roomId}`
    );
    set({ roomLinkCopied: true });
    setTimeout(() => set({ roomLinkCopied: false }), 2000);
  },
}));
