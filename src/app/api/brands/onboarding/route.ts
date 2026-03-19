import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      companyName,
      logoUrl,
      website,
      category,
      vertical,
    } = body;

    const brand = await prisma.brand.create({
      data: {
        userId,
        companyName,
        logoUrl,
        website: website || "",
        category: category || "",
        vertical,
        onboardingComplete: true,
      },
    });

    return NextResponse.json({ brand }, { status: 201 });
  } catch (error) {
    console.error("Brand onboarding error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
