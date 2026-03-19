import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PLATFORM_FEE_RATE } from "@/lib/utils";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status } = body;

    const placement = await prisma.placement.update({
      where: { id: params.id },
      data: { status },
      include: {
        campaign: true,
      },
    });

    // If creator approved, check if all placements for campaign are resolved
    if (status === "creator_approved" || status === "creator_rejected") {
      const pendingPlacements = await prisma.placement.count({
        where: {
          campaignId: placement.campaignId,
          status: "proposed",
        },
      });

      if (pendingPlacements === 0) {
        const approvedCount = await prisma.placement.count({
          where: {
            campaignId: placement.campaignId,
            status: "creator_approved",
          },
        });

        if (approvedCount > 0) {
          // Activate approved placements if campaign start date has arrived
          const campaign = placement.campaign;
          const now = new Date();
          if (campaign.startDate <= now) {
            await prisma.placement.updateMany({
              where: {
                campaignId: placement.campaignId,
                status: "creator_approved",
              },
              data: { status: "active" },
            });
            await prisma.campaign.update({
              where: { id: placement.campaignId },
              data: { status: "active" },
            });
          }
        }
      }
    }

    return NextResponse.json({ placement });
  } catch (error) {
    console.error("Update placement error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
