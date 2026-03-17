import { useDrawerStack } from "@/hooks/useDrawerStack";
import {
  CircleAlert,
  Loader
} from "lucide-react";
import { useEffect } from "react";
import { Button } from "../../components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from "../../components/ui/drawer";
import { type RoomLoader } from "../../types";
import SignInButton from "./SignInButton";

type RoomDeleteMobileProps = {
  roomId: string | null;
  onDelete: (roomId: string) => void;
  formOpen?: boolean;
  onFormOpenChange?: (open: boolean) => void;
  userData: RoomLoader["userData"];
  loadingForm: boolean;
};

export const RoomDeleteMobile = ({
  roomId,
  onDelete,
  onFormOpenChange,
  userData,
  loadingForm,
  formOpen = false,
}: RoomDeleteMobileProps) => {
  const { open, close, states } = useDrawerStack(1);
  const [roomFormOpen] = states;

  const openMainDrawer = () => open(0);
  const closeMainDrawer = () => close(0);

  const handleSubmit = (roomId: string | null) => {
    if (!roomId) return;
    onDelete(roomId);
    closeMainDrawer();
  };

  useEffect(() => {
    if (formOpen === undefined) return;
    if (formOpen) {
      openMainDrawer();
    } else {
      closeMainDrawer();
    }
  }, [formOpen]);

  return (
    <Drawer
      onOpenChange={(open) => {
        onFormOpenChange?.(open);
        if (open) openMainDrawer();
        else closeMainDrawer();
      }}
      open={roomFormOpen}
    >
      <DrawerContent>
        {userData ? (
          <>
            <DrawerHeader>
              <DrawerTitle>Delete the room</DrawerTitle>
            </DrawerHeader>

            <div className="flex items-center gap-2 justify-center text-md text-destructive">
              <CircleAlert /> This action cannot be undone
            </div>

            <DrawerFooter>
              <Button
                onClick={() => {
                  handleSubmit(roomId);
                }}
                className={"text-sm py-4.5 px-6  border-destructive/40"}
                disabled={loadingForm}
                variant="destructive"
              >
                Delete
                {loadingForm && <Loader className="animate-spin" />}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline" className={"text-sm py-4.5 px-6"}>
                  Cancel
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </>
        ) : (
          <>
            <DrawerHeader>
              <DrawerTitle>Sign in</DrawerTitle>
              <DrawerDescription>
                You need to have an account to delete a room
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 w-full shrink-0 mb-4">
              <SignInButton showTitle />
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
};
