"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Megaphone,
  DollarSign,
  Eye,
  MousePointerClick,
  Plus,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";

// ── Placeholder data ───────────────────────────────────────────────────────────

const PLACEHOLDER_STATS = {
  activeCampaigns: 3,
  totalBudgetSpent: 14250,
  totalImpressions: 1_820_000,
  avgCtr: 2.4,
};

const PLACEHOLDER_CAMPAIGNS = [
  {
    id: "c1",
    name: "Q2 SaaS Launch",
    status: "active",
    vertical: "tech",
    budgetTotal: 10000,
    budgetRemaining: 3800,
    placementCount: 8,
  },
  {
    id: "c2",
    name: "Spring Fitness Promo",
    status: "active",
    vertical: "fitness",
    budgetTotal: 8000,
    budgetRemaining: 1200,
    placementCount: 12,
  },
  {
    id: "c3",
    name: "Developer Tools Campaign",
    status: "active",
    vertical: "tech",
    budgetTotal: 5000,
    budgetRemaining: 4100,
    placementCount: 3,
  },
];

const PLACEHOLDER_PLACEMENTS = [
  {
    id: "p1",
    videoTitle: "Top 10 VS Code Extensions 2024",
    creator: "CodeWithAlex",
    status: "active",
    impressions: 320_000,
    cost: 1_600,
  },
  {
    id: "p2",
    videoTitle: "Morning Workout Routine",
    creator: "FitWithJen",
    status: "active",
    impressions: 280_000,
    cost: 1_400,
  },
  {
    id: "p3",
    videoTitle: "Building a SaaS in 30 Days",
    creator: "IndieHackerPro",
    status: "creator_approved",
    impressions: 0,
    cost: 0,
  },
  {
    id: "p4",
    videoTitle: "Full Body HIIT Workout",
    creator: "HealthFirst",
    status: "completed",
    impressions: 510_000,
    cost: 2_550,
  },
  {
    id: "p5",
    videoTitle: "React 19 New Features",
    creator: "ReactMastery",
    status: "proposed",
    impressions: 0,
    cost: 0,
  },
];

const SPEND_DATA = [
  { date: "Mar 1", spend: 800 },
  { date: "Mar 5", spend: 1200 },
  { date: "Mar 8", spend: 950 },
  { date: "Mar 11", spend: 1800 },
  { date: "Mar 14", spend: 2100 },
  { date: "Mar 17", spend: 1650 },
  { date: "Mar 19", spend: 2200 },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  active: "success",
  draft: "secondary",
  pending_review: "warning",
  paused: "outline",
  completed: "secondary",
  proposed: "outline",
  creator_approved: "warning",
  creator_rejected: "destructive",
};

function statusLabel(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function BrandDashboardPage() {
  const [campaigns, setCampaigns] = useState(PLACEHOLDER_CAMPAIGNS);
  const [placements, setPlacements] = useState(PLACEHOLDER_PLACEMENTS);
  const [stats, setStats] = useState(PLACEHOLDER_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const userRes = await fetch("/api/auth/me");
        if (!userRes.ok) return;
        const { user } = await userRes.json();
        const brandId = user?.brand?.id;
        if (!brandId) return;

        const [campRes, placRes] = await Promise.all([
          fetch(`/api/campaigns?brandId=${brandId}`),
          fetch(`/api/placements?campaignId=&brandId=${brandId}`),
        ]);

        if (campRes.ok) {
          const { campaigns: c } = await campRes.json();
          if (c?.length) setCampaigns(c);
        }
        if (placRes.ok) {
          const { placements: p } = await placRes.json();
          if (p?.length) setPlacements(p);
        }
      } catch {
        // fall through to placeholder data
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const activeCampaigns = campaigns.filter((c) => c.status === "active");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Brand Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor your campaigns and ad performance
          </p>
        </div>
        <Button asChild>
          <Link href="/brand/campaigns/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Link>
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Active Campaigns"
          value={stats.activeCampaigns.toString()}
          icon={<Megaphone className="h-5 w-5 text-blue-600" />}
          bg="bg-blue-50"
          change="+1 this month"
        />
        <SummaryCard
          title="Total Budget Spent"
          value={formatCurrency(stats.totalBudgetSpent)}
          icon={<DollarSign className="h-5 w-5 text-emerald-600" />}
          bg="bg-emerald-50"
          change="+12% vs last month"
        />
        <SummaryCard
          title="Total Impressions"
          value={formatNumber(stats.totalImpressions)}
          icon={<Eye className="h-5 w-5 text-violet-600" />}
          bg="bg-violet-50"
          change="+8% vs last month"
        />
        <SummaryCard
          title="Avg CTR"
          value={`${stats.avgCtr}%`}
          icon={<MousePointerClick className="h-5 w-5 text-amber-600" />}
          bg="bg-amber-50"
          change="+0.3pp vs last month"
        />
      </div>

      {/* Spend chart + active campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spend over time */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Spend Over Time</CardTitle>
                <CardDescription>Daily ad spend — March 2026</CardDescription>
              </div>
              <TrendingUp className="h-5 w-5 text-slate-400" />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={SPEND_DATA} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="#94a3b8"
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  formatter={(v) => [formatCurrency(Number(v)), "Spend"]}
                  contentStyle={{
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="spend"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#spendGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Active campaigns with budget progress */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Active Campaigns</CardTitle>
              <Link
                href="/brand/campaigns"
                className="text-xs text-blue-600 hover:underline flex items-center gap-0.5"
              >
                View all <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {activeCampaigns.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">
                No active campaigns.
              </p>
            ) : (
              activeCampaigns.map((c) => {
                const spent = c.budgetTotal - c.budgetRemaining;
                const pct = Math.round((spent / c.budgetTotal) * 100);
                return (
                  <div key={c.id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/brand/campaigns/${c.id}`}
                        className="text-sm font-medium text-slate-800 hover:text-blue-600 truncate max-w-[160px]"
                      >
                        {c.name}
                      </Link>
                      <span className="text-xs text-slate-500">{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{formatCurrency(spent)} spent</span>
                      <span>{formatCurrency(c.budgetTotal)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent placements table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Placements</CardTitle>
          <CardDescription>Latest ad placements across all campaigns</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Video</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Impressions</TableHead>
                <TableHead className="text-right">Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {placements.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium max-w-[220px] truncate">
                    {p.videoTitle}
                  </TableCell>
                  <TableCell className="text-slate-600">{p.creator}</TableCell>
                  <TableCell>
                    <Badge variant={(STATUS_STYLES[p.status] as any) ?? "secondary"}>
                      {statusLabel(p.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-slate-700">
                    {p.impressions ? formatNumber(p.impressions) : "—"}
                  </TableCell>
                  <TableCell className="text-right text-slate-700">
                    {p.cost ? formatCurrency(p.cost) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function SummaryCard({
  title,
  value,
  icon,
  bg,
  change,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  bg: string;
  change: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-500 mb-1">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-400 mt-1">{change}</p>
          </div>
          <div className={cn("p-2 rounded-lg", bg)}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
