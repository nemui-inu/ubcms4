import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const { data: rooms } = await supabase.from("rooms").select();

  return <pre>{JSON.stringify(rooms, null, 2)}</pre>;
}
