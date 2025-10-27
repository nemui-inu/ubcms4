"use client";

import GridTable from "@/components/grid-table";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { Room } from "@/types/Room";
// import { Reading } from "@/types/Reading"; // unused
import ReadingModal from "@/components/modals/reading-modal";
import RoomModal from "@/components/modals/room-modal";

interface Props {
  initialRooms?: Room[];
}

/**
 * CollectorRoomsTable
 * Client component that shows only unread rooms that are not vacant.
 * Provides view and "Record Reading" actions only.
 */
const CollectorRoomsTable: React.FC<Props> = ({ initialRooms }) => {
  const [rooms, setRooms] = useState<Room[]>(initialRooms ?? []);

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [readingModalOpen, setReadingModalOpen] = useState(false);
  const [selectedRoomForReading, setSelectedRoomForReading] =
    useState<Room | null>(null);

  const supabase = createClient();

  const fetchRooms = async () => {
    try {
      const { data } = await supabase
        .from("rooms")
        .select("*")
        .eq("is_read", false);
      const rows = (data as Room[] | null) ?? [];
      // filter out vacant (case-insensitive)
      const filtered = rows.filter(
        (r) => (r.status ?? "").toLowerCase() !== "vacant"
      );
      setRooms(filtered);
    } catch (err) {
      console.error("Error fetching rooms for collector table:", err);
      // fall back to initialRooms if present
      setRooms(initialRooms ?? []);
    }
  };

  type ReadingRow = {
    id: string;
    room_id: number;
    building_name: string;
    room_number: string;
    utility_type: string;
    previous_reading?: number | null;
    current_reading?: string;
  };

  const openModal = (room?: Room) => {
    setSelectedRoom(room ?? null);
    setModalOpen(true);
  };

  const openReadingModal = (room?: Room) => {
    console.log("openReadingModal called with room:", room);
    setSelectedRoomForReading(room ?? null);
    setReadingModalOpen(true);
  };

  const handleView = async (room: Room) => openModal(room);
  const handleRecordReading = async (room: Room) => {
    console.log("handleRecordReading called with room:", room);
    openReadingModal(room);
  };

  const refreshRooms = async () => {
    await fetchRooms();
  };

  const handleReadingSubmit = async () => {
    // After the ReadingModal performs insertion (via its own onSubmit),
    // refresh the table to show updated read/unread state.
    setReadingModalOpen(false);
    await refreshRooms();
  };

  // Ensure we keep only unread, non-vacant rooms (state should already be filtered)
  const filtered = rooms.filter(
    (r) => !r.is_read && (r.status ?? "").toLowerCase() !== "vacant"
  );

  useEffect(() => {
    // fetch live data on mount (client-side)
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <GridTable
        rowData={filtered}
        columnDefs={[
          { field: "id" },
          { field: "building_name" },
          { field: "room_number" },
          { field: "owner_id" },
          { field: "status" },
          { field: "is_read" },
        ]}
        onView={handleView}
        onRecordReading={handleRecordReading}
        onCreate={() => {
          setSelectedRoomForReading(null);
          setReadingModalOpen(true);
        }}
        buttonName="Room"
      />

      <RoomModal
        open={modalOpen}
        mode={"view"}
        onClose={() => setModalOpen(false)}
        defaultValues={selectedRoom ?? undefined}
      />

      <ReadingModal
        open={readingModalOpen}
        mode={"create"}
        onSubmit={handleReadingSubmit}
        onClose={() => setReadingModalOpen(false)}
        defaultValues={
          selectedRoomForReading
            ? { room_id: selectedRoomForReading.id }
            : undefined
        }
      />
    </>
  );
};

export default CollectorRoomsTable;
