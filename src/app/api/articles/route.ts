import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json([], { status: 200 });
    }

    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json([], { status: 200 });
    }

    const email = clerkUser.emailAddresses?.[0]?.emailAddress ?? "";

    const baseUserName =
      [clerkUser.firstName, clerkUser.lastName]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      email.split("@")[0] ||
      `user_${clerkId.slice(0, 8)}`;

    const safeUserName = `${baseUserName}_${clerkId.slice(0, 8)}`;

    await prisma.user.upsert({
      where: { clerkId },
      update: {
        email,
        userName: safeUserName,
      },
      create: {
        clerkId,
        email,
        userName: safeUserName,
      },
    });

    const articles = await prisma.article.findMany({
      where: { userId: clerkId },
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

    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json(
        { error: "User not found in Clerk" },
        { status: 404 },
      );
    }

    const { title, content, summary } = await req.json();

    if (!title || !content || !summary) {
      return NextResponse.json(
        { error: "Title, content, and summary are required" },
        { status: 400 },
      );
    }

    const email = clerkUser.emailAddresses?.[0]?.emailAddress ?? "";

    const baseUserName =
      [clerkUser.firstName, clerkUser.lastName]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      email.split("@")[0] ||
      `user_${clerkId.slice(0, 8)}`;

    const safeUserName = `${baseUserName}_${clerkId.slice(0, 8)}`;

    await prisma.user.upsert({
      where: { clerkId },
      update: {
        email,
        userName: safeUserName,
      },
      create: {
        clerkId,
        email,
        userName: safeUserName,
      },
    });

    const article = await prisma.article.create({
      data: {
        title,
        content,
        summary,
        userId: clerkId,
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
