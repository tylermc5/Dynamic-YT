import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get("brandId");
    const status = searchParams.get("status");

    const where: any = {};
    if (brandId) where.brandId = brandId;
    if (status) where.status = status;

    const campaigns = await prisma.campaign.findMany({
      where,
      include: {
        brand: true,
        placements: {
          include: {
            video: true,
            creator: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error("Get campaigns error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      brandId,
      name,
      vertical,
      targetAudienceAgeMin,
      targetAudienceAgeMax,
      targetAudienceGender,
      targetGeos,
      budgetTotal,
      maxCpm,
      startDate,
      endDate,
      adCreativeUrl,
    } = body;

    const campaign = await prisma.campaign.create({
      data: {
        brandId,
        name,
        vertical,
        targetAudienceAgeMin,
        targetAudienceAgeMax,
        targetAudienceGender: targetAudienceGender || "all",
        targetGeos: targetGeos || [],
        budgetTotal,
        budgetRemaining: budgetTotal,
        maxCpm,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        adCreativeUrl: adCreativeUrl || "",
        status: "draft",
      },
    });

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    console.error("Create campaign error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
