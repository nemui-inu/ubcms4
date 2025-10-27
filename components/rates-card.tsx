"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import { Zap, Droplet } from "lucide-react";
import RateModal from "@/components/modals/rate-modal";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Rate } from "@/types/Rates";

interface RatesCardProps {
  title: string;
  rate: number;
  unit: string;
  description: string;
  icon?: string;
}

const RatesCard = ({
  title,
  rate,
  unit,
  description,
  icon,
}: RatesCardProps) => {
  const [open, setOpen] = useState(false);
  const [currentRate, setCurrentRate] = useState<Rate | null>({
    id: -1,
    utility_type: title,
    amount: rate,
  });

  const supabase = createClient();

  const handleOpen = () => {
    setCurrentRate({ id: -1, utility_type: title, amount: rate });
    setOpen(true);
  };

  const handleSubmit = async (data: Rate) => {
    // coerce amount
    const raw = data as unknown as Record<string, string>;
    const payload: Record<string, unknown> = { ...raw };
    if (typeof payload.amount === "string") {
      const n = Number(payload.amount as string);
      payload.amount = Number.isNaN(n) ? null : n;
    }

    try {
      if (
        payload.id !== undefined &&
        payload.id !== null &&
        payload.id !== -1
      ) {
        const idNum = Number(payload.id as unknown);
        if (!Number.isNaN(idNum)) {
          delete payload.id;
          await supabase.from("rates").update(payload).eq("id", idNum);
        }
      } else {
        // try to update by utility_type, fallback to insert
        const ut = (payload.utility_type as string) ?? title;
        const { data: existing } = await supabase
          .from("rates")
          .select("id")
          .eq("utility_type", ut)
          .maybeSingle();
        if (existing && (existing as Record<string, unknown>).id) {
          const idNum = Number(
            (existing as Record<string, unknown>).id as unknown
          );
          delete payload.id;
          await supabase.from("rates").update(payload).eq("id", idNum);
        } else {
          await supabase.from("rates").insert([payload]);
        }
      }
    } catch (err) {
      console.error("Failed to update rate", err);
    }

    setOpen(false);
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex flex-row gap-1 items-center">
            {icon == "zap" ? (
              <Zap className="2-4 h-4 fill-foreground" />
            ) : (
              <Droplet className="2-4 h-4 fill-foreground" />
            )}
            <CardTitle>{title}</CardTitle>
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-row gap-1 items-center justify-center w-full">
            <span>Php</span>
            <p className="text-3xl font-bold">{rate}</p>
            <span>/</span>
            <span>{unit}</span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center w-full">
          <Button variant={"outline"} onClick={handleOpen}>
            Change Applied Rate
          </Button>
        </CardFooter>
      </Card>

      <RateModal
        open={open}
        mode={"edit"}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        defaultValues={currentRate ?? undefined}
      />
    </div>
  );
};

export default RatesCard;
