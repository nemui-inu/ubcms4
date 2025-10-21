import { ChartPieDonutText } from "@/components/charts/pie-chart";
import RatesCard from "@/components/overdue-card";
import TransactionHistory from "@/components/bills-due";

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 pt-0">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="h-full rounded-xl ">
          <ChartPieDonutText
            title="Electricity Bills Paid"
            month="January - December 2025"
            status1="paid"
            value1={6}
            status2="unpaid"
            value2={0}
            descriptor="Bills paid"
            trendup={`${6} bills electric paid on time`}
            description="Showing bills paid for the whole year"
          />
        </div>
        <div className="h-full rounded-xl ">
          <ChartPieDonutText
            title="Water Bills Paid"
            month="January - December 2025"
            status1="paid"
            value1={5}
            status2="unpaid"
            value2={1}
            descriptor="Bills paid"
            trendup={`${6} water bills paid on time`}
            description="Showing water bills paid for the whole year"
          />
        </div>
        <div className="aspect-video rounded-xl flex flex-col gap-4">
          <RatesCard
            title="Electricity"
            description="Overdue electricity bills"
            icon="zap"
            body=""
          />
          <RatesCard
            title="Water"
            description="Overdue water bills"
            icon="droplet"
            body=""
          />
        </div>
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
        <TransactionHistory />
      </div>
    </div>
  );
}
