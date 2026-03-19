import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      channelName,
      youtubeChannelId,
      avatarUrl,
      subscriberCount,
      vertical,
      minCpmFloor,
      blockedBrandCategories,
    } = body;

    const creator = await prisma.creator.create({
      data: {
        userId,
        channelName,
        youtubeChannelId,
        avatarUrl,
        subscriberCount: subscriberCount || 0,
        vertical,
        minCpmFloor: minCpmFloor || 15.0,
        blockedBrandCategories: blockedBrandCategories || [],
        onboardingComplete: true,
      },
    });

    return NextResponse.json({ creator }, { status: 201 });
  } catch (error) {
    console.error("Creator onboarding error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
