"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PdfExport from "@/components/pdf-export";
import { Button } from "./ui/button";
import { DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type BillRow = {
  id?: number | string;
  month: string;
  amount_due: string;
  due_date: string;
  is_paid: boolean;
  status: string | null;
};

const TransactionHistory = () => {
  const supabase = createClient();
  const router = useRouter();
  const [rows, setRows] = useState<BillRow[]>([]);
  const [loading, setLoading] = useState(false);

  type BillDetails = {
    id: number;
    billing_period_start?: string;
    billing_period_end?: string;
    due_date?: string;
    amount_due?: number | string;
    status?: string;
    rooms?: { building_name?: string; room_number?: string };
    rates?: { utility_type?: string };
    readings?: {
      collector_id?: string;
      current_reading?: number;
      last_reading?: number;
    };
    users?: unknown;
    [key: string]: unknown;
  };
  const [viewBill, setViewBill] = useState<BillDetails | null>(null);
  const [viewBillUsage, setViewBillUsage] = useState<number | null>(null);
  const [viewCollector, setViewCollector] = useState<{
    name: string;
    rank: string;
  } | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  async function handleViewBill(billId?: number | string) {
    if (!billId) return;
    setViewLoading(true);
    setViewCollector(null);
    // Fetch bill details (including usage)
    const { data: bill, error: billError } = await supabase
      .from("bills")
      .select("*, readings(*), rates(*), rooms(*), users(*)")
      .eq("id", billId)
      .maybeSingle();
    if (billError || !bill) {
      setViewBill(null);
      setViewBillUsage(null);
      setViewCollector(null);
      setViewLoading(false);
      return;
    }
    setViewBill(bill);
    // Usage: try to get from readings
    let usage = null;
    if (bill.readings) {
      const r = bill.readings;
      if (
        typeof r === "object" &&
        r !== null &&
        "current_reading" in r &&
        "last_reading" in r
      ) {
        usage = r.current_reading - r.last_reading;
      }
      // Query collector info if collector_id exists
      if (r.collector_id) {
        const { data: collector, error: collectorError } = await supabase
          .from("users")
          .select("first_name, last_name, mil_rank")
          .eq("id", r.collector_id)
          .maybeSingle();
        if (!collectorError && collector) {
          setViewCollector({
            name: `${collector.first_name ?? "-"} ${
              collector.last_name ?? "-"
            }`,
            rank: collector.mil_rank ?? "-",
          });
        } else {
          setViewCollector(null);
        }
      } else {
        setViewCollector(null);
      }
    } else {
      setViewCollector(null);
    }
    setViewBillUsage(usage);
    setViewLoading(false);
  }

  async function proceedPayment(billId?: number | string) {
    if (!billId) return;
    setLoading(true);
    // Find bill details for payment record
    const bill = rows.find((b) => String(b.id) === String(billId));
    // Update bill status to 'paid' in Supabase
    const { error: billError } = await supabase
      .from("bills")
      .update({ status: "paid" })
      .eq("id", billId);
    if (billError) {
      setLoading(false);
      console.error("Error updating bill status:", billError);
      return;
    }
    // Insert payment record
    const paymentDetails = {
      bill_id: billId,
      amount_paid: bill?.amount_due ? parseFloat(bill.amount_due) : 0,
      payment_date: new Date().toISOString(),
      payment_status: "On time",
    };
    const { error: paymentError } = await supabase
      .from("payments")
      .insert([paymentDetails]);
    if (paymentError) {
      setLoading(false);
      console.error("Error inserting payment record:", paymentError);
      return;
    }
    setLoading(false);
    // Redirect to payment page after marking as paid and inserting payment
    const url = `/payment?billId=${billId}`;
    router.push(url);
  }

  // Expose fetchBills so it can be called after payment
  const fetchBills = async () => {
    setLoading(true);
    try {
      const { data: userResp, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userResp?.user) {
        setRows([]);
        return;
      }

      const authUser = userResp.user;

      // Try to resolve profile id from public `users` table
      const { data: profileData } = await supabase
        .from("users")
        .select("id, user_id")
        .eq("user_id", authUser.id)
        .maybeSingle();

      const profileId = profileData?.id;

      // Resolve bills for the numeric profile id. If we couldn't resolve a
      // numeric profile id, bail early — mixing the auth UUID with the
      // bigint `bills.user_id` will fail the query.
      let bills: unknown[] | null = null;
      let billsError: unknown = null;
      try {
        if (!profileId) {
          console.warn(
            "No numeric profile id found for auth user; skipping bills query."
          );
          bills = [];
          billsError = null;
        } else {
          const res = await supabase
            .from("bills")
            .select(
              "id, billing_period_start, amount_due, due_date, status, user_id"
            )
            .eq("user_id", profileId)
            .order("due_date", { ascending: true });
          bills = res.data as unknown[] | null;
          billsError = res.error;
        }
      } catch (err: unknown) {
        bills = null;
        billsError = err;
      }

      if (billsError) {
        // Try to log useful details about the error object
        try {
          const extras =
            typeof billsError === "object" && billsError !== null
              ? JSON.stringify(
                  billsError as Record<string, unknown>,
                  Object.getOwnPropertyNames(
                    billsError as Record<string, unknown>
                  )
                )
              : String(billsError);
          console.error("Error fetching bills:", billsError, extras);
        } catch {
          console.error("Error fetching bills (non-serializable):", billsError);
        }
        setRows([]);
        return;
      }

      if (!Array.isArray(bills) || bills.length === 0) {
        setRows([]);
        return;
      }

      // Normalize rows for display and keep only unpaid bills (status !== 'paid')
      const mapped = (bills as Array<Record<string, unknown>>)
        .map<BillRow>((b) => {
          // Prefer billing_period_start, fallback to bill_date or empty.
          const rawPeriod = b["billing_period_start"] ?? b["bill_date"] ?? "";
          let month = "";
          try {
            if (rawPeriod) {
              const d = new Date(String(rawPeriod));
              if (!Number.isNaN(d.getTime())) {
                month = d.toLocaleString(undefined, {
                  month: "short",
                  year: "numeric",
                });
              } else {
                month = String(rawPeriod);
              }
            }
          } catch {
            month = String(rawPeriod ?? "");
          }

          let amount_due = "";
          if (typeof b["amount_due"] === "number") {
            amount_due = (b["amount_due"] as number).toFixed(2);
          } else if (typeof b["amount_due"] === "string") {
            const p = parseFloat(b["amount_due"] as string);
            amount_due = Number.isFinite(p)
              ? p.toFixed(2)
              : String(b["amount_due"]);
          } else {
            amount_due = String(b["amount_due"] ?? "");
          }

          const due_date = String(b["due_date"] ?? b["due"] ?? "");
          const status = b["status"] ? String(b["status"]) : null;
          return {
            id: b["id"] as number | string | undefined,
            month,
            amount_due,
            due_date,
            is_paid: false, // always false, not used
            status,
          };
        })
        .filter((x) => {
          // show items that are not marked paid
          const s = String(x.status ?? "").toLowerCase();
          return s !== "paid";
        });

      setRows(mapped);
    } catch (err) {
      console.error("Failed to load bills:", err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

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
          <PdfExport
            filename="bills-to-pay.pdf"
            title="Bills to Pay"
            rows={rows.map((r) => ({
              month: r.month,
              amount_due: r.amount_due,
              due_date: r.due_date,
            }))}
            columns={["month", "amount_due", "due_date"]}
          />
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
        {loading ? (
          <div className="p-4">Loading bills...</div>
        ) : rows.length === 0 ? (
          <div className="p-4">No bills to display.</div>
        ) : (
          rows.map((r, idx) => (
            <Card className="w-full" key={String(r.id ?? idx)}>
              <CardContent className="py-2 ps-4 pe-2 w-full">
                <div className="flex flex-row items-center justify-between w-full">
                  <p className="flex-2 w-1">{String(r.month)}</p>
                  <p className="flex-2 w-24">{String(r.amount_due)}</p>
                  <p className="flex-3 w-24">{String(r.due_date)}</p>
                  <div className="w-32 flex-2 justify-end flex-row flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleViewBill(r.id)}
                    >
                      View Bill
                    </Button>
                    <Button onClick={() => proceedPayment(r.id)}>
                      Pay Bill
                    </Button>
                  </div>
                  {/* Bill Details Modal */}
                  <Dialog
                    open={!!viewBill}
                    onOpenChange={(open) => {
                      if (!open) setViewBill(null);
                    }}
                  >
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Bill Details</DialogTitle>
                        <DialogDescription>
                          {viewLoading
                            ? "Loading..."
                            : viewBill
                            ? `Bill #${viewBill.id}`
                            : ""}
                        </DialogDescription>
                      </DialogHeader>
                      {viewBill && !viewLoading && (
                        <div className="flex flex-col gap-2">
                          <div>
                            <b>Billing Period:</b>{" "}
                            {viewBill.billing_period_start} to{" "}
                            {viewBill.billing_period_end}
                          </div>
                          <div>
                            <b>Due Date:</b> {viewBill.due_date}
                          </div>
                          <div>
                            <b>Amount Due:</b> {viewBill.amount_due}
                          </div>
                          <div>
                            <b>Status:</b> {viewBill.status}
                          </div>
                          <div>
                            <b>Room:</b> {viewBill.rooms?.building_name}{" "}
                            {viewBill.rooms?.room_number}
                          </div>
                          <div>
                            <b>Utility Type:</b> {viewBill.rates?.utility_type}
                          </div>
                          <div>
                            <b>Current Reading:</b>{" "}
                            {viewBill.readings?.current_reading ?? "-"}
                          </div>
                          <div>
                            <b>Previous Reading:</b>{" "}
                            {viewBill.readings?.last_reading ?? "-"}
                          </div>
                          <div>
                            <b>Usage:</b>{" "}
                            {viewBillUsage !== null ? viewBillUsage : "-"}
                          </div>
                          <div>
                            <b>Collector:</b>{" "}
                            {viewCollector
                              ? `${viewCollector.rank} ${viewCollector.name}`
                              : viewBill.readings?.collector_id ?? "-"}
                          </div>
                        </div>
                      )}
                      <DialogFooter>
                        <div className="flex flex-row gap-2 w-full justify-between">
                          <PdfExport
                            filename={`bill-${viewBill?.id}.pdf`}
                            title={`Bill #${viewBill?.id}`}
                            rows={[
                              {
                                "Billing Period": `${viewBill?.billing_period_start} to ${viewBill?.billing_period_end}`,
                                "Due Date": viewBill?.due_date,
                                "Amount Due": viewBill?.amount_due,
                                Status: viewBill?.status,
                                Room: `${
                                  viewBill?.rooms?.building_name ?? ""
                                } ${viewBill?.rooms?.room_number ?? ""}`,
                                "Utility Type": viewBill?.rates?.utility_type,
                                "Current Reading":
                                  viewBill?.readings?.current_reading ?? "-",
                                "Previous Reading":
                                  viewBill?.readings?.last_reading ?? "-",
                                Usage:
                                  viewBillUsage !== null ? viewBillUsage : "-",
                                Collector: viewCollector
                                  ? `${viewCollector.rank} ${viewCollector.name}`
                                  : viewBill?.readings?.collector_id ?? "-",
                              },
                            ]}
                            columns={[
                              "Billing Period",
                              "Due Date",
                              "Amount Due",
                              "Status",
                              "Room",
                              "Utility Type",
                              "Current Reading",
                              "Previous Reading",
                              "Usage",
                              "Collector",
                            ]}
                          />
                          <Button
                            variant="secondary"
                            onClick={() => setViewBill(null)}
                          >
                            Close
                          </Button>
                        </div>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
};
export default TransactionHistory;
