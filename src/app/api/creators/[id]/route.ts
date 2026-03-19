import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const creator = await prisma.creator.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        videos: { orderBy: { monthlyViews: "desc" } },
        placements: {
          include: {
            campaign: { include: { brand: true } },
            video: true,
          },
        },
      },
    });

    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    return NextResponse.json({ creator });
  } catch (error) {
    console.error("Get creator error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const creator = await prisma.creator.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json({ creator });
  } catch (error) {
    console.error("Update creator error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
