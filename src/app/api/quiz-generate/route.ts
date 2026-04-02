import { NextResponse } from "next/server";

type QuizItem = {
  question: string;
  options: string[];
  answer: string;
};

const extractTextFromResponse = (data: any): string => {
  const output = data?.output;

  if (!Array.isArray(output)) return "";

  for (const item of output) {
    if (!Array.isArray(item?.content)) continue;

    for (const content of item.content) {
      if (typeof content?.text === "string" && content.text.trim()) {
        return content.text.trim();
      }
    }
  }

  return "";
};

const normalizeQuizPayload = (parsed: any): { quizzes: QuizItem[] } | null => {
  if (!parsed || !Array.isArray(parsed.quizzes)) return null;

  const quizzes: QuizItem[] = parsed.quizzes
    .map((q: any) => {
      const options: string[] = Array.isArray(q?.options)
        ? q.options.map((opt: any) => String(opt))
        : [];

      let answer = String(q?.answer ?? "").trim();

      if (!["0", "1", "2", "3"].includes(answer)) {
        const answerIndex = options.findIndex(
          (opt: string) => opt.trim().toLowerCase() === answer.toLowerCase(),
        );

        if (answerIndex !== -1) {
          answer = String(answerIndex);
        }
      }

      return {
        question: String(q?.question ?? "").trim(),
        options,
        answer,
      };
    })
    .filter(
      (q: QuizItem) =>
        q.question.length > 0 &&
        q.options.length === 4 &&
        ["0", "1", "2", "3"].includes(q.answer),
    );

  if (quizzes.length === 0) return null;

  return { quizzes };
};

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
        input: `Generate 5 multiple choice quiz questions from this article.

Return valid JSON only.
Do not use markdown.
Do not wrap the JSON in backticks.

Return exactly this shape:
{
  "quizzes": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "answer": "0"
    }
  ]
}

Rules:
- options must always contain exactly 4 choices
- answer must be the correct option index as a string: "0", "1", "2", or "3"
- questions must be based only on the article

Article:
${content}`,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();

      return NextResponse.json(
        { error: errorText || "Failed to generate quiz" },
        { status: response.status },
      );
    }

    const data = await response.json();
    const rawText = extractTextFromResponse(data);

    if (!rawText) {
      return NextResponse.json(
        { error: "Empty response from OpenAI" },
        { status: 500 },
      );
    }

    let parsed: any;

    try {
      parsed = JSON.parse(rawText);
    } catch {
      const cleaned = rawText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();

      parsed = JSON.parse(cleaned);
    }

    const normalized = normalizeQuizPayload(parsed);

    if (!normalized) {
      return NextResponse.json(
        { error: "Invalid quiz format returned from OpenAI" },
        { status: 500 },
      );
    }

    return NextResponse.json(normalized);
  } catch (error) {
    console.error("Failed to generate quiz:", error);

    return NextResponse.json(
      { error: "Failed to generate quiz" },
      { status: 500 },
    );
  }
}
