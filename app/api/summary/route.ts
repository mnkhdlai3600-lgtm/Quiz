import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { content } = await req.json();

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: `Please provide a concise summary of the following article: ${content}`,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json({ error: errorText }, { status: response.status });
  }

  const data = await response.json();
  const text = data.output[0].content[0].text;

  const formattedText = text.replace(/\n/g, " ");

  return NextResponse.json(formattedText || "");
}
