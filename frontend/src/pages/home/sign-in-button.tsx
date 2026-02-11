import { useState } from "react";

import { Button } from "../../components/ui/button";
import { Icons } from "../../components/ui/icons";
import { supabase } from "../../lib/supabaseClient";
import { Loader } from "lucide-react";

type SignInButtonProps = {
  showTitle?: boolean;
};

export default function SignInButton({ showTitle = false }: SignInButtonProps) {
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
    <Button onClick={signInWithGoogle} disabled={isGoogleLoading}>
      {isGoogleLoading ? (
        <Loader className="size-4 animate-spin" />
      ) : (
        <>
          <Icons.google className="size-6" />
          {showTitle && "Sign in"}
        </>
      )}
    </Button>
  );
}
