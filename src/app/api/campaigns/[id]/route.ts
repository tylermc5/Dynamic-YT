import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      include: {
        brand: true,
        placements: {
          include: {
            video: true,
            creator: true,
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error("Get campaign error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const campaign = await prisma.campaign.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error("Update campaign error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
