import { CircleAlert, Loader } from "lucide-react";
import { useTransition } from "react";
import { useLoaderData } from "react-router";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { useRoomsContext } from "../../provider/roomsContext";
import { type HomeLoader } from "../../types";
import { RoomDeleteMobile } from "./RoomDeleteMobile";
import SignInButton from "./SignInButton";

type RoomDeleteProps = {
  roomId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function RoomDelete({
  open,
  onSuccess,
  roomId,
  onOpenChange,
}: RoomDeleteProps) {
  const { deleteRoom } = useRoomsContext();
  const { isMobile } = useBreakpoint();
  const loaderData: HomeLoader = useLoaderData();
  const [loadingForm, setLoadingForm] = useTransition();

  const onDelete = () => {
    if (!roomId) return;
    if (!loaderData?.userData) return;

    setLoadingForm(async () => {
      await deleteRoom(roomId);
      onSuccess?.();
    });
  };

  if (isMobile) {
    return (
      <RoomDeleteMobile
        roomId={roomId}
        userData={loaderData?.userData}
        loadingForm={loadingForm}
        onDelete={onDelete}
        formOpen={open}
        onFormOpenChange={onOpenChange}
      />
    );
  }
  return (
    <Dialog
      onOpenChange={(open) => {
        onOpenChange?.(open);
      }}
      open={open}
    >
      <DialogContent className="min-w-md ">
        {loaderData?.userData ? (
          <>
            <DialogHeader className="mb-5 ">
              <DialogTitle className={"text-3xl font-bold text-center"}>
                Delete the room
              </DialogTitle>
            </DialogHeader>

            <div className="flex items-center gap-2 justify-center text-xl text-destructive">
              <CircleAlert /> This action cannot be undone
            </div>

            <DialogFooter className="mt-5">
              <DialogClose>
                <Button variant={"outline"} className="text-lg py-4.5 px-6">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                className={"text-lg py-4.5 px-6"}
                variant={"destructive"}
                disabled={loadingForm}
                onClick={onDelete}
              >
                Delete
                {loadingForm && <Loader className="animate-spin" />}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader className="mb-5">
              <DialogTitle>Sign in</DialogTitle>
              <DialogDescription>
                You need to have an account to delete a room
              </DialogDescription>
            </DialogHeader>
            <SignInButton showTitle />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
