import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { matchVideos } from "@/lib/matching";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      include: { brand: true },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const videos = await prisma.video.findMany({
      where: {
        dynamicSlotAvailable: true,
        creator: {
          vertical: campaign.vertical,
        },
      },
      include: {
        creator: true,
      },
    });

    const results = matchVideos(videos as any, {
      vertical: campaign.vertical,
      targetAudienceAgeMin: campaign.targetAudienceAgeMin,
      targetAudienceAgeMax: campaign.targetAudienceAgeMax,
      targetAudienceGender: campaign.targetAudienceGender,
      targetGeos: campaign.targetGeos,
      maxCpm: Number(campaign.maxCpm),
      brandCategory: campaign.brand.category,
    });

    return NextResponse.json({ matches: results });
  } catch (error) {
    console.error("Match error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
