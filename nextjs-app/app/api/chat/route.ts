import { NextRequest } from "next/server";
import { Client } from "pg";

export type ChatResponse =
  | {
      success: true;
      query: string;
      data: { [field: string]: any }[];
    }
  | {
      success: false;
      error: string;
    };

interface AIResponse {
  model: string;
  id: string;
  thought: string[];
  choices: [
    {
      index: number;
      finish_reason: string;
      message: {
        role: string;
        content: string;
      };
    }
  ];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const schema = `
CREATE TABLE prices (timestamp bigint, feed text, price numeric, provider text, providertype text);

CREATE TABLE ethereum_blocks (timestamp bigint, number bigint, hash character(66), extradata text, size bigint, gasused numeric);

CREATE TABLE ethereum_transactions (timestamp bigint, hash character(66), fromaddr character(42), toaddr character(42), value numeric, gas bigint, gasprice numeric, input text, blocknumber bigint);

CREATE TABLE fetch_erc20_transfers (timestamp bigint, fromaddr character(42), toaddr character(42), value numeric, transactionhash character(66), logindex integer, blocknumber bigint);

CREATE TABLE fetch_erc20_approvals (timestamp bigint, owner character(42), spender character(42), value numeric, transactionhash character(66), logindex integer, blocknumber bigint);
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userInput = body.input;

    const aiResponse = await fetch("https://api.asi1.ai/v1/chat/completions", {
      method: "POST",
      body: JSON.stringify({
        model: "asi1-mini",
        messages: [
          {
            role: "system",
            content: `You are a program which translates natural language into read-only SQL commands. Use the following table schema: ${schema}. You only output SQL queries. If a plot is asked, include timestamp as output field. Trading pairs are in the form "<base>/<quote>", where <base> and <quote> are lowercase. All provider names are lowercase. If no provider is specified use binance, if no quote is specified use usd. Input:`,
          },
          {
            role: "user",
            content: `Translate this natural language question to SQL: ${userInput}`,
          },
        ],
        temperature: 0,
        stream: false,
        max_tokens: 0,
      }),
      headers: [["Authorization", `Bearer ${process.env.ASI_API_KEY}`]],
    }).then((res) => res.json() as Promise<AIResponse>);

    const query = aiResponse.choices[0].message.content;

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
