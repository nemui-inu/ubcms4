export interface Reading {
  id?: number;
  created_at?: string;
  updated_at?: string | null;
  collector_id: number; // fk to users.id
  room_id: number; // fk to rooms.id
  utility_type: string; // text
  last_reading: number;
  current_reading: number;
}
