import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const supabase = createServerClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // Get user role and onboarding status
    const user = await prisma.user.findUnique({
      where: { email },
      include: { creator: true, brand: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const onboardingComplete =
      user.role === "creator"
        ? user.creator?.onboardingComplete ?? false
        : user.role === "brand"
        ? user.brand?.onboardingComplete ?? false
        : true;

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, role: user.role },
      role: user.role,
      onboardingComplete,
    });

    // Set auth cookie
    response.cookies.set("auth-token", data.session?.access_token ?? "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    response.cookies.set("user-role", user.role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
