// lib/services/userContextService.ts
import { supabase } from "@/lib/supabaseClient";
import { UserService } from "@/lib/services/user.service";
import { User } from "@/lib/types";
import { toast } from "sonner";

const userService = new UserService();

/**
 * Fetches the current user from Supabase and your DB, updates local state if provided.
 */
export const refreshUser = async (setUser?: (user: User | null) => void): Promise<User | null> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const u = sessionData.session?.user ?? null;

    if (!u) {
      setUser?.(null);
      return null;
    }

    // Try to get user by auth_id
    const res = await userService.getByAuthId(u.id);

    if (res.success && res.data) {
      // Update user info in DB
      await userService.updateByAuth(u.id, {
        name: u.user_metadata?.name || u.email,
        email: u.email || "",
        picture: u.user_metadata?.picture || null,
      });
      setUser?.(res.data);
      return res.data;
    }

    // Create new user if not found
    const createRes = await userService.create({
      auth_id: u.id,
      name: u.user_metadata?.name || u.email,
      email: u.email || "",
      picture: u.user_metadata?.picture || null,
    });

    if (createRes.success) {
      setUser?.(createRes.data ?? null);
      return createRes.data ?? null;
    } else {
      toast.error(createRes.error);
      setUser?.(null);
      return null;
    }
  } catch (err) {
    toast("Error occurred", { description: String(err) });
    setUser?.(null);
    return null;
  }
};

/**
 * Optional: subscribe to auth changes and auto-refresh user
 */
export const subscribeUserChanges = (setUser: (user: User | null) => void) => {
  const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
    refreshUser(setUser);
  });

  return () => listener.subscription.unsubscribe();
};
