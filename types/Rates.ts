export interface Rate {
  id: number;
  utility_type: string;
  amount: number;
}

export interface RatesTableProps {
  initialRates: Rate[];
}

export interface RatesModalProps {
  open: boolean;
  mode: "view" | "create" | "edit" | "delete";
  onClose: () => void;
  onSubmit?: (user: Rate) => void;
  defaultValues?: Partial<Rate>;
}
