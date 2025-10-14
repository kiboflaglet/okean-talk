import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { useTransition } from "react";
import { Button } from "../ui/button";

const DeleteConfirmationDialog = ({ open, onClose, onConfirm
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  toastMessage?: string;
}) => {
  const [isPending, startTransition] = useTransition();

  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="z-[10000]">
        <AlertDialogHeader>
          <AlertDialogTitle>Əminsiniz?</AlertDialogTitle>
          <AlertDialogDescription>
            Silmə prosesi geri qaytarıla bilinmir. Bununla bağlı olan digər elementlərin məlumatları da silinə bilər.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Ləğv et</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              className={isPending ? "pointer-events-none" : ""}
              onClick={(e) => {
                e.stopPropagation()
                startTransition(handleConfirm)
              }}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? "Silinir.." : "Davam et"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmationDialog;