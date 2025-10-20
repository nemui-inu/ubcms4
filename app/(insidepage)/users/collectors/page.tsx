import { createClient } from "@/lib/supabase/server";
import CollectorsTable from "./collectors-table";

const page = async () => {
  const supabase = await createClient();
  const { data: tenants } = await supabase
    .from("users")
    .select()
    .eq("role", "Collector");

  return <CollectorsTable initialUsers={tenants ?? []} />;
};

export default page;
