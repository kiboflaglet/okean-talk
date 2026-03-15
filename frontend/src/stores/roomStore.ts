import { create } from "zustand";
import type { IRoom } from "@/interfaces";

interface RoomState {
  roomId: string | null;
  roomData: IRoom | null;

  userJoined: boolean;
  joinLoading: boolean;
  micEnabled: boolean;
  isMuted: boolean;

  setRoomId: (id: string | null) => void;
  setRoomData: (data: IRoom | null) => void;

  joinRoom: () => void;
  leaveRoom: () => void;

  toggleMute: () => void;
  setMicEnabled: (value: boolean) => void;
}

export const useRoomStore = create<RoomState>((set, get) => ({
  roomId: null,
  roomData: null,
  userJoined: false,
  joinLoading: false,
  micEnabled: true,
  isMuted: false,

  setRoomId: (id) => set({ roomId: id }),

  setRoomData: (data) => set({ roomData: data }),

  joinRoom: () => set({ userJoined: true }),

  leaveRoom: () =>
    set({
      userJoined: false,
      isMuted: false,
    }),

  toggleMute: () =>
    set((state) => ({
      isMuted: !state.isMuted,
    })),

  setMicEnabled: (value) => set({ micEnabled: value }),
}));