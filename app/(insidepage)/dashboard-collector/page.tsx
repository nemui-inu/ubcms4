import { ChartPieDonutText } from "@/components/charts/pie-chart";
import RatesCard from "@/components/overdue-card";
import RoomsTable from "@/app/(insidepage)/rooms/room-table";
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const { data: rooms } = await supabase.from("rooms").select();

  return (
    <div className="flex flex-1 flex-col gap-4 pt-0">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="h-full rounded-xl ">
          <ChartPieDonutText
            title="Electricity Meters Read"
            month="August"
            status1="read"
            value1={210}
            status2="unread"
            value2={90}
            descriptor="Meters read"
            trendup={`${223} electricity meters read on time`}
            description="Showing electricity meters read for the month"
          />
        </div>
        <div className="h-full rounded-xl ">
          <ChartPieDonutText
            title="Water Meters Read"
            month="August"
            status1="read"
            value1={190}
            status2="unread"
            value2={110}
            descriptor="Meters read"
            trendup={`${190} water meters read on time`}
            description="Showing water meters read for the month"
          />
        </div>
        <div className="aspect-video rounded-xl flex flex-col gap-4">
          <RatesCard
            title="Electricity"
            description="Rooms with overdue electricity bills"
            icon="zap"
            buttonText="View Rooms"
            body="No overdue rooms."
          />
          <RatesCard
            title="Water"
            description="Rooms with overdue water bills"
            icon="droplet"
            buttonText="View Rooms"
            body="No overdue rooms."
          />
        </div>
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
        <RoomsTable initialRooms={rooms ?? []} />
      </div>
    </div>
  );
}
