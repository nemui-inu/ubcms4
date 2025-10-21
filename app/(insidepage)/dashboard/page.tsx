"use client";

import { ChartPieDonutText } from "@/components/charts/pie-chart";
import RatesCard from "@/components/rates-card";
import TransactionHistory from "@/components/transaction-history";
import { useUser } from "@/context/user-context";
import { useRouter } from "next/navigation";

export default function Page() {
  const { userData } = useUser();
  const router = useRouter();

  if (userData?.role !== "Tenant" && userData?.role !== "Admin") {
    router.push("/dashboard-collector");
    return;
  } else if (userData?.role !== "Admin") {
    router.push("/dashboard-tenant");
    return;
  }

  return (
    <div className="flex flex-1 flex-col gap-4 pt-0">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="h-full rounded-xl ">
          <ChartPieDonutText
            title="Tenant Payment Status"
            month="September"
            status1="paid"
            value1={250}
            status2="unpaid"
            value2={50}
          />
        </div>
        <div className="h-full rounded-xl ">
          <ChartPieDonutText
            title="Utility Reading Status"
            month="October"
            status1="read"
            value1={75}
            status2="unread"
            value2={300 - 75}
            descriptor="Meters read"
            trendup={`${75} Rooms were read on time`}
            description={`Showing rooms have had their utility meters read for the month.`}
          />
        </div>
        <div className="aspect-video rounded-xl flex flex-col gap-4">
          <RatesCard
            title="Electricity"
            description="Applied rate for electricity consumption"
            unit="KwH"
            rate={12.45}
            icon="zap"
          />
          <RatesCard
            title="Water"
            description="Applied rate for water consumption"
            unit="CuM"
            rate={11.32}
            icon="droplet"
          />
        </div>
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
        <TransactionHistory />
      </div>
    </div>
  );
}
