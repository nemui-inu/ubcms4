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
          <Button variant={"outline"}>Change Applied Rate</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RatesCard;
