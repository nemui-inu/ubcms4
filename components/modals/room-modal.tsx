"use client";

import ModalWrapper from "@/components/modals/modal-wrapper";
import { Room, RoomModalProps } from "@/types/Room";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const RoomModal: React.FC<RoomModalProps> = ({
  open,
  mode,
  onClose,
  onSubmit,
  defaultValues,
}) => {
  const modalContent = {
    view: {
      title: "View Room Details",
      description: "Review information",
    },
    edit: {
      title: "Edit Room Details",
      description: "Update information",
    },
    delete: {
      title: "Delete Room",
      description: "Delete row from table",
    },
    create: {
      title: "Add New Room",
      description: "Create new entry",
    },
  };

  return (
    <ModalWrapper<Room>
      title={modalContent[mode].title}
      description={modalContent[mode].description}
      mode={mode}
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <div className={mode !== "delete" ? "hidden " : "grid gap-6"}>
        <p className="">
          Are you sure you want to delete this room:{" "}
          <span className="font-mono bg-neutral-700 px-1 rounded-[0.2rem]">
            {defaultValues?.building_name} {defaultValues?.room_number}
          </span>
          ?
        </p>
      </div>
      <div className={mode === "delete" ? "hidden " : "grid gap-6"}>
        <div className="grid gap-4">
          <Label htmlFor="id">ID</Label>
          <Input
            id="id"
            name="id"
            defaultValue={
              !defaultValues?.id && mode === "create"
                ? "Field automatic"
                : defaultValues?.id
            }
            disabled={true}
          />
        </div>
        <div className="grid gap-4">
          <Label htmlFor="building_name">Building Name</Label>
          <Input
            id="building_name"
            name="building_name"
            type="string"
            defaultValue={defaultValues?.building_name ?? ""}
            disabled={mode === "view"}
          />
        </div>
        <div className="grid gap-4">
          <Label htmlFor="room_number">Room Number</Label>
          <Input
            id="room_number"
            name="room_number"
            type="string"
            defaultValue={defaultValues?.room_number ?? ""}
            disabled={mode === "view"}
          />
        </div>
        <div className="grid gap-4">
          <Label htmlFor="owner_id">Owner ID</Label>
          <Input
            id="owner_id"
            name="owner_id"
            type={
              !defaultValues?.owner_id && mode !== "view" ? "number" : "string"
            }
            defaultValue={
              !defaultValues?.owner_id && mode !== "view"
                ? defaultValues?.owner_id
                : "Unowned"
            }
            disabled={mode === "view"}
          />
        </div>
        <div className="grid gap-4">
          <Label htmlFor="status">Status</Label>
          <Input
            id="status"
            name="status"
            type="string"
            defaultValue={defaultValues?.status ?? ""}
            disabled={mode === "view"}
          />
        </div>
      </div>
    </ModalWrapper>
  );
};

export default RoomModal;
