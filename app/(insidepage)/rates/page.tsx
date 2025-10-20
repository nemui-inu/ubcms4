import { createClient } from "@/lib/supabase/server";
import RatesTable from "./rates-table";

export default async function Page() {
  const supabase = await createClient();
  const { data: rates } = await supabase.from("rates").select();

  return <RatesTable initialRates={rates ?? []} />;
}
