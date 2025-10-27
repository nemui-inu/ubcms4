"use client";
import GridTable from "@/components/grid-table";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { Rate, RatesTableProps } from "@/types/Rates";
import RateModal from "@/components/modals/rate-modal";

const RatesTable = ({ initialRates }: RatesTableProps) => {
  const [rates, setRates] = useState<Rate[]>(initialRates);

  const [selectedRate, setSelectedRate] = useState<Rate | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<
    "view" | "edit" | "delete" | "create"
  >("view");

  const supabase = createClient();

  const refreshRates = async () => {
    const { data } = await supabase.from("rates").select("*");
    setRates(data ?? []);
  };

  const openModal = (
    mode: "view" | "edit" | "delete" | "create",
    room?: Rate
  ) => {
    setSelectedRate(room ?? null);
    setModalMode(mode);
    setModalOpen(true);
  };

  const handleView = async (rate: Rate) => openModal("view", rate);
  const handleEdit = async (rate: Rate) => openModal("edit", rate);
  const handleDelete = async (rate: Rate) => openModal("delete", rate);
  const handleCreate = async () => openModal("create");

  const handleSubmit = async (data: Rate) => {
    if (modalMode === "edit" && selectedRate) {
      // coerce and sanitize payload coming from FormData
      const raw = data as unknown as Record<string, string>;
      const payload: Record<string, unknown> = { ...raw };
      // remove id if present (don't attempt to update primary key)
      if (payload.id !== undefined) delete payload.id;

      // coerce amount if present
      if (typeof payload.amount === "string") {
        const n = Number(payload.amount as string);
        payload.amount = Number.isNaN(n) ? null : n;
      }

      // remove undefined values
      Object.keys(payload).forEach((k) => {
        if (payload[k] === undefined) delete payload[k];
      });

      const { error } = await supabase
        .from("rates")
        .update(payload)
        .eq("id", selectedRate.id);
      if (error) console.error(error);
    } else if (modalMode === "delete" && selectedRate) {
      const { error } = await supabase
        .from("rates")
        .delete()
        .eq("id", selectedRate.id);
      if (error) console.error(error);
    } else if (modalMode === "create") {
      // coerce amount for create
      const raw = data as unknown as Record<string, string>;
      const payload: Record<string, unknown> = { ...raw };
      if (typeof payload.amount === "string") {
        const n = Number(payload.amount as string);
        payload.amount = Number.isNaN(n) ? null : n;
      }
      const { error } = await supabase.from("rates").insert([payload]);
      if (error) console.error(error);
    }

    setModalOpen(false);
    await refreshRates();
  };

  return (
    <>
      <GridTable
        rowData={rates}
        columnDefs={[
          { field: "id" },
          { field: "utility_type" },
          { field: "amount" },
        ]}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
        buttonName="Rate"
      />

      <RateModal
        open={modalOpen}
        mode={modalMode}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        defaultValues={selectedRate ?? undefined}
      />
    </>
  );
};

export default RatesTable;
