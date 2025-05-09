"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent, CardFooter } from "./ui/card";
import { useMemo, useState } from "react";
import { DataTable } from "./visualizations/data-table";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { QueryResponse } from "@/app/api/query/route";

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

  const columns: ColumnDef<(typeof data)[0]>[] = useMemo(() => {
    const keys = new Set(data.flatMap((c) => Object.keys(c)));
    return keys
      .values()
      .map((c) => {
        return {
          accessorKey: c,
          header: () => <span className="capitalize">{c}</span>,
        };
      })
      .toArray();
  }, [data]);

  return (
    <Card className="py-4 border border-foreground gap-2">
      <CardContent className="flex">
        <ScrollArea className="w-10 grow">
          <DataTable columns={columns} data={data} />
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
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
