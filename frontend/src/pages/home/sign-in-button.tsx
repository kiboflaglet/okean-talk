import { useState } from "react";

import { Button } from "../../components/ui/button";
import { Icons } from "../../components/ui/icons";
import { supabase } from "../../lib/supabaseClient";
import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";

type SignInButtonProps = {
  showTitle?: boolean;
  className?: string;
};

export default function SignInButton({
  showTitle = false,
  className,
}: SignInButtonProps) {
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);

  async function signInWithGoogle() {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      setIsGoogleLoading(false);
    }
  }

  return (
<Button
  variant="ghost"
  onClick={signInWithGoogle}
  disabled={isGoogleLoading}
  className={cn("border border-muted py-4 pr-1 w-full", className)}
>
      {isGoogleLoading ? (
        <Loader className="size-4 animate-spin" />
      ) : (
        <>
          <Icons.google className="size-6" />
          <span className="text-md font-semibold"> {showTitle && "Sign in"}</span>
        </>
      )}
    </Button>
  );
}
