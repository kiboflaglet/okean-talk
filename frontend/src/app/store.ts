import { configureStore } from "@reduxjs/toolkit";
import { roomReducer  } from "../features/rooms/roomSlice";

const store = configureStore({
  reducer: {
    // [postsApi.reducerPath]: postsApi.reducer
    roomReducer
  },
  // middleware: (getDefaultMiddleware) => 
  //   getDefaultMiddleware().concat(postsApi.middleware)
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export default store;
