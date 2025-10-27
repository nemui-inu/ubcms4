import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const Page = async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (user) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data } = await supabase
      .from("users")
      .select("id, mil_rank, user_id, first_name, last_name, email, role")
      .eq("user_id", user?.id)
      .single();

    const userData = data;

    if (userData?.role !== "Tenant" && userData?.role !== "Admin") {
      redirect("/dashboard-collector");
    } else if (userData?.role !== "Admin") {
      redirect("/dashboard-tenant");
    } else {
      redirect("/dashboard");
    }

    // redirect("/dashboard");
  } else {
    redirect("auth/login");
  }

  return <div>page</div>;
};

export default Page;
