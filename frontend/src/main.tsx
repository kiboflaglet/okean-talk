import { createRoot } from "react-dom/client";
import { createBrowserRouter, redirect, RouterProvider } from "react-router";
import App from "./App.tsx";
import { TooltipProvider } from "./components/ui/tooltip.tsx";
import "./index.css";
import { supabase } from "./lib/supabaseClient.ts";
import Room from "./pages/protected/room/Room.tsx";
import { RoomsProvider } from "./provider/roomsContext.tsx";
import type { HomeLoader } from "./types.ts";

async function requireAuth() {
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    throw redirect("/"); // acts like middleware redirect
  }
  return data.session.user;
}

async function getUser() {
  const { data: sessionData } = await supabase.auth.getSession();
  const authUser = sessionData?.session?.user;
  if (!authUser) return null;

  const { data: userData, error } = await supabase
    .from("users")
    .select("*")
    .eq("auth_id", authUser.id) // assuming your users table has auth_id column
    .single(); // get one row

  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }

  const data: HomeLoader = {
    userData
  }


  console.log(data)


  return data;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    loader: getUser,
  },
  {
    path: "/room",
    element: <Room />,
    loader: requireAuth,
  },
]);

createRoot(document.getElementById("root")!).render(
  <TooltipProvider>
    <RoomsProvider>
      <RouterProvider router={router} />
    </RoomsProvider>
  </TooltipProvider>
);
