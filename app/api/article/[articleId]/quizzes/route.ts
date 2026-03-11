import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ articleId: string }> },
) {
  const { articleId } = await params;
  try {
    const { quizzes } = await req.json();

    const result = await prisma.quiz.createMany({
      data: quizzes.map((q: any) => ({
        question: q.question,
        options: q.options,
        answer: q.answer,
        articleId: articleId,
      })),
    });
    if (!quizzes || !Array.isArray(quizzes)) {
      return NextResponse.json(
        { error: "Invalid quizzes data" },
        { status: 400 },
      );
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create quizzes" },
      { status: 500 },
    );
  }
}
