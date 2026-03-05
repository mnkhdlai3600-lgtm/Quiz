import { Webhook } from "svix";
import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

type Event = {
  type: string;
  data: {
    id: string;
    first_name: string;
    last_name: string;
    email_adresses: {
      email_address: string;
    }[];
  };
};

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.CLERK_SECRET_KEY;

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
      return NextResponse.json(
        { error: "Unsupported event type" },
        { status: 400 },
      );
    }

    const { id, first_name, last_name, email_adresses } = event.data;

    const email = email_adresses[0]?.email_address;

    if (!email) {
      return NextResponse.json(
        { error: "Email address not found" },
        { status: 400 },
      );
    }

    await prisma.user.create({
      data: {
        clerkId: id,
        userName: `${first_name} ${last_name}`,
        email: email_adresses[0].email_address,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to verify webhook" },
      { status: 400 },
    );
  }
}
