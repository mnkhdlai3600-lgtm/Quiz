import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const { quizzes } = await req.json();

    if (!quizzes || !Array.isArray(quizzes)) {
      return NextResponse.json(
        { error: "Invalid quizzes data" },
        { status: 400 },
      );
    }

    const result = await prisma.quiz.createMany({
      data: quizzes.map((q: any) => ({
        question: q.question,
        option: q.options,
        answer: String(q.answer),
        articleId: id,
      })),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to create quizzes:", error);
    return NextResponse.json(
      { error: "Failed to create quizzes" },
      { status: 500 },
    );
  }
}
