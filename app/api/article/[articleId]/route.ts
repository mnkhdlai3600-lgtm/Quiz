import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ articleId: string }> },
) {
  const { articleId } = await params;
  try {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: { quizzes: true },
    });
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }
    return NextResponse.json(article);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 },
    );
  }
}
