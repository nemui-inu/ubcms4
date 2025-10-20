"use client";
import GridTable from "@/components/grid-table";
import { UserTableProps, User } from "@/types/Users";
import UserModal from "@/components/modals/tenant-modal";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const CollectorsTable = ({ initialUsers }: UserTableProps) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<
    "view" | "edit" | "delete" | "create"
  >("view");

  const supabase = createClient();

  const refreshUsers = async () => {
    const { data } = await supabase.from("users").select();
    setUsers(data ?? []);
  };

  const openModal = (
    mode: "view" | "edit" | "delete" | "create",
    user?: User
  ) => {
    setSelectedUser(user ?? null);
    setModalMode(mode);
    setModalOpen(true);
  };

  const handleView = async (user: User) => openModal("view", user);
  const handleEdit = async (user: User) => openModal("edit", user);
  const handleDelete = async (user: User) => openModal("delete", user);
  const handleCreate = async () => openModal("create");

  const handleSubmit = async (data: User) => {
    if (modalMode === "edit" && selectedUser) {
      const { error } = await supabase
        .from("users")
        .update(data)
        .eq("id", selectedUser.id);
      if (error) console.error(error);
    } else if (modalMode === "delete" && selectedUser) {
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", selectedUser.id);
      if (error) console.error(error);
    } else if (modalMode === "create") {
      const { error } = await supabase.from("users").insert([data]);
      if (error) console.error(error);
    }

    setModalOpen(false);
    await refreshUsers();
  };

  return (
    <>
      <GridTable
        rowData={users}
        columnDefs={[
          { field: "id" },
          { field: "mil_rank" },
          { field: "first_name" },
          { field: "last_name" },
          { field: "serial_number" },
          { field: "role" },
        ]}
        onView={handleView}
        onEdit={handleEdit}
        onCreate={handleCreate}
        onDelete={handleDelete}
        buttonName={"Collector"}
      />

      <UserModal
        open={modalOpen}
        mode={modalMode}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        defaultValues={selectedUser ?? undefined}
      />
    </>
  );
};

export default CollectorsTable;
