import {
    createBrowserRouter,
    redirect,
    type LoaderFunctionArgs
} from "react-router";
import React from "react";
const PrivacyAndTerms = React.lazy(() => import("@/pages/privacy-and-terms/PrivacyAndTerms.tsx")) 
const RoomPage = React.lazy(() => import("@/pages/protected/room/RoomPage.tsx")) 
import type { HomeLoader, RoomLoader } from "@/types.ts";
import { supabase } from "@/lib/supabaseClient";
import Home from "@/pages/Home";


async function roomLoader({ params }: LoaderFunctionArgs) {
  const { id: roomId } = params;
  if (!roomId) {
    throw new Response("Not Found", { status: 404 });
  }
  const { data: sessionData } = await supabase.auth.getSession();

  const authUser = sessionData?.session?.user;
  if (!authUser) {
    throw redirect("/");
  }

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("auth_id", authUser.id)
    .single();

  if (userError) {
    throw redirect("/");
  }

  const { data: roomData, error: roomError } = await supabase
    .from("rooms")
    .select(
      `*, users:roomparticipants (
       participant:users!roomparticipants_participantid_fkey(*)
      )`
    )
    .eq("id", roomId)
    .single();

  const data: RoomLoader = {
    userData,
    roomData: roomError ? null : roomData,
  };

  return data;
}

async function homeLoader() {
  const { data: sessionData } = await supabase.auth.getSession();
  const authUser = sessionData?.session?.user;
  if (!authUser) return null;

  const { data: userData, error } = await supabase
    .from("users")
    .select("*")
    .eq("auth_id", authUser.id)
    .single();

  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }

  const data: HomeLoader = {
    userData: userData || null,
  };

  return data;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    loader: homeLoader,
  },
  {
    path: "/room/:id",
    element: <RoomPage />,
    loader: roomLoader,
  },
  {
    path: "/privacy-and-terms",
    element: <PrivacyAndTerms />,
  },
]);