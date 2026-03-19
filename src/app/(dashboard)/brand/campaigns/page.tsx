"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Megaphone, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

type CampaignStatus =
  | "draft"
  | "pending_review"
  | "active"
  | "paused"
  | "completed";

interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  vertical: string;
  budgetTotal: number;
  budgetRemaining: number;
  maxCpm: number;
  startDate: string;
  endDate: string;
  placementCount?: number;
  impressions?: number;
  clicks?: number;
}

// ── Placeholder data ───────────────────────────────────────────────────────────

const PLACEHOLDER_CAMPAIGNS: Campaign[] = [
  {
    id: "c1",
    name: "Q2 SaaS Launch",
    status: "active",
    vertical: "tech",
    budgetTotal: 10000,
    budgetRemaining: 3800,
    maxCpm: 25,
    startDate: "2026-03-01",
    endDate: "2026-04-30",
    placementCount: 8,
    impressions: 620000,
    clicks: 14880,
  },
  {
    id: "c2",
    name: "Spring Fitness Promo",
    status: "active",
    vertical: "fitness",
    budgetTotal: 8000,
    budgetRemaining: 1200,
    maxCpm: 20,
    startDate: "2026-03-10",
    endDate: "2026-04-15",
    placementCount: 12,
    impressions: 950000,
    clicks: 19950,
  },
  {
    id: "c3",
    name: "Developer Tools Campaign",
    status: "active",
    vertical: "tech",
    budgetTotal: 5000,
    budgetRemaining: 4100,
    maxCpm: 30,
    startDate: "2026-03-15",
    endDate: "2026-05-01",
    placementCount: 3,
    impressions: 124000,
    clicks: 2976,
  },
  {
    id: "c4",
    name: "New Year Tech Review",
    status: "completed",
    vertical: "tech",
    budgetTotal: 6000,
    budgetRemaining: 0,
    maxCpm: 22,
    startDate: "2026-01-02",
    endDate: "2026-02-15",
    placementCount: 10,
    impressions: 780000,
    clicks: 17160,
  },
  {
    id: "c5",
    name: "Winter Workout Series",
    status: "completed",
    vertical: "fitness",
    budgetTotal: 4500,
    budgetRemaining: 0,
    maxCpm: 18,
    startDate: "2026-01-10",
    endDate: "2026-02-28",
    placementCount: 7,
    impressions: 510000,
    clicks: 10710,
  },
  {
    id: "c6",
    name: "App Launch Teaser",
    status: "draft",
    vertical: "tech",
    budgetTotal: 3000,
    budgetRemaining: 3000,
    maxCpm: 28,
    startDate: "2026-04-01",
    endDate: "2026-04-30",
    placementCount: 0,
    impressions: 0,
    clicks: 0,
  },
  {
    id: "c7",
    name: "Summer Body Campaign",
    status: "pending_review",
    vertical: "fitness",
    budgetTotal: 7000,
    budgetRemaining: 7000,
    maxCpm: 19,
    startDate: "2026-04-15",
    endDate: "2026-06-15",
    placementCount: 0,
    impressions: 0,
    clicks: 0,
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_VARIANT: Record<
  CampaignStatus,
  "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
> = {
  active: "success",
  draft: "secondary",
  pending_review: "warning",
  paused: "outline",
  completed: "secondary",
};

function statusLabel(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function ctr(impressions: number, clicks: number) {
  if (!impressions) return "—";
  return ((clicks / impressions) * 100).toFixed(1) + "%";
}

// ── Campaign Row ───────────────────────────────────────────────────────────────

function CampaignRow({ c }: { c: Campaign }) {
  const spent = c.budgetTotal - c.budgetRemaining;
  const pct = c.budgetTotal > 0 ? Math.round((spent / c.budgetTotal) * 100) : 0;

  return (
    <TableRow>
      <TableCell>
        <Link
          href={`/brand/campaigns/${c.id}`}
          className="font-medium text-slate-800 hover:text-blue-600 transition-colors"
        >
          {c.name}
        </Link>
        <p className="text-xs text-slate-400 mt-0.5 capitalize">{c.vertical}</p>
      </TableCell>
      <TableCell>
        <Badge variant={STATUS_VARIANT[c.status] ?? "secondary"}>
          {statusLabel(c.status)}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="space-y-1 min-w-[120px]">
          <div className="flex justify-between text-xs text-slate-500">
            <span>{formatCurrency(spent)}</span>
            <span>{formatCurrency(c.budgetTotal)}</span>
          </div>
          <Progress value={pct} className="h-1.5" />
        </div>
      </TableCell>
      <TableCell className="text-slate-700">${c.maxCpm}</TableCell>
      <TableCell className="text-slate-600 text-sm">
        {formatDate(c.startDate)}
      </TableCell>
      <TableCell className="text-slate-600 text-sm">
        {formatDate(c.endDate)}
      </TableCell>
      <TableCell className="text-slate-600 text-sm text-center">
        {c.placementCount ?? 0}
      </TableCell>
      <TableCell>
        <Button asChild size="sm" variant="ghost" className="h-8 px-2">
          <Link href={`/brand/campaigns/${c.id}`}>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  );
}

// ── Campaign Card (mobile-friendly) ───────────────────────────────────────────

function CampaignCard({ c }: { c: Campaign }) {
  const spent = c.budgetTotal - c.budgetRemaining;
  const pct = c.budgetTotal > 0 ? Math.round((spent / c.budgetTotal) * 100) : 0;
  const ctrVal = ctr(c.impressions ?? 0, c.clicks ?? 0);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-5 pb-4 px-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <Link
              href={`/brand/campaigns/${c.id}`}
              className="font-semibold text-slate-800 hover:text-blue-600 truncate block"
            >
              {c.name}
            </Link>
            <span className="text-xs text-slate-400 capitalize">{c.vertical}</span>
          </div>
          <Badge variant={STATUS_VARIANT[c.status] ?? "secondary"} className="shrink-0">
            {statusLabel(c.status)}
          </Badge>
        </div>

        <div className="space-y-1 mb-3">
          <div className="flex justify-between text-xs text-slate-500">
            <span>{formatCurrency(spent)} spent</span>
            <span>{formatCurrency(c.budgetTotal)} total</span>
          </div>
          <Progress value={pct} className="h-1.5" />
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-slate-400">CPM</p>
            <p className="text-sm font-medium text-slate-700">${c.maxCpm}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Placements</p>
            <p className="text-sm font-medium text-slate-700">{c.placementCount ?? 0}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">CTR</p>
            <p className="text-sm font-medium text-slate-700">{ctrVal}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const TAB_FILTERS: Record<string, CampaignStatus[] | null> = {
  all: null,
  draft: ["draft"],
  active: ["active", "pending_review", "paused"],
  completed: ["completed"],
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(PLACEHOLDER_CAMPAIGNS);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    async function load() {
      try {
        const userRes = await fetch("/api/auth/me");
        if (!userRes.ok) return;
        const { user } = await userRes.json();
        const brandId = user?.brand?.id;
        if (!brandId) return;

        const res = await fetch(`/api/campaigns?brandId=${brandId}`);
        if (res.ok) {
          const { campaigns: c } = await res.json();
          if (c?.length) setCampaigns(c);
        }
      } catch {
        // fall through to placeholder
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = TAB_FILTERS[activeTab]
    ? campaigns.filter((c) => (TAB_FILTERS[activeTab] as CampaignStatus[]).includes(c.status))
    : campaigns;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Campaigns</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage and monitor all your ad campaigns
          </p>
        </div>
        <Button asChild>
          <Link href="/brand/campaigns/new">
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Link>
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total",
            value: campaigns.length,
            color: "text-slate-700",
          },
          {
            label: "Active",
            value: campaigns.filter((c) => c.status === "active").length,
            color: "text-green-700",
          },
          {
            label: "Draft",
            value: campaigns.filter((c) => c.status === "draft").length,
            color: "text-slate-500",
          },
          {
            label: "Completed",
            value: campaigns.filter((c) => c.status === "completed").length,
            color: "text-blue-700",
          },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-slate-400">{s.label}</p>
              <p className={cn("text-2xl font-bold mt-0.5", s.color)}>
                {s.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs + table */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        {/* Desktop table */}
        <TabsContent value={activeTab} className="mt-0">
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Megaphone className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No campaigns found</p>
                <p className="text-slate-400 text-sm mt-1">
                  Create your first campaign to get started.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/brand/campaigns/new">
                    <Plus className="h-4 w-4 mr-2" />
                    New Campaign
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Desktop table view */}
              <Card className="hidden md:block overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Budget Used / Total</TableHead>
                      <TableHead>Max CPM</TableHead>
                      <TableHead>Start</TableHead>
                      <TableHead>End</TableHead>
                      <TableHead className="text-center">Placements</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((c) => (
                      <CampaignRow key={c.id} c={c} />
                    ))}
                  </TableBody>
                </Table>
              </Card>

              {/* Mobile card view */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
                {filtered.map((c) => (
                  <CampaignCard key={c.id} c={c} />
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
