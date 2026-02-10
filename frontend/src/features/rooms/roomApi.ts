// import { fetchBaseQuery } from "@reduxjs/toolkit/query";
// import { createApi } from "@reduxjs/toolkit/query/react";

// export type Post = {
//   id: number;
//   title: string;
// };

// const postsApi = createApi({
//   reducerPath: "api",
//   baseQuery: fetchBaseQuery({
//     baseUrl: "https://jsonplaceholder.typicode.com/",
//   }),
//   endpoints: (builder) => ({
//     getPosts: builder.query<Post[], void>({
//       query: () => "/posts",
//     }),
//     getPost: builder.query<Post, number>({
//       query: (id) => "/posts/" + id,
//     }),
//   }),
// });

// export default postsApi;
// export const { useGetPostsQuery, useGetPostQuery } = postsApi;

import type { IRoom } from '../../../src/interfaces';
import { supabase } from '../../../src/lib/supabaseClient';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';


// createApi needs a “baseQuery” even though we’ll use Supabase
export const roomsApi = createApi({
  reducerPath: 'roomsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  tagTypes: ['Rooms'],
  endpoints: builder => ({
    getRooms: builder.query<IRoom[], void>({
      queryFn: async () => {
        const { data, error } = await supabase.from('rooms').select('*');
        if (error) return { error: { status: 500, data: error.message } };
        return { data: data || [] };
      },
      providesTags: ['Rooms'],
    }),
    addRoom: builder.mutation<IRoom, Partial<IRoom>>({
      queryFn: async (room) => {
        const { data, error } = await supabase.from('rooms').insert([room]).select().single();
        if (error) return { error: { status: 500, data: error.message } };
        return { data };
      },
      invalidatesTags: ['Rooms'],
    }),
    updateRoom: builder.mutation<IRoom, { id: string; updates: Partial<IRoom> }>({
      queryFn: async ({ id, updates }) => {
        const { data, error } = await supabase.from('rooms').update(updates).eq('id', id).select().single();
        if (error) return { error: { status: 500, data: error.message } };
        return { data };
      },
      invalidatesTags: ['Rooms'],
    }),
    deleteRoom: builder.mutation<IRoom, string>({
      queryFn: async (id) => {
        const { data, error } = await supabase.from('rooms').delete().eq('id', id).select().single();
        if (error) return { error: { status: 500, data: error.message } };
        return { data };
      },
      invalidatesTags: ['Rooms'],
    }),
  }),
});

export const {
  useGetRoomsQuery,
  useAddRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
} = roomsApi;

