import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { content } = await req.json();

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 },
      );
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: `Please provide a concise summary of the following article:\n\n${content}`,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Failed to generate summary" },
        { status: response.status },
      );
    }

    const data = await response.json();
    const text = data?.output?.[0]?.content?.[0]?.text ?? "";
    const summary = String(text).replace(/\n/g, " ").trim();

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Failed to generate summary:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 },
    );
  }
}
