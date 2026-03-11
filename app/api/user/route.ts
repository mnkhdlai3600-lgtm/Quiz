import { Webhook } from "svix";

import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

type Event = {
  type: string;
  data: {
    id: string;
    first_name: string;
    last_name: string;
    email_addresses: {
      email_address: string;
    }[];
  };
};

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.log("Missing required headers");
    return NextResponse.json(
      { error: "Missing required headers" },
      { status: 400 },
    );
  }

  const webhook = new Webhook(webhookSecret);
  const body = await req.text();

  try {
    const event = webhook.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as Event;

    if (event.type !== "user.created") {
      console.log("Unsupported event type:", event.type);
      return NextResponse.json(
        { error: "Unsupported event type" },
        { status: 400 },
      );
    }

    const { id, first_name, last_name, email_addresses } = event.data;

    const email = email_addresses[0]?.email_address;

    if (!email) {
      console.log("Email address not found");
      return NextResponse.json(
        { error: "Email address not found" },
        { status: 400 },
      );
    }

    await prisma.user.create({
      data: {
        email,
        clerkId: id,
        userName: `${first_name} ${last_name}`,
      },
    });

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to verify webhook" },
      { status: 400 },
    );
  }
}
