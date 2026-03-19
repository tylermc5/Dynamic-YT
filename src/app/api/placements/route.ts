import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PLATFORM_FEE_RATE } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creatorId = searchParams.get("creatorId");
    const campaignId = searchParams.get("campaignId");
    const status = searchParams.get("status");

    const where: any = {};
    if (creatorId) where.creatorId = creatorId;
    if (campaignId) where.campaignId = campaignId;
    if (status) where.status = status;

    const placements = await prisma.placement.findMany({
      where,
      include: {
        campaign: { include: { brand: true } },
        video: true,
        creator: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ placements });
  } catch (error) {
    console.error("Get placements error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignId, selections } = body;

    // selections is array of { videoId, creatorId, agreedCpm }
    const placements = await prisma.$transaction(
      selections.map((s: any) =>
        prisma.placement.create({
          data: {
            campaignId,
            videoId: s.videoId,
            creatorId: s.creatorId,
            agreedCpm: s.agreedCpm,
            status: "proposed",
          },
        })
      )
    );

    // Update campaign status to pending_review
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: "pending_review" },
    });

    return NextResponse.json({ placements }, { status: 201 });
  } catch (error) {
    console.error("Create placements error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
