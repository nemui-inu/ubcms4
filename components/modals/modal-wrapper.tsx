"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ModalProps } from "@/types/Modal";

const ModalWrapper = <T,>({
  mode,
  title,
  description,
  open,
  onClose,
  onSubmit,
  children,
}: ModalProps<T>) => {
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isDelete = mode === "delete";
  const isCreate = mode === "create";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (onSubmit && !isView) {
              const formData = new FormData(e.currentTarget);
              const data = Object.fromEntries(formData.entries()) as T;
              onSubmit(data);
            }
          }}
          className="grid gap-4"
        >
          {children}
          <DialogFooter>
            <Button variant={"outline"} onClick={onClose} type={"button"}>
              {isView ? "Close" : "Cancel"}
            </Button>

            {!isView && (
              <Button
                type={"submit"}
                variant={isDelete ? "destructive" : "default"}
              >
                {isCreate && "Create"}
                {isEdit && "Save"}
                {isDelete && "Delete"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ModalWrapper;
