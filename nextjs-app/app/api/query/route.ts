import { NextRequest } from "next/server";
import { Client } from "pg";

export type QueryResponse =
  | {
      success: true;
      query: string;
      data: { [field: string]: any }[];
    }
  | {
      success: false;
      error: string;
    };

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = body.query;

    const client = new Client({
      connectionString: process.env.DB_CONNECTION_STRING,
    });
    await client.connect();
    const data = await client.query(query);
    await client.end();

    return Response.json({
      success: true,
      query: query,
      data: data.rows,
    });
  } catch (e: any) {
    return Response.json({
      success: false,
      error: JSON.stringify(e),
    });
  }
}
