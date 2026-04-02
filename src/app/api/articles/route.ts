import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const articles = await prisma.article.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(articles);
  } catch (error) {
    console.error("Failed to fetch articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
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

    const { title, content, summary } = await req.json();

    if (!title || !content || !summary) {
      return NextResponse.json(
        { error: "Title, content, and summary are required" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const article = await prisma.article.create({
      data: {
        title,
        content,
        summary,
        userId: user.clerkId,
      },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error("Failed to create article:", error);
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 500 },
    );
  }
}
