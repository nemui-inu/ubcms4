"use client";

import ModalWrapper from "@/components/modals/modal-wrapper";
import { User, UserModalProps } from "@/types/Users";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const UserModal: React.FC<UserModalProps> = ({
  open,
  mode,
  onClose,
  onSubmit,
  defaultValues,
}) => {
  const modalContent = {
    view: {
      title: "View Tenant Details",
      description: "Review information",
    },
    edit: {
      title: "Edit Tenant Details",
      description: "Update information",
    },
    delete: {
      title: "Delete Tenant",
      description: "Delete row from table",
    },
    create: {
      title: "Add New Tenant",
      description: "Create new entry",
    },
  };

  return (
    <ModalWrapper<User>
      title={modalContent[mode].title}
      description={modalContent[mode].description}
      mode={mode}
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <div className={mode !== "delete" ? "hidden " : "grid gap-6"}>
        <p className="">
          Are you sure you want to delete this user:{" "}
          <span className="font-mono bg-neutral-700 px-1 rounded-[0.2rem]">
            {defaultValues?.mil_rank} {defaultValues?.last_name}
          </span>
          ?
        </p>
      </div>
      <div className={mode === "delete" ? "hidden " : "grid gap-6"}>
        <div className="flex flex-row gap-4">
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
            <Label htmlFor="owner_id">Role</Label>
            <Input
              id="owner_id"
              name="owner_id"
              defaultValue={defaultValues?.role ?? "Tenant"}
              disabled={true}
            />
          </div>
        </div>
        <div className="flex flex-row gap-4">
          <div className="grid gap-4">
            <Label htmlFor="building_name">First Name</Label>
            <Input
              id="building_name"
              name="building_name"
              type="string"
              defaultValue={defaultValues?.first_name ?? ""}
              disabled={mode === "view"}
            />
          </div>
          <div className="grid gap-4">
            <Label htmlFor="room_number">Last Name</Label>
            <Input
              id="room_number"
              name="room_number"
              type="string"
              defaultValue={defaultValues?.last_name ?? ""}
              disabled={mode === "view"}
            />
          </div>
        </div>
        <div className="flex flex-row gap-4">
          <div className="grid gap-4">
            <Label htmlFor="owner_id">Serial Number</Label>
            <Input
              id="owner_id"
              name="owner_id"
              defaultValue={defaultValues?.serial_number}
              disabled={mode === "view"}
            />
          </div>
          <div className="grid gap-4">
            <Label htmlFor="status">{"Rank (e.g. PVT, 2LT, ...)"}</Label>
            <Input
              id="status"
              name="status"
              type="string"
              defaultValue={defaultValues?.mil_rank ?? ""}
              disabled={mode === "view"}
            />
          </div>
        </div>
        <div className="grid gap-4">
          <Label htmlFor="status">Email</Label>
          <Input
            id="status"
            name="status"
            type="string"
            defaultValue={defaultValues?.email ?? ""}
            disabled={mode === "view"}
          />
        </div>
      </div>
    </ModalWrapper>
  );
};

export default UserModal;
