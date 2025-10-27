export interface Room {
  id: number;
  building_name: string;
  room_number: string;
  owner_id: number;
  status: string;
  is_read: boolean;
}

export interface RoomTableProps {
  initialRooms: Room[];
  collectorMode?: boolean;
}

export interface RoomModalProps {
  open: boolean;
  mode: "view" | "create" | "edit" | "delete";
  onClose: () => void;
  onSubmit?: (room: Room) => void;
  defaultValues?: Partial<Room>;
}
