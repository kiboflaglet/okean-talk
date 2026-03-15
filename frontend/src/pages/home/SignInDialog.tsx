import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import SignInButton from "./SignInButton";

type SignInDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  description: string;
};

export function SignInDialog({ open, onOpenChange, description }: SignInDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-sm rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-xl">
        <div className="mx-auto mb-2 w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="w-6 h-6 text-gray-600 dark:text-gray-300"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
        </div>

        <DialogHeader className="text-center space-y-1.5">
          <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Sign in to continue
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          <SignInButton showTitle />
        </div>
      </DialogContent>
    </Dialog>
  );
}