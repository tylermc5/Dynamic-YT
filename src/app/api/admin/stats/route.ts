import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalCreators,
      totalBrands,
      totalCampaigns,
      activeCampaigns,
      totalPlacements,
      activePlacements,
    ] = await Promise.all([
      prisma.creator.count(),
      prisma.brand.count(),
      prisma.campaign.count(),
      prisma.campaign.count({ where: { status: "active" } }),
      prisma.placement.count(),
      prisma.placement.count({ where: { status: "active" } }),
    ]);

    // Calculate GMV and revenue
    const placementAggregates = await prisma.placement.aggregate({
      _sum: {
        costToBrand: true,
        creatorPayout: true,
      },
    });

    const gmv = Number(placementAggregates._sum.costToBrand || 0);
    const platformRevenue = gmv - Number(placementAggregates._sum.creatorPayout || 0);

    return NextResponse.json({
      totalCreators,
      totalBrands,
      totalCampaigns,
      activeCampaigns,
      totalPlacements,
      activePlacements,
      gmv,
      platformRevenue,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
