"use client";

import ModalWrapper from "@/components/modals/modal-wrapper";
import { Rate, RatesModalProps } from "@/types/Rates";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const UserModal: React.FC<RatesModalProps> = ({
  open,
  mode,
  onClose,
  onSubmit,
  defaultValues,
}) => {
  const modalContent = {
    view: {
      title: "View Rate Details",
      description: "Review information",
    },
    edit: {
      title: "Edit Rate Details",
      description: "Update information",
    },
    delete: {
      title: "Delete Rate",
      description: "Delete row from table",
    },
    create: {
      title: "Add New Rate",
      description: "Create new entry",
    },
  };

  return (
    <ModalWrapper<Rate>
      title={modalContent[mode].title}
      description={modalContent[mode].description}
      mode={mode}
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <div className={mode !== "delete" ? "hidden " : "grid gap-6"}>
        <p className="">
          Are you sure you want to delete this rate:{" "}
          <span className="font-mono bg-neutral-700 px-1 rounded-[0.2rem]">
            {defaultValues?.utility_type}: {defaultValues?.amount}
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
            <Label htmlFor="owner_id">Utility Type</Label>
            <Input
              id="owner_id"
              name="owner_id"
              defaultValue={defaultValues?.utility_type}
              disabled={true}
            />
          </div>
          <div className="grid gap-4">
            <Label htmlFor="owner_id">Amount</Label>
            <Input
              id="owner_id"
              name="owner_id"
              defaultValue={defaultValues?.amount}
              disabled={true}
            />
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default UserModal;
