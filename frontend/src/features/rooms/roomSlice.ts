import type { RootState } from "@/src/app/store";
import { rooms } from "../../data";
import type { IRoom } from "@/src/interfaces";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type RoomState = {
    rooms: IRoom[]
}

const initialState: RoomState = {
    rooms: rooms
}

const roomSlice = createSlice({
  name: "Rooms",
  initialState,
  reducers: {
    addRoom: (state, action: PayloadAction<IRoom>) => {
      state.rooms.push(action.payload);
    },
  },
});

export const roomsSelect = (state: RootState) => state.roomReducer.rooms

export const { addRoom } = roomSlice.actions;
export const roomReducer = roomSlice.reducer;
