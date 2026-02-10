import { createRoot } from "react-dom/client";
import { createBrowserRouter, redirect, RouterProvider } from "react-router";
import App from "./App.tsx";
import { TooltipProvider } from "./components/ui/tooltip.tsx";
import "./index.css";
import { supabase } from "./lib/supabaseClient.ts";
import Room from "./pages/protected/room/Room.tsx";
import { RoomsProvider } from "./provider/roomsContext.tsx";

async function requireAuth() {
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    throw redirect("/"); // acts like middleware redirect
  }
  return data.session.user;
}

async function getUser() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.user ? data.session.user : null;
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
