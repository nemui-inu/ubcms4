export interface User {
  id: number;
  email: string;
  mil_rank: string;
  first_name: string;
  last_name: string;
  serial_number: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserTableProps {
  initialUsers: User[];
}

export interface UserModalProps {
  open: boolean;
  mode: "view" | "create" | "edit" | "delete";
  onClose: () => void;
  onSubmit?: (user: User) => void;
  defaultValues?: Partial<User>;
}
