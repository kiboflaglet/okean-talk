import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { TooltipProvider } from "./components/ui/tooltip.tsx";
import { router } from "./config/router.tsx";
import "./index.css";
import { RoomsProvider } from "./provider/roomsContext.tsx";

createRoot(document.getElementById("root")!).render(
  <TooltipProvider>
    <RoomsProvider>
      <RouterProvider router={router} />
      <Toaster />
    </RoomsProvider>
  </TooltipProvider>
);
