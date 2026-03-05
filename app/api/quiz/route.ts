import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  return NextResponse.json({ message: "Quiz API endpoint" });
}
