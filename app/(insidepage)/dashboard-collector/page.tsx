"use client";
import { ChartPieDonutText } from "@/components/charts/pie-chart";
import RatesCard from "@/components/overdue-card";
import CollectorReadingsTable from "@/components/collector-readings-table";
import dynamic from "next/dynamic";
import { useState } from "react";
const CreateReadingModal = dynamic(
  () => import("@/components/modals/create-reading-modal"),
  { ssr: false }
);

export default function Page() {
  // NOTE: This page is now a client component to support modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // fetch rooms client-side (for consistency with CollectorReadingsTable)
  // If you want SSR, refactor CollectorReadingsTable to support SSR
  // For now, just pass empty array

  return (
    <div className="flex flex-1 flex-col gap-4 pt-0">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="h-full rounded-xl ">
          <ChartPieDonutText
            title="Electricity Meters Read"
            month={new Date().toLocaleString("default", { month: "long" })}
            status1="read"
            value1={0}
            status2="unread"
            value2={0}
            descriptor="Meters read"
            trendup={`0 electricity meters read on time`}
            description="Showing electricity meters read for the month"
          />
        </div>
        <div className="h-full rounded-xl ">
          <ChartPieDonutText
            title="Water Meters Read"
            month={new Date().toLocaleString("default", { month: "long" })}
            status1="read"
            value1={0}
            status2="unread"
            value2={0}
            descriptor="Meters read"
            trendup={`0 water meters read on time`}
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
      {/* Removed Add Reading button. Modal can be triggered externally. */}
      <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
        <CollectorReadingsTable initialRooms={[]} />
      </div>
      <CreateReadingModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={() => {
          // TODO: Insert reading into DB, refresh table, show toast
          setCreateModalOpen(false);
        }}
      />
    </div>
  );
}
