import { createClient } from "@/lib/supabase/server";
import TenantsTable from "./tenants-table";

const page = async () => {
  const supabase = await createClient();
  const { data: tenants } = await supabase
    .from("users")
    .select()
    .eq("role", "Tenant");

  return <TenantsTable initialUsers={tenants ?? []} />;
};

export default page;
