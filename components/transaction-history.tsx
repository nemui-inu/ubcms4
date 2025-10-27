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
import { History } from "lucide-react";
import PdfExport from "@/components/pdf-export";

const TransactionHistory = () => {
  return (
    <Card className="w-full h-full">
      <CardHeader>
        <div className="flex flex-row justify-between items-center">
          <CardTitle>
            <div className="flex flex-row gap-1 items-center">
              <History className="w-4 h-4" />
              <p>Transaction History</p>
            </div>
          </CardTitle>
          <PdfExport
            filename="transaction-history.pdf"
            title="Transaction History"
            rows={[]}
          />
        </div>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center py-0">
        <p className="text-foreground-muted">No transactions to show.</p>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
};

export default TransactionHistory;
