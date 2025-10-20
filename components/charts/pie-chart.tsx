"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";
import "../../app/globals.css";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ChartPieDonutTextProps {
  title: string;
  month?: string;
  status1?: string;
  status2?: string;
  value1?: number;
  value2?: number;
  descriptor?: string;
  trendup?: string;
  description?: string;
}

export function ChartPieDonutText({
  title,
  month,
  status1,
  status2,
  value1,
  value2,
  descriptor,
  trendup,
  description,
}: ChartPieDonutTextProps) {
  const chartData = React.useMemo(() => {
    return [
      { status: "paid", tenants: value1 ?? 0, fill: "white" },
      { status: "unpaid", tenants: value2 ?? 0, fill: "gray" },
    ];
  }, [value1, value2]);

  const chartConfig = {
    paid: {
      label: status1?.toWellFormed() ?? "Paid",
    },
    unpaid: {
      label: status2?.toWellFormed() ?? "Unpaid",
    },
  } satisfies ChartConfig;

  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.tenants, 0);
  }, [chartData]);

  const totalUnpaid = React.useMemo(() => {
    return chartData
      .filter((item) => item.status === "unpaid")
      .reduce((acc, curr) => acc + curr.tenants, 0);
  }, [chartData]);

  const totalPaid = totalVisitors - totalUnpaid;

  return (
    <Card className="flex flex-col min-h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          For the month of:{" "}
          <span className="font-bold">{month ?? "January"}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="tenants"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-xl font-bold"
                        >
                          <tspan className="">
                            {totalPaid.toLocaleString()}/
                          </tspan>
                          <tspan className="fill-neutral-400">
                            {totalVisitors.toLocaleString()}
                          </tspan>
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          {descriptor ?? "Tenants Paid"}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          {trendup ?? `${totalPaid} Tenants paid on time`}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none text-center">
          {description ??
            "Showing total tenants paid versus total tenants for the month."}
        </div>
      </CardFooter>
    </Card>
  );
}
