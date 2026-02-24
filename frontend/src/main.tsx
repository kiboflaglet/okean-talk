import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  redirect,
  RouterProvider,
  type LoaderFunctionArgs,
} from "react-router";
import App from "./App.tsx";
import { TooltipProvider } from "./components/ui/tooltip.tsx";
import "./index.css";
import { supabase } from "./lib/supabaseClient.ts";
import RoomPage from "./pages/protected/room/RoomPage.tsx";
import { RoomsProvider } from "./provider/roomsContext.tsx";
import type { HomeLoader, RoomLoader } from "./types.ts";
import PrivacyAndTerms from "./pages/privacy-and-terms/PrivacyAndTerms.tsx";

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

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
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

createRoot(document.getElementById("root")!).render(
  <TooltipProvider>
    <RoomsProvider>
      <RouterProvider router={router} />
    </RoomsProvider>
  </TooltipProvider>
);
