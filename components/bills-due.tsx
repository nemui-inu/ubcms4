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
import { FileText } from "lucide-react";
import { DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";

const TransactionHistory = () => {
  const router = useRouter();
  function proceedPayment() {
    router.push("/payment");
  }
  return (
    <Card className="w-full h-full">
      <CardHeader>
        <div className="flex flex-row justify-between items-center">
          <CardTitle>
            <div className="flex flex-row gap-1 items-center">
              <DollarSign className="w-4 h-4" />
              <p>Bills to Pay</p>
            </div>
          </CardTitle>
          <Button variant={"secondary"} size={"sm"}>
            <FileText />
            Export PDF
          </Button>
        </div>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 w-full py-0 my-0">
        <div className="ps-4 flex flex-row items-center justify-between w-full">
          <p className="flex-2 w-1">Month</p>
          <p className="flex-2 w-24">Amount Due</p>
          <p className="flex-3 w-24">Due Date</p>
          <div className="w-12 flex-2 justify-end flex-row flex opacity-0"></div>
        </div>
        <Card className="w-full">
          <CardContent className="py-2 ps-4 pe-2 w-full">
            <div className="flex flex-row items-center justify-between w-full">
              <p className="flex-2 w-1">July</p>
              <p className="flex-2 w-24">800.00 Php</p>
              <p className="flex-3 w-24">10 August</p>
              <div className="w-12 flex-2 justify-end flex-row flex">
                <Button onClick={proceedPayment}>Pay Bill</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
};

export default TransactionHistory;
