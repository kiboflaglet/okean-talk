import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import SignInButton from "./sign-in-button";

type SignInDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  description: string;
};

export function SignInDialog({
  open,
  onOpenChange,
  description,
}: SignInDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="min-w-xl sm:max-w-sm  ">
        <DialogHeader className="mb-5">
          <DialogTitle>Sign in</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <SignInButton showTitle />
      </DialogContent>
    </Dialog>
  );
}
