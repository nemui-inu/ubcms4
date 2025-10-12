export type ModalMode = "view" | "create" | "edit" | "delete";

export interface ModalProps<T> {
  mode: ModalMode;
  title: string;
  description?: string;
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: T) => void;
  defaultValues?: Partial<T>;
  children?: React.ReactNode;
}
