import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const article = await prisma.article.findUnique({
      where: { id },
      include: { quizzes: true },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const normalizedArticle = {
      ...article,
      quizzes: article.quizzes.map((quiz) => ({
        ...quiz,
        options: quiz.option,
      })),
    };

    return NextResponse.json(normalizedArticle);
  } catch (error) {
    console.error("Failed to fetch article:", error);
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 },
    );
  }
}
