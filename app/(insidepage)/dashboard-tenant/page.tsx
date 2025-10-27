"use client";

import { ChartPieDonutText } from "@/components/charts/pie-chart";
import RatesCard from "@/components/overdue-card";
import TransactionHistory from "@/components/bills-due";
import { createClient } from "@/lib/supabase/client";
import React from "react";

export default function Page() {
  const supabase = createClient();
  const [paidElectric, setPaidElectric] = React.useState(0);
  const [unpaidElectric, setUnpaidElectric] = React.useState(0);
  const [paidWater, setPaidWater] = React.useState(0);
  const [unpaidWater, setUnpaidWater] = React.useState(0);
  const [overdueElectric, setOverdueElectric] = React.useState(0);
  const [overdueWater, setOverdueWater] = React.useState(0);

  React.useEffect(() => {
    async function fetchBills() {
      const { data: userResp, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userResp?.user) return;
      const authUser = userResp.user;
      const { data: profileData } = await supabase
        .from("users")
        .select("id, user_id")
        .eq("user_id", authUser.id)
        .maybeSingle();
      const profileId = profileData?.id;
      if (!profileId) return;
      const { data: bills, error: billsError } = await supabase
        .from("bills")
        .select("id, status, rate_id, due_date")
        .eq("user_id", profileId);
      if (billsError || !Array.isArray(bills)) return;
      const { data: rates } = await supabase
        .from("rates")
        .select("id, utility_type");
      const rateMap = new Map<number, string>();
      (rates ?? []).forEach((r) => {
        rateMap.set(r.id, r.utility_type);
      });
      let pe = 0,
        ue = 0,
        pw = 0,
        uw = 0,
        overdueE = 0,
        overdueW = 0;
      const today = new Date();
      bills.forEach((bill) => {
        const type = rateMap.get(bill.rate_id) ?? "";
        const paid = String(bill.status).toLowerCase() === "paid";
        const dueDate = bill.due_date ? new Date(bill.due_date) : null;
        const isOverdue = !paid && dueDate && dueDate < today;
        if (type.toLowerCase().includes("electric")) {
          if (paid) pe++;
          else ue++;
          if (isOverdue) overdueE++;
        } else if (type.toLowerCase().includes("water")) {
          if (paid) pw++;
          else uw++;
          if (isOverdue) overdueW++;
        }
      });
      setPaidElectric(pe);
      setUnpaidElectric(ue);
      setPaidWater(pw);
      setUnpaidWater(uw);
      setOverdueElectric(overdueE);
      setOverdueWater(overdueW);
    }
    fetchBills();
  }, [supabase]);

  return (
    <div className="flex flex-1 flex-col gap-4 pt-0">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="h-full rounded-xl ">
          <ChartPieDonutText
            title="Electricity Bills Paid"
            month="January - December 2025"
            status1="paid"
            value1={paidElectric}
            status2="unpaid"
            value2={unpaidElectric}
            descriptor="Bills paid"
            trendup={`${paidElectric} bills electric paid on time`}
            description="Showing bills paid for the whole year"
          />
        </div>
        <div className="h-full rounded-xl ">
          <ChartPieDonutText
            title="Water Bills Paid"
            month="January - December 2025"
            status1="paid"
            value1={paidWater}
            status2="unpaid"
            value2={unpaidWater}
            descriptor="Bills paid"
            trendup={`${paidWater} water bills paid on time`}
            description="Showing water bills paid for the whole year"
          />
        </div>
        <div className="aspect-video rounded-xl flex flex-col gap-4">
          <RatesCard
            title="Electricity"
            description="Overdue electricity bills"
            icon="zap"
            body={`${overdueElectric} overdue bill${
              overdueElectric === 1 ? "" : "s"
            }`}
          />
          <RatesCard
            title="Water"
            description="Overdue water bills"
            icon="droplet"
            body={`${overdueWater} overdue bill${
              overdueWater === 1 ? "" : "s"
            }`}
          />
        </div>
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
        <TransactionHistory />
      </div>
    </div>
  );
}
