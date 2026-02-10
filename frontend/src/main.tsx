import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { TooltipProvider } from "./components/ui/tooltip.tsx";
import { Provider } from "react-redux";
import store from "./app/store.ts";
import { createBrowserRouter, redirect, RouterProvider } from "react-router";
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
  // <StrictMode>
    <Provider store={store}>
      <TooltipProvider>
        <RoomsProvider>
          <RouterProvider router={router} />
        </RoomsProvider>
      </TooltipProvider>
    </Provider>
  // </StrictMode>
);
