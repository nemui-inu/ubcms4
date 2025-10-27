"use client";

import GridTable from "@/components/grid-table";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { Room } from "@/types/Room";
import { Reading } from "@/types/Reading";
import ReadingModal from "@/components/modals/reading-modal";
import RoomModal from "@/components/modals/room-modal";

interface Props {
  initialRooms?: Room[];
}

type ReadingRow = {
  id: string;
  room_id: number;
  building_name: string;
  room_number: string;
  utility_type: string;
  previous_reading?: number | null;
  current_reading?: string;
};

const UTILITY_OPTIONS = ["electricity", "water"] as const;

/**
 * CollectorReadingsTable
 * Shows unread non-vacant rooms and a row per utility with previous/current reading
 */
const CollectorReadingsTable: React.FC<Props> = ({ initialRooms }) => {
  const [rooms, setRooms] = useState<Room[]>(initialRooms ?? []);
  const [readingRows, setReadingRows] = useState<ReadingRow[]>([]);

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [roomModalOpen, setRoomModalOpen] = useState(false);

  const [readingModalOpen, setReadingModalOpen] = useState(false);
  const [selectedReadingRow, setSelectedReadingRow] =
    useState<ReadingRow | null>(null);

  const supabase = createClient();

  const fetchRooms = async () => {
    try {
      const { data } = await supabase
        .from("rooms")
        .select("*")
        .eq("is_read", false);
      const rows = (data as Room[] | null) ?? [];
      const filtered = rows.filter(
        (r) => (r.status ?? "").toLowerCase() !== "vacant"
      );
      setRooms(filtered);
      return filtered;
    } catch (err) {
      console.error("Error fetching rooms for collector readings table:", err);
      setRooms(initialRooms ?? []);
      return initialRooms ?? [];
    }
  };

  const buildReadingRows = async (filteredRooms: Room[]) => {
    if (!filteredRooms || filteredRooms.length === 0) {
      setReadingRows([]);
      return;
    }

    const roomIds = filteredRooms.map((r) => r.id);
    try {
      const { data: reads } = await supabase
        .from("readings")
        .select(
          "room_id, utility_type, current_reading, last_reading, created_at"
        )
        .in("room_id", roomIds)
        .order("created_at", { ascending: false });

      const latestMap = new Map<
        string,
        {
          room_id?: number;
          utility_type?: string;
          current_reading?: number;
          last_reading?: number;
          created_at?: string;
        }
      >();
      if (Array.isArray(reads)) {
        for (const rd of reads) {
          const key = `${rd.room_id}:${String(rd.utility_type)}`;
          if (!latestMap.has(key)) latestMap.set(key, rd);
        }
      }

      const rows: ReadingRow[] = [];
      for (const rm of filteredRooms) {
        for (const u of UTILITY_OPTIONS) {
          const key = `${rm.id}:${u}`;
          const last = latestMap.get(key);
          rows.push({
            id: `${rm.id}-${u}`,
            room_id: rm.id,
            building_name: rm.building_name,
            room_number: rm.room_number,
            utility_type: String(u),
            previous_reading: last
              ? Number(last.current_reading ?? last.last_reading ?? 0)
              : null,
            current_reading: "",
          });
        }
      }

      setReadingRows(rows);
    } catch (err) {
      console.error("Error building reading rows:", err);
      setReadingRows([]);
    }
  };

  const refresh = async () => {
    const filtered = await fetchRooms();
    await buildReadingRows(filtered);
  };

  useEffect(() => {
    // initial client-side load
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openRoomView = (roomId: number) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room) {
      setSelectedRoom(room);
      setRoomModalOpen(true);
    }
  };

  const openReadingModal = (row: ReadingRow) => {
    setSelectedReadingRow(row);
    setReadingModalOpen(true);
  };

  const handleReadingSubmit = async (
    data: Reading | Record<string, unknown>
  ) => {
    const raw = data as unknown as Record<string, string>;
    const payload: Record<string, unknown> = {};

    if (raw.room_id !== undefined && raw.room_id !== "") {
      const n = Number(raw.room_id);
      payload.room_id = Number.isNaN(n) ? null : Math.trunc(n);
    } else if (selectedReadingRow) {
      payload.room_id = selectedReadingRow.room_id;
    }

    payload.utility_type = raw.utility_type
      ? String(raw.utility_type)
      : selectedReadingRow?.utility_type ?? "";

    if (raw.last_reading !== undefined && raw.last_reading !== "") {
      const lr = Number(raw.last_reading);
      payload.last_reading = Number.isNaN(lr) ? null : Math.trunc(lr);
    }
    if (raw.current_reading !== undefined && raw.current_reading !== "") {
      const cr = Number(raw.current_reading);
      payload.current_reading = Number.isNaN(cr) ? null : Math.trunc(cr);
    }

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert("You must be logged in to record a reading");
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        alert("Unable to resolve collector identity");
        return;
      }

      if (
        profileData &&
        typeof (profileData as { id?: unknown }).id === "number"
      ) {
        payload.collector_id = (profileData as { id: number }).id;
      } else {
        alert("No application profile found for the logged-in user.");
        return;
      }
    } catch (err) {
      console.error(err);
      alert("Unexpected error while resolving collector identity");
      return;
    }

    if (!payload.room_id) {
      alert("Invalid room selected for reading");
      return;
    }
    if (
      payload.last_reading === null ||
      payload.last_reading === undefined ||
      payload.current_reading === null ||
      payload.current_reading === undefined
    ) {
      alert("Please provide both last and current readings");
      return;
    }

    const { error } = await supabase.from("readings").insert([payload]);
    if (error) {
      console.error(error);
      alert("Failed to create reading");
      return;
    }

    setReadingModalOpen(false);
    await refresh();
  };

  return (
    <>
      <GridTable
        rowData={readingRows}
        columnDefs={[
          { field: "building_name" },
          { field: "room_number" },
          { field: "utility_type" },
          { field: "previous_reading" },
          { field: "current_reading" },
        ]}
        onView={(row: ReadingRow) => openRoomView(row.room_id)}
        onRecordReading={(row: ReadingRow) => openReadingModal(row)}
        buttonName="Reading"
      />

      <RoomModal
        open={roomModalOpen}
        mode={"view"}
        onClose={() => setRoomModalOpen(false)}
        defaultValues={selectedRoom ?? undefined}
      />

      <ReadingModal
        open={readingModalOpen}
        mode={"create"}
        onClose={() => setReadingModalOpen(false)}
        onSubmit={handleReadingSubmit}
        defaultValues={
          selectedReadingRow
            ? {
                room_id: selectedReadingRow.room_id,
                utility_type: selectedReadingRow.utility_type,
                last_reading: selectedReadingRow.previous_reading ?? 0,
              }
            : undefined
        }
      />
    </>
  );
};

export default CollectorReadingsTable;
