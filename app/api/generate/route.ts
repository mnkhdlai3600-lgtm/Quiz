import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { content } = await req.json();

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: `Generate 5 quiz questions from this article.
        Return JSON format:
        
        {
         "quizzes":[
           {
             "question":"string",
             "options":["A","B","C","D"],
             "answer":"string"
           }
         ]
        }

       Article:
       ${content}`,
      }),
    });

    const data = await response.json();
    const text = data.output[0].content[0].text;
    const parsed = JSON.parse(text);

    return NextResponse.json(parsed);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate quiz" },
      { status: 500 },
    );
  }
}
