import { Webhook } from "svix";
import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

// 1. Төрлийг Clerk-ийн албан ёсны бүтэцтэй ижил болгох
type Event = {
  type: string;
  data: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email_addresses: {
      // 'ss' нэмсэн
      email_address: string;
    }[];
  };
};

export async function POST(req: NextRequest) {
  // 2. Clerk Webhook Secret нь CLERK_SECRET_KEY биш
  // SIGNING_SECRET эсвэл WEBHOOK_SECRET байх ёстой шүү
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: "Secret not found" }, { status: 500 });
  }

  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing headers" }, { status: 400 });
  }

  const body = await req.text();
  const webhook = new Webhook(webhookSecret);

  try {
    const event = webhook.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as Event;

    if (event.type === "user.created") {
      const { id, first_name, last_name, email_addresses } = event.data;
      const email = email_addresses[0]?.email_address;

      if (!email) {
        return NextResponse.json({ error: "No email" }, { status: 400 });
      }

      // Хэрэглэгч үүсгэх (userName хоосон байж болохгүй тул fallback нэмэв)
      const fullName =
        `${first_name ?? ""} ${last_name ?? ""}`.trim() || email.split("@")[0];

      await prisma.user.create({
        data: {
          clerkId: id,
          userName: fullName,
          email: email,
        },
      });

      return NextResponse.json({ message: "User created" }, { status: 201 });
    }

    return NextResponse.json({ message: "Event ignored" }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
}
