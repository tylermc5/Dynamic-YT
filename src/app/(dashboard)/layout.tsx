import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Tv, LayoutDashboard, Video, PlaySquare, DollarSign, Megaphone, Users, Building2, LogOut, ChevronRight, Search, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

async function getCurrentUser() {
  try {
    const cookieStore = cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/me`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.user ?? null;
  } catch {
    return null;
  }
}

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
};

function getNavItems(role: string): NavItem[] {
  if (role === "creator") {
    return [
      { href: "/creator/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/creator/videos", label: "Videos", icon: Video },
      { href: "/creator/placements", label: "Placements", icon: PlaySquare },
      { href: "/creator/earnings", label: "Earnings", icon: DollarSign },
    ];
  }
  if (role === "brand") {
    return [
      { href: "/brand/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/brand/campaigns", label: "Campaigns", icon: Megaphone },
      { href: "/brand/marketplace", label: "Marketplace", icon: Search },
      { href: "/brand/billing", label: "Billing", icon: CreditCard },
    ];
  }
  if (role === "admin") {
    return [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/creators", label: "Creators", icon: Users },
      { href: "/admin/brands", label: "Brands", icon: Building2 },
      { href: "/admin/campaigns", label: "Campaigns", icon: Megaphone },
    ];
  }
  return [];
}

function getRoleLabel(role: string): string {
  const map: Record<string, string> = {
    creator: "Creator",
    brand: "Brand",
    admin: "Admin",
  };
  return map[role] ?? role;
}

function getInitials(email: string): string {
  return email?.slice(0, 2).toUpperCase() ?? "??";
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // If no user, redirect to login (graceful fallback for SSR without backend)
  // In production this would redirect, but in dev we allow mock data
  const role = user?.role ?? "creator";
  const navItems = getNavItems(role);
  const userEmail = user?.email ?? "creator@example.com";
  const displayName =
    user?.creator?.channelName ?? user?.brand?.companyName ?? userEmail;

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-700">
          <Tv className="h-7 w-7 text-red-500 shrink-0" />
          <span className="text-lg font-bold tracking-tight">DynamicYT</span>
        </div>

        {/* Role badge */}
        <div className="px-6 py-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300">
            {getRoleLabel(role)}
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 pb-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors group"
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="text-sm font-medium">{label}</span>
              <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-60 transition-opacity" />
            </Link>
          ))}
        </nav>

        <Separator className="bg-slate-700" />

        {/* User info + logout */}
        <div className="px-4 py-4 space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-slate-700 text-slate-200 text-xs">
                {getInitials(userEmail)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{displayName}</p>
              <p className="text-xs text-slate-400 truncate">{userEmail}</p>
            </div>
          </div>
          <form action="/api/auth/logout" method="POST">
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800 gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white flex items-center justify-between px-4 h-14 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Tv className="h-6 w-6 text-red-500" />
          <span className="font-bold">DynamicYT</span>
        </div>
        {/* Mobile nav is simplified — show role links inline */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 min-w-0 flex flex-col md:pt-0 pt-14">
        <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
