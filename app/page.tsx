import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const page = async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (user) {
    redirect("/dashboard");
  } else {
    redirect("auth/login");
  }

  return <div>page</div>;
};

export default page;
