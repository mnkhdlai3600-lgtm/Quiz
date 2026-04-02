import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const articleId = searchParams.get("articleId");

    if (!articleId) {
      return NextResponse.json(
        { error: "articleId is required" },
        { status: 400 },
      );
    }

    const scores = await prisma.score.findMany({
      where: { articleId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(scores);
  } catch (error) {
    console.error("Failed to fetch scores:", error);
    return NextResponse.json(
      { error: "Failed to fetch scores" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { articleId, score, timeSpent } = await req.json();

    if (
      !articleId ||
      typeof score !== "number" ||
      typeof timeSpent !== "number"
    ) {
      return NextResponse.json(
        { error: "articleId, score, and timeSpent are required" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const savedScore = await prisma.score.create({
      data: {
        userId: user.clerkId,
        articleId,
        score,
        timeSpent,
      },
    });

    return NextResponse.json(savedScore, { status: 201 });
  } catch (error) {
    console.error("Failed to save score:", error);
    return NextResponse.json(
      { error: "Failed to save score" },
      { status: 500 },
    );
  }
}
