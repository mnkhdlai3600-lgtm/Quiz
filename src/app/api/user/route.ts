import { Webhook } from "svix";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type Event = {
  type: string;
  data: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email_addresses: {
      email_address: string;
    }[];
  };
};

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("Missing CLERK_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error("Missing svix headers", {
      svixId,
      svixTimestamp,
      hasSignature: Boolean(svixSignature),
    });

    return NextResponse.json(
      { error: "Missing required headers" },
      { status: 400 },
    );
  }

  const body = await req.text();
  const webhook = new Webhook(webhookSecret);

  try {
    const event = webhook.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as Event;

    if (event.type !== "user.created") {
      return NextResponse.json(
        { message: `Ignored event: ${event.type}` },
        { status: 200 },
      );
    }

    const { id, first_name, last_name, email_addresses } = event.data;
    const email = email_addresses?.[0]?.email_address;

    if (!email) {
      return NextResponse.json(
        { error: "Email address not found" },
        { status: 400 },
      );
    }

    const baseUserName =
      [first_name, last_name].filter(Boolean).join(" ").trim() ||
      email.split("@")[0] ||
      `user_${id.slice(0, 8)}`;

    const safeUserName = `${baseUserName}_${id.slice(0, 8)}`;

    await prisma.user.upsert({
      where: { clerkId: id },
      update: {
        email,
        userName: safeUserName,
      },
      create: {
        clerkId: id,
        email,
        userName: safeUserName,
      },
    });

    return NextResponse.json(
      { message: "User synced successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Webhook verification error:", error);

    return NextResponse.json(
      { error: "Failed to verify webhook" },
      { status: 400 },
    );
  }
}
