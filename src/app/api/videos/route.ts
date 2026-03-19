import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creatorId = searchParams.get("creatorId");

    const where: any = {};
    if (creatorId) where.creatorId = creatorId;

    const videos = await prisma.video.findMany({
      where,
      include: { creator: true },
      orderBy: { monthlyViews: "desc" },
    });

    return NextResponse.json({ videos });
  } catch (error) {
    console.error("Get videos error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    const video = await prisma.video.update({
      where: { id },
      data,
    });

    return NextResponse.json({ video });
  } catch (error) {
    console.error("Update video error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
