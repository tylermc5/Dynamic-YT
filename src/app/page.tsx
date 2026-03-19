import Link from "next/link";
import { ArrowRight, BarChart3, DollarSign, Tv, Users, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Tv className="h-8 w-8 text-red-600" />
              <span className="text-xl font-bold">DynamicYT</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-slate-900">
              Dynamic Sponsor Ads for{" "}
              <span className="text-red-600">YouTube</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-8">
              The marketplace connecting brands with YouTube creators&apos; dynamic ad slots.
              Buy targeted audience reach. Earn passive recurring income from your back catalog.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/signup?role=brand">
                <Button size="lg" className="gap-2">
                  I&apos;m a Brand <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/signup?role=creator">
                <Button size="lg" variant="outline" className="gap-2">
                  I&apos;m a Creator <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Verticals */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-slate-900 mb-12">
            Two Verticals. Infinite Reach.
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Tech</h3>
              <p className="text-slate-600">
                Reach developers, gadget enthusiasts, and early adopters through top tech creators&apos; video inventories.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fitness</h3>
              <p className="text-slate-600">
                Connect with health-conscious audiences through fitness creators&apos; workout and nutrition content.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-slate-900 mb-4">
            How It Works
          </h2>
          <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">
            Our platform handles matching, campaign management, and performance tracking.
          </p>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* For Brands */}
            <div>
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-slate-900" />
                For Brands
              </h3>
              <div className="space-y-4">
                {[
                  "Create a campaign with your target audience",
                  "Our algorithm matches you with the best creator inventory",
                  "Select videos and set your budget",
                  "Monitor real-time performance metrics",
                ].map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex-shrink-0 h-7 w-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-medium">
                      {i + 1}
                    </div>
                    <p className="text-slate-600 pt-0.5">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* For Creators */}
            <div>
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-slate-900" />
                For Creators
              </h3>
              <div className="space-y-4">
                {[
                  "Connect your YouTube channel in minutes",
                  "Set your minimum CPM and preferences",
                  "Review and approve brand placements",
                  "Earn passive recurring income from your catalog",
                ].map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex-shrink-0 h-7 w-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-medium">
                      {i + 1}
                    </div>
                    <p className="text-slate-600 pt-0.5">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Active Creators", value: "500+" },
              { label: "Videos Available", value: "25,000+" },
              { label: "Brands Served", value: "100+" },
              { label: "Impressions Delivered", value: "50M+" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-slate-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Trust */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Shield className="h-12 w-12 text-slate-900 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Fair & Transparent
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto mb-8">
            15% platform fee. Brands pay per impression. Creators get paid biweekly via Stripe Connect.
            Full performance transparency for both sides.
          </p>
          <Link href="/signup">
            <Button size="lg">Join the Platform</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tv className="h-5 w-5 text-red-600" />
              <span className="font-semibold">DynamicYT</span>
            </div>
            <p className="text-sm text-slate-500">
              &copy; 2024 DynamicYT. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
