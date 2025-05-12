"use client";

import {
  CartesianGrid,
  Line,
  LineChart as LineChartInternal,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ReactNode, useMemo } from "react";

const colors = [
  "221.2 83.2% 53.3%",
  "212 95% 68%",
  "216 92% 60%",
  "210 98% 78%",
  "212 97% 87%",
];

export function LineChart({ data }: { data: { [field: string]: any }[] }) {
  const chartConfig = useMemo(() => {
    const keys = new Set(data.flatMap((c) => Object.keys(c)));
    keys.delete("timestamp");
    return keys
      .values()
      .map((c, i) => {
        return {
          key: c,
          label: <span className="capitalize">{c}</span>,
          color: `hsl(${colors[i]})`,
        };
      })
      .toArray()
      .reduce((prev, cur) => {
        prev[cur.key] = { label: cur.label, color: cur.color };
        return prev;
      }, {} as { [field: string]: { label: ReactNode; color: string } });
  }, [data]);

  const domain = useMemo(() => {
    return data.reduce(
      (prev, cur) => {
        const values = Object.keys(cur)
          .filter((k) => k !== "timestamp")
          .map((k) => parseFloat(cur[k]));
        return [
          values.reduce((prev, cur) => Math.min(prev, cur), prev[0]),
          values.reduce((prev, cur) => Math.max(prev, cur), prev[1]),
        ];
      },
      [-Infinity, Infinity]
    ) as [number, number];
  }, [data]);

  console.log(domain);

  return (
    <ChartContainer className="max-w-[1000px]" config={chartConfig}>
      <LineChartInternal
        accessibilityLayer
        data={data}
        margin={{
          left: 12,
          right: 12,
          top: 5,
          bottom: 5,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="timestamp"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value}
        />
        <YAxis
          domain={["dataMin", "dataMax"]}
          tickFormatter={(value) => {
            const num = parseFloat(value);
            if (num < 10) {
              return num.toPrecision(3);
            }
            return num.toFixed(0);
          }}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel={true} />}
        />
        {Object.keys(chartConfig).map((f) => (
          <Line
            dataKey={f}
            type="linear"
            stroke={`var(--color-${f})`}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChartInternal>
    </ChartContainer>
  );
}
