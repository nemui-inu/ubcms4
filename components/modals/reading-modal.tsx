"use client";

import ModalWrapper from "@/components/modals/modal-wrapper";
import { Reading } from "@/types/Reading";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  open: boolean;
  mode: "create" | "view" | "edit" | "delete"; // primarily create
  onClose: () => void;
  onSubmit?: (data: Reading) => void;
  defaultValues?: Partial<Reading>;
}

const UTILITY_OPTIONS = ["Electricity", "Water"] as const;

const ReadingModal: React.FC<Props> = ({
  open,
  mode,
  onClose,
  onSubmit,
  defaultValues,
}) => {
  const modalContent = {
    view: { title: "View Reading", description: "Review reading" },
    edit: { title: "Edit Reading", description: "Update reading" },
    delete: { title: "Delete Reading", description: "Delete reading" },
    create: {
      title: "Record Reading",
      description: "Record a new meter reading",
    },
  } as const;

  const supabase = createClient();

  const [utilityType, setUtilityType] = useState<string>(
    String(defaultValues?.utility_type ?? UTILITY_OPTIONS[0])
  );
  // If utility_type is provided, lock the field
  const utilityTypeLocked = !!defaultValues?.utility_type;
  const [lastReading, setLastReading] = useState<number | null>(
    defaultValues?.last_reading ?? null
  );
  const [loadingLast, setLoadingLast] = useState(false);

  useEffect(() => {
    // whenever modal opens or utilityType changes, fetch last reading for room+utility
    async function fetchLast() {
      if (!open) return;
      const roomId = defaultValues?.room_id;
      if (!roomId) {
        setLastReading(0);
        return;
      }

      setLoadingLast(true);
      try {
        const { data, error } = await supabase
          .from("readings")
          .select("current_reading")
          .eq("room_id", roomId)
          .eq("utility_type", utilityType)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Error fetching last reading:", error);
          setLastReading(0);
        } else if (
          data &&
          typeof (data as { current_reading?: number }).current_reading !==
            "undefined"
        ) {
          const val = (data as { current_reading?: number }).current_reading;
          const v = Number(val ?? 0);
          setLastReading(Number.isNaN(v) ? 0 : Math.trunc(v));
        } else {
          // first reading
          setLastReading(0);
        }
      } catch (err) {
        console.error(err);
        setLastReading(0);
      } finally {
        setLoadingLast(false);
      }
    }

    fetchLast();
  }, [open, utilityType, defaultValues?.room_id, supabase]);

  return (
    <ModalWrapper<Reading>
      title={modalContent[mode].title}
      description={modalContent[mode].description}
      mode={mode}
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      defaultValues={defaultValues}
    >
      <div className={mode === "delete" ? "grid gap-4" : "hidden"}>
        <p>
          Are you sure you want to delete this reading for room id:{" "}
          <b>{defaultValues?.room_id}</b>?
        </p>
      </div>

      <div className={mode === "delete" ? "hidden" : "grid gap-4"}>
        <Input
          id="id"
          name="id"
          type="hidden"
          defaultValue={defaultValues?.id ? String(defaultValues.id) : ""}
        />

        <div className="grid gap-2">
          <Label htmlFor="room_id">Room ID</Label>
          <Input
            id="room_id"
            name="room_id"
            type="number"
            defaultValue={defaultValues?.room_id ?? ""}
            disabled={true}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="utility_type">Utility Type</Label>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="default"
                  className="w-full justify-start px-3"
                  disabled={mode === "view" || utilityTypeLocked}
                >
                  {utilityType}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                sideOffset={4}
                className="min-w-[8rem] w-full"
              >
                {UTILITY_OPTIONS.map((u) => (
                  <DropdownMenuItem
                    key={u}
                    onClick={() => setUtilityType(String(u))}
                    disabled={utilityTypeLocked}
                  >
                    {u}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* hidden input so FormData includes the chosen utility_type */}
            <Input
              id="utility_type"
              name="utility_type"
              type="hidden"
              value={utilityType}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="last_reading">Last Reading</Label>
          <Input
            id="last_reading_display"
            type="number"
            value={loadingLast ? "..." : String(lastReading ?? 0)}
            disabled
          />
          {/* include a hidden input so FormData includes last_reading even though the visible input is disabled */}
          <Input
            id="last_reading"
            name="last_reading"
            type="hidden"
            value={String(lastReading ?? 0)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="current_reading">Current Reading</Label>
          <Input
            id="current_reading"
            name="current_reading"
            type="number"
            step="1"
            defaultValue={
              defaultValues?.current_reading !== undefined
                ? String(defaultValues.current_reading)
                : ""
            }
            disabled={mode === "view"}
          />
        </div>
      </div>
    </ModalWrapper>
  );
};

export default ReadingModal;
