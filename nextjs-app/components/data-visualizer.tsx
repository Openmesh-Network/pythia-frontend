"use client";

import { Card, CardContent, CardFooter } from "./ui/card";
import { useMemo, useState } from "react";
import { DataTable } from "./visualizations/data-table";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { QueryResponse } from "@/app/api/query/route";
import { LineChart } from "./visualizations/line-chart";

export function DataVisualizer({
  query,
  data,
  update,
}: {
  query: string;
  data: { [field: string]: any }[];
  update: (updated: QueryResponse) => void;
}) {
  const [queryShown, setQueryShown] = useState<boolean>(false);
  const visualizationMethod: "table" | "chart" = useMemo(() => {
    if (
      data.length > 1 &&
      !data.some((c) => Object.keys(c).length > 5) &&
      !data.some((c) => Object.values(c).some((v) => typeof v !== "number")) &&
      !data.some((c) => !Object.keys(c).includes("timestamp"))
    ) {
      return "chart";
    }

    return "table";
  }, [data]);

  return (
    <Card className="py-4 border border-foreground gap-2">
      <CardContent>
        {visualizationMethod === "table" && (
          <div className="flex">
            <ScrollArea className="w-10 grow">
              <DataTable data={data} />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        )}
        {visualizationMethod === "chart" && <LineChart data={data} />}
      </CardContent>
      <CardFooter>
        <div className="flex flex-col gap-2">
          <div className="flex gap-3">
            <Button
              onClick={() => {
                fetch("/api/query", {
                  method: "POST",
                  body: JSON.stringify({
                    query: query,
                  }),
                })
                  .then((res) => res.json() as Promise<QueryResponse>)
                  .then((data) => update(data));
              }}
            >
              Refresh
            </Button>
            <Button onClick={() => setQueryShown((shown) => !shown)}>
              {queryShown ? "Hide Query" : "Show Query"}
            </Button>
          </div>
          {queryShown && <span>{query}</span>}
        </div>
      </CardFooter>
    </Card>
  );
}
