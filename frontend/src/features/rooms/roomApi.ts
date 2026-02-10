import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import { createApi } from "@reduxjs/toolkit/query/react";

export type Post = {
  id: number;
  title: string;
};

const postsApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://jsonplaceholder.typicode.com/",
  }),
  endpoints: (builder) => ({
    getPosts: builder.query<Post[], void>({
      query: () => "/posts",
    }),
    getPost: builder.query<Post, number>({
      query: (id) => "/posts/" + id,
    }),
  }),
});

export default postsApi;
export const { useGetPostsQuery, useGetPostQuery } = postsApi;
