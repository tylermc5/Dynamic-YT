"use client";

import { Tv } from "lucide-react";
import Link from "next/link";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Tv className="h-7 w-7 text-red-600" />
              <span className="text-lg font-bold text-slate-900">DynamicYT</span>
            </Link>
            <div className="ml-4 pl-4 border-l border-slate-200">
              <span className="text-sm text-slate-500">Account Setup</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex items-start justify-center py-12 px-4">
        <div className="w-full max-w-2xl">{children}</div>
      </main>
    </div>
  );
}
