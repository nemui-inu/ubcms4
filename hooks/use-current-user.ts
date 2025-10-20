"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function useCurrentUser() {
  const supabase = createClient();
  const router = useRouter();
  const [userData, setUserData] = useState<{
    id: number;
    mil_rank: string;
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);

      // Get the logged-in user from auth
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setUserData(null);
        setLoading(false);
        return;
      }

      // Fetch from public.users table
      const { data, error } = await supabase
        .from("users")
        .select("id, mil_rank, user_id, first_name, last_name, email, role")
        .eq("user_id", user.id)
        .single();

      if (error) {
        setUserData(null);
      } else {
        setUserData(data);
      }

      setLoading(false);
    }
    fetchUser();
    // ✅ Subscribe to auth changes (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event) => {
      if (_event === "SIGNED_IN" || _event === "TOKEN_REFRESHED") {
        fetchUser(); // re-fetch when user logs in or token refreshes
      }
      if (_event === "SIGNED_OUT") {
        setUserData(null);
      }
    });

    // Cleanup subscription when unmounting
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Logout function
  async function signOut() {
    router.replace("/auth/login"); // Redirect to login page
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error logging out:", error);
  }

  return { userData, loading, signOut };
}
