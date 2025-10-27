import { createClient } from "@/lib/supabase/server";
import { ChartPieDonutText } from "@/components/charts/pie-chart";
import RatesCard from "@/components/rates-card";

// Server component: fetch counts from the database and pass into client chart
export default async function Page() {
  const supabase = await createClient();

  // Total tenants
  const { data: tenantsData } = await supabase
    .from("users")
    .select("id")
    .eq("role", "Tenant");
  const totalTenants = Array.isArray(tenantsData) ? tenantsData.length : 0;

  // Tenant payments: try a couple of likely table names/columns and fall back
  let paidTenants = 0;
  try {
    // Try payments table with user_id and status = 'paid'
    const { data: payments } = await supabase
      .from("payments")
      .select("user_id, status, is_paid");
    if (Array.isArray(payments) && payments.length > 0) {
      const paymentsTyped = payments as unknown as Array<
        Record<string, unknown>
      >;
      const paid = paymentsTyped
        .filter((p) => {
          const status = p["status"] as string | undefined;
          const is_paid = p["is_paid"] as boolean | undefined;
          return status === "paid" || is_paid === true;
        })
        .map((p) => p["user_id"] as number | undefined)
        .filter(Boolean) as number[];
      paidTenants = new Set(paid).size;
    }
  } catch {
    // ignore if table doesn't exist
  }

  if (paidTenants === 0) {
    try {
      // Try bills table with user_id and is_paid boolean
      const { data: bills } = await supabase
        .from("bills")
        .select("user_id, is_paid, status");
      if (Array.isArray(bills) && bills.length > 0) {
        const billsTyped = bills as unknown as Array<Record<string, unknown>>;
        const paid = billsTyped
          .filter((b) => {
            const is_paid = b["is_paid"] as boolean | undefined;
            const status = b["status"] as string | undefined;
            return is_paid === true || status === "paid";
          })
          .map((b) => b["user_id"] as number | undefined)
          .filter(Boolean) as number[];
        paidTenants = new Set(paid).size;
      }
    } catch {
      // ignore if table doesn't exist
    }
  }

  // Utility readings: rooms.is_read indicates whether meter was read
  let totalRooms = 0;
  let roomsRead = 0;
  try {
    const { data: rooms } = await supabase.from("rooms").select("id, is_read");
    if (Array.isArray(rooms)) {
      const roomsTyped = rooms as unknown as Array<Record<string, unknown>>;
      totalRooms = roomsTyped.length;
      roomsRead = roomsTyped.filter((r) => !!r["is_read"]).length;
    }
  } catch {
    // ignore
  }

  // Applied rates: try to read from `rates` table (utility_type, amount)
  let electricityRate = 12.45;
  let waterRate = 11.32;
  try {
    const { data: rates } = await supabase
      .from("rates")
      .select("utility_type, amount");
    if (Array.isArray(rates) && rates.length > 0) {
      const ratesTyped = rates as unknown as Array<Record<string, unknown>>;
      ratesTyped.forEach((r) => {
        const type = (r["utility_type"] as string | undefined)?.toLowerCase?.();
        const amt = Number(r["amount"] as unknown);
        if (!type || Number.isNaN(amt)) return;
        if (type.includes("electric")) electricityRate = amt;
        if (type.includes("water")) waterRate = amt;
      });
    }
  } catch {
    // ignore - use defaults
  }

  const tenantPaid = paidTenants;
  const tenantUnpaid = Math.max(0, totalTenants - tenantPaid);

  const roomsReadCount = roomsRead;
  const roomsUnread = Math.max(0, totalRooms - roomsReadCount);

  return (
    <div className="flex flex-1 flex-col gap-4 pt-0">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="h-full rounded-xl ">
          <ChartPieDonutText
            title="Tenant Payment Status"
            month={new Date().toLocaleString("default", { month: "long" })}
            status1="paid"
            value1={tenantPaid}
            status2="unpaid"
            value2={tenantUnpaid}
          />
        </div>
        <div className="h-full rounded-xl ">
          <ChartPieDonutText
            title="Utility Reading Status"
            month={new Date().toLocaleString("default", { month: "long" })}
            status1="read"
            value1={roomsReadCount}
            status2="unread"
            value2={roomsUnread}
            descriptor="Meters read"
            trendup={`${roomsReadCount} Rooms were read on time`}
            description={`Showing rooms have had their utility meters read for the month.`}
          />
        </div>
        <div className="aspect-video rounded-xl flex flex-col gap-4">
          <RatesCard
            title="Electricity"
            description="Applied rate for electricity consumption"
            unit="KwH"
            rate={electricityRate}
            icon="zap"
          />
          <RatesCard
            title="Water"
            description="Applied rate for water consumption"
            unit="CuM"
            rate={waterRate}
            icon="droplet"
          />
        </div>
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min"> </div>
    </div>
  );
}
