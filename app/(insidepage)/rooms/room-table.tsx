"use client";
import GridTable from "@/components/grid-table";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { Room, RoomTableProps } from "@/types/Room";
import RoomModal from "@/components/modals/room-modal";
import ReadingModal from "@/components/modals/reading-modal";
import { Reading } from "@/types/Reading";

const RoomTable = ({ initialRooms, collectorMode }: RoomTableProps) => {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<
    "view" | "edit" | "delete" | "create"
  >("view");

  const [readingModalOpen, setReadingModalOpen] = useState(false);
  const [selectedRoomForReading, setSelectedRoomForReading] =
    useState<Room | null>(null);

  const supabase = createClient();

  const refreshRooms = async () => {
    const { data } = await supabase.from("rooms").select("*");
    setRooms((data as Room[] | null) ?? []);
  };

  const openModal = (
    mode: "view" | "edit" | "delete" | "create",
    room?: Room
  ) => {
    setSelectedRoom(room ?? null);
    setModalMode(mode);
    setModalOpen(true);
  };

  const openReadingModal = (room?: Room) => {
    setSelectedRoomForReading(room ?? null);
    setReadingModalOpen(true);
  };

  const handleView = async (room: Room) => openModal("view", room);
  const handleEdit = async (room: Room) => openModal("edit", room);
  const handleDelete = async (room: Room) => openModal("delete", room);
  const handleCreate = async () => openModal("create");

  const handleRecordReading = async (room: Room) => openReadingModal(room);

  const handleSubmit = async (data: Room) => {
    if (modalMode === "edit" && selectedRoom) {
      const raw = data as unknown as Record<string, string>;
      const payload: Record<string, unknown> = { ...raw };
      if (
        payload.owner_id !== undefined &&
        typeof payload.owner_id === "string"
      ) {
        const s = (payload.owner_id as string).trim();
        if (s === "") {
          // empty input -> treat as null (no owner)
          payload.owner_id = null;
        } else {
          const n = Number(s);
          payload.owner_id = Number.isNaN(n) ? null : n;
        }
      }
      if (
        payload.is_read !== undefined &&
        typeof payload.is_read === "string"
      ) {
        const v = (payload.is_read as string).toLowerCase();
        payload.is_read = v === "true" || v === "1";
      }
      if (payload.id !== undefined) delete payload.id;
      Object.keys(payload).forEach(
        (k) => payload[k] === undefined && delete payload[k]
      );

      // validate owner exists if provided (owner_id is nullable)
      if (payload.owner_id !== null && payload.owner_id !== undefined) {
        const ownerIdNum = Number(payload.owner_id as unknown);
        if (!Number.isNaN(ownerIdNum)) {
          const { data: owner } = await supabase
            .from("users")
            .select("id")
            .eq("id", ownerIdNum)
            .maybeSingle();
          if (!owner) {
            console.error("Owner id does not exist:", ownerIdNum);
            alert(
              "Owner not found. Please select an existing owner or leave owner blank."
            );
            return;
          }
          payload.owner_id = ownerIdNum;
        } else {
          alert("Invalid owner id");
          return;
        }
      }

      const { error } = await supabase
        .from("rooms")
        .update(payload)
        .eq("id", selectedRoom.id);
      if (error) console.error(error);
    } else if (modalMode === "delete" && selectedRoom) {
      const { error } = await supabase
        .from("rooms")
        .delete()
        .eq("id", selectedRoom.id);
      if (error) console.error(error);
    } else if (modalMode === "create") {
      const raw = data as unknown as Record<string, string>;
      const payload: Record<string, unknown> = { ...raw };
      if (
        payload.owner_id !== undefined &&
        typeof payload.owner_id === "string"
      ) {
        const s = (payload.owner_id as string).trim();
        if (s === "") {
          payload.owner_id = null;
        } else {
          const n = Number(s);
          payload.owner_id = Number.isNaN(n) ? null : n;
        }
      }
      if (
        payload.is_read !== undefined &&
        typeof payload.is_read === "string"
      ) {
        const v = (payload.is_read as string).toLowerCase();
        payload.is_read = v === "true" || v === "1";
      }
      if (payload.id !== undefined) delete payload.id;
      Object.keys(payload).forEach(
        (k) => payload[k] === undefined && delete payload[k]
      );

      // validate owner exists before insert
      if (payload.owner_id !== null && payload.owner_id !== undefined) {
        const ownerIdNum = Number(payload.owner_id as unknown);
        if (!Number.isNaN(ownerIdNum)) {
          const { data: owner } = await supabase
            .from("users")
            .select("id")
            .eq("id", ownerIdNum)
            .maybeSingle();
          if (!owner) {
            console.error("Owner id does not exist:", ownerIdNum);
            alert(
              "Owner not found. Please select an existing owner or leave owner blank."
            );
            return;
          }
          payload.owner_id = ownerIdNum;
        } else {
          alert("Invalid owner id");
          return;
        }
      }

      const { error } = await supabase.from("rooms").insert([payload]);
      if (error) console.error(error);
    }

    setModalOpen(false);
    await refreshRooms();
  };

  const handleReadingSubmit = async (data: Reading) => {
    // coerce and sanitize reading payload to match readings schema
    const raw = data as unknown as Record<string, string>;
    const payload: Record<string, unknown> = {};

    // room_id (locked in UI) - required
    if (raw.room_id !== undefined && raw.room_id !== "") {
      const n = Number(raw.room_id);
      payload.room_id = Number.isNaN(n) ? null : Math.trunc(n);
    } else if (selectedRoomForReading) {
      payload.room_id = selectedRoomForReading.id;
    }

    // utility_type (text)
    payload.utility_type = raw.utility_type ? String(raw.utility_type) : "";

    // last_reading and current_reading - bigint in DB but use number here
    if (raw.last_reading !== undefined && raw.last_reading !== "") {
      const lr = Number(raw.last_reading);
      payload.last_reading = Number.isNaN(lr) ? null : Math.trunc(lr);
    }
    if (raw.current_reading !== undefined && raw.current_reading !== "") {
      const cr = Number(raw.current_reading);
      payload.current_reading = Number.isNaN(cr) ? null : Math.trunc(cr);
    }

    // assign collector_id from logged-in user (must map to users.id)
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
        typeof (profileData as unknown as { id?: unknown }).id === "number"
      ) {
        const pd = profileData as unknown as { id: number };
        payload.collector_id = pd.id;
      } else {
        alert(
          "No application profile found for the logged-in user. Please contact an administrator."
        );
        return;
      }
    } catch (err) {
      console.error(err);
      alert("Unexpected error while resolving collector identity");
      return;
    }

    // basic validation
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
    await refreshRooms();
  };

  return (
    <>
      <GridTable
        rowData={rooms}
        columnDefs={[
          { field: "id" },
          { field: "building_name" },
          { field: "room_number" },
          { field: "owner_id" },
          { field: "status" },
          { field: "is_read" },
        ]}
        onView={handleView}
        {...(!collectorMode
          ? {
              onEdit: handleEdit,
              onDelete: handleDelete,
              onCreate: handleCreate,
            }
          : {})}
        onRecordReading={handleRecordReading}
        buttonName="Room"
      />

      <RoomModal
        open={modalOpen}
        mode={modalMode}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        defaultValues={selectedRoom ?? undefined}
      />

      <ReadingModal
        open={readingModalOpen}
        mode={"create"}
        onClose={() => setReadingModalOpen(false)}
        onSubmit={handleReadingSubmit}
        defaultValues={
          selectedRoomForReading
            ? { room_id: selectedRoomForReading.id }
            : undefined
        }
      />
    </>
  );
};

export default RoomTable;
