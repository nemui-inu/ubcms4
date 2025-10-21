"use client";
import GridTable from "@/components/grid-table";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { Room, RoomTableProps } from "@/types/Room";
import RoomModal from "@/components/modals/room-modal";

const RoomTable = ({ initialRooms }: RoomTableProps) => {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<
    "view" | "edit" | "delete" | "create"
  >("view");

  const supabase = createClient();

  const refreshRooms = async () => {
    const { data } = await supabase.from("rooms").select("*");
    setRooms(data ?? []);
  };

  const openModal = (
    mode: "view" | "edit" | "delete" | "create",
    room?: Room
  ) => {
    setSelectedRoom(room ?? null);
    setModalMode(mode);
    setModalOpen(true);
  };

  const handleView = async (room: Room) => openModal("view", room);
  const handleEdit = async (room: Room) => openModal("edit", room);
  const handleDelete = async (room: Room) => openModal("delete", room);
  const handleCreate = async () => openModal("create");

  const handleSubmit = async (data: Room) => {
    if (modalMode === "edit" && selectedRoom) {
      const { error } = await supabase
        .from("rooms")
        .update(data)
        .eq("id", selectedRoom.id);
      if (error) console.error(error);
    } else if (modalMode === "delete" && selectedRoom) {
      const { error } = await supabase
        .from("rooms")
        .delete()
        .eq("id", selectedRoom.id);
      if (error) console.error(error);
    } else if (modalMode === "create") {
      const { error } = await supabase.from("rooms").insert([data]);
      if (error) console.error(error);
    }

    setModalOpen(false);
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
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
        buttonName="Room"
      />

      <RoomModal
        open={modalOpen}
        mode={modalMode}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        defaultValues={selectedRoom ?? undefined}
      />
    </>
  );
};

export default RoomTable;
