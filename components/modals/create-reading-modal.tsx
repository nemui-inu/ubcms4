"use client";

import ModalWrapper from "@/components/modals/modal-wrapper";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

const UTILITY_OPTIONS = ["Electricity", "Water"] as const;
type UtilityType = (typeof UTILITY_OPTIONS)[number];

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: {
    building_name: string;
    room_number: string;
    utility_type: string;
    current_reading: number;
  }) => void;
}

const CreateReadingModal: React.FC<Props> = ({ open, onClose, onSubmit }) => {
  const [buildingName, setBuildingName] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [utilityType, setUtilityType] = useState<UtilityType>(
    UTILITY_OPTIONS[0]
  );
  const [currentReading, setCurrentReading] = useState("");

  const handleSubmit = () => {
    if (!buildingName || !roomNumber || !utilityType || !currentReading) return;
    onSubmit?.({
      building_name: buildingName,
      room_number: roomNumber,
      utility_type: utilityType,
      current_reading: Number(currentReading),
    });
    setBuildingName("");
    setRoomNumber("");
    setUtilityType(UTILITY_OPTIONS[0]);
    setCurrentReading("");
    onClose();
  };

  return (
    <ModalWrapper
      title="Add Reading"
      description="Enter details for a new reading."
      mode="create"
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="building_name">Building Name</Label>
          <Input
            id="building_name"
            name="building_name"
            value={buildingName}
            onChange={(e) => setBuildingName(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="room_number">Room Number</Label>
          <Input
            id="room_number"
            name="room_number"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="utility_type">Utility Type</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-start px-3">
                {utilityType}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent sideOffset={4} className="min-w-[8rem] w-full">
              {UTILITY_OPTIONS.map((u) => (
                <DropdownMenuItem key={u} onClick={() => setUtilityType(u)}>
                  {u}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="current_reading">Current Reading</Label>
          <Input
            id="current_reading"
            name="current_reading"
            type="number"
            step="1"
            value={currentReading}
            onChange={(e) => setCurrentReading(e.target.value)}
            required
          />
        </div>
      </div>
    </ModalWrapper>
  );
};

export default CreateReadingModal;
