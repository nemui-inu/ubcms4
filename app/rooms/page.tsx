import { createClient } from "@/lib/supabase/server";
import RoomTable from "./room-table";

export default async function Page() {
  const supabase = await createClient();
  const { data: rooms } = await supabase.from("rooms").select();

  // <pre>{JSON.stringify(rooms, null, 2)}</pre>;

  return (
    <div className="flex flex-1">
      <RoomTable initialRooms={rooms ?? []} />
    </div>
  );
}
