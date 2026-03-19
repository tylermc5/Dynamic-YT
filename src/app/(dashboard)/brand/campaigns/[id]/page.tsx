"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Eye,
  MousePointerClick,
  DollarSign,
  Users,
  Play,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { cn, formatCurrency, formatNumber, formatDate } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

type CampaignStatus =
  | "draft"
  | "pending_review"
  | "active"
  | "paused"
  | "completed";
type PlacementStatus =
  | "proposed"
  | "creator_approved"
  | "creator_rejected"
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
  targetAudienceAgeMin: number;
  targetAudienceAgeMax: number;
  targetAudienceGender: string;
  targetGeos: string[];
  adCreativeUrl?: string;
}

interface Placement {
  id: string;
  videoTitle?: string;
  channelName?: string;
  status: PlacementStatus;
  agreedCpm: number;
  impressions: number;
  clicks: number;
  costToBrand: number;
}

interface VideoMatch {
  videoId: string;
  title: string;
  channelName: string;
  creatorId: string;
  monthlyViews: number;
  avgWatchThroughRate: number;
  score: number;
  cpm: number;
  isEvergreen: boolean;
  tags: string[];
}

// ── Placeholder data ───────────────────────────────────────────────────────────

function makePlaceholderCampaign(id: string): Campaign {
  return {
    id,
    name: "Q2 SaaS Launch",
    status: "active",
    vertical: "tech",
    budgetTotal: 10000,
    budgetRemaining: 3800,
    maxCpm: 25,
    startDate: "2026-03-01",
    endDate: "2026-04-30",
    targetAudienceAgeMin: 22,
    targetAudienceAgeMax: 45,
    targetAudienceGender: "all",
    targetGeos: ["US", "CA", "UK"],
  };
}

const PLACEHOLDER_PLACEMENTS: Placement[] = [
  {
    id: "p1",
    videoTitle: "Top 10 VS Code Extensions 2024",
    channelName: "CodeWithAlex",
    status: "active",
    agreedCpm: 22,
    impressions: 320000,
    clicks: 7680,
    costToBrand: 7040,
  },
  {
    id: "p2",
    videoTitle: "Building a SaaS in 30 Days",
    channelName: "IndieHackerPro",
    status: "creator_approved",
    agreedCpm: 24,
    impressions: 0,
    clicks: 0,
    costToBrand: 0,
  },
  {
    id: "p3",
    videoTitle: "React 19 New Features",
    channelName: "ReactMastery",
    status: "proposed",
    agreedCpm: 20,
    impressions: 0,
    clicks: 0,
    costToBrand: 0,
  },
];

const PLACEHOLDER_MATCHES: VideoMatch[] = [
  {
    videoId: "v1",
    title: "Ultimate Developer Setup 2026",
    channelName: "TechWithDan",
    creatorId: "cr1",
    monthlyViews: 480000,
    avgWatchThroughRate: 0.62,
    score: 94,
    cpm: 23,
    isEvergreen: true,
    tags: ["developer", "setup", "productivity"],
  },
  {
    videoId: "v2",
    title: "I Tried Every AI Code Tool",
    channelName: "CodeReviewChannel",
    creatorId: "cr2",
    monthlyViews: 310000,
    avgWatchThroughRate: 0.55,
    score: 88,
    cpm: 21,
    isEvergreen: false,
    tags: ["ai", "coding", "tools"],
  },
  {
    videoId: "v3",
    title: "Full Stack SaaS from Scratch",
    channelName: "BuildWithMe",
    creatorId: "cr3",
    monthlyViews: 220000,
    avgWatchThroughRate: 0.71,
    score: 82,
    cpm: 18,
    isEvergreen: true,
    tags: ["saas", "nextjs", "startup"],
  },
  {
    videoId: "v4",
    title: "TypeScript in 100 Seconds",
    channelName: "Fireship Clone",
    creatorId: "cr4",
    monthlyViews: 750000,
    avgWatchThroughRate: 0.48,
    score: 76,
    cpm: 25,
    isEvergreen: true,
    tags: ["typescript", "javascript"],
  },
];

const PERF_DATA = [
  { date: "Mar 1", impressions: 28000, spend: 616 },
  { date: "Mar 5", impressions: 54000, spend: 1188 },
  { date: "Mar 8", impressions: 42000, spend: 924 },
  { date: "Mar 11", impressions: 80000, spend: 1760 },
  { date: "Mar 14", impressions: 96000, spend: 2112 },
  { date: "Mar 17", impressions: 72000, spend: 1584 },
  { date: "Mar 19", impressions: 110000, spend: 2420 },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

const CAMPAIGN_STATUS_VARIANT: Record<
  CampaignStatus,
  "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
> = {
  active: "success",
  draft: "secondary",
  pending_review: "warning",
  paused: "outline",
  completed: "secondary",
};

const PLACEMENT_STATUS_VARIANT: Record<
  PlacementStatus,
  "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
> = {
  active: "success",
  proposed: "outline",
  creator_approved: "warning",
  creator_rejected: "destructive",
  paused: "outline",
  completed: "secondary",
};

function statusLabel(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Stat Card ──────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon,
  iconBg,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  iconBg: string;
}) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-400 mb-1">{label}</p>
            <p className="text-xl font-bold text-slate-900">{value}</p>
            {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
          </div>
          <div className={cn("p-2 rounded-lg", iconBg)}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Video Match Card ───────────────────────────────────────────────────────────

function VideoMatchCard({
  match,
  campaignId,
  onPropose,
  proposed,
}: {
  match: VideoMatch;
  campaignId: string;
  onPropose: (match: VideoMatch) => void;
  proposed: boolean;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-5 pb-4 px-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 truncate">{match.title}</p>
            <p className="text-sm text-slate-500">{match.channelName}</p>
          </div>
          <div
            className={cn(
              "shrink-0 flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold",
              match.score >= 90
                ? "bg-green-100 text-green-700"
                : match.score >= 75
                ? "bg-blue-100 text-blue-700"
                : "bg-slate-100 text-slate-600"
            )}
          >
            {match.score}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {match.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs"
            >
              #{tag}
            </span>
          ))}
          {match.isEvergreen && (
            <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-xs font-medium">
              Evergreen
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 text-center mb-4">
          <div>
            <p className="text-xs text-slate-400">Monthly Views</p>
            <p className="text-sm font-semibold text-slate-700">
              {formatNumber(match.monthlyViews)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Watch-through</p>
            <p className="text-sm font-semibold text-slate-700">
              {Math.round(match.avgWatchThroughRate * 100)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">CPM</p>
            <p className="text-sm font-semibold text-slate-700">
              ${match.cpm}
            </p>
          </div>
        </div>

        {proposed ? (
          <Button variant="outline" size="sm" className="w-full" disabled>
            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
            Placement Proposed
          </Button>
        ) : (
          <Button
            size="sm"
            className="w-full"
            onClick={() => onPropose(match)}
          >
            <Play className="h-4 w-4 mr-2" />
            Propose Placement
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [placements, setPlacements] = useState<Placement[]>(PLACEHOLDER_PLACEMENTS);
  const [matches, setMatches] = useState<VideoMatch[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [loading, setLoading] = useState(true);
  const [proposedIds, setProposedIds] = useState<Set<string>>(new Set());
  const [proposingId, setProposingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const loadCampaign = useCallback(async () => {
    try {
      const res = await fetch(`/api/campaigns/${id}`);
      if (res.ok) {
        const { campaign: c } = await res.json();
        if (c) setCampaign(c);
      }
    } catch {
      // fall through to placeholder
    } finally {
      if (!campaign) setCampaign(makePlaceholderCampaign(id));
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    loadCampaign();
  }, [loadCampaign]);

  useEffect(() => {
    if (activeTab !== "matched") return;
    if (matches.length > 0) return;

    async function loadMatches() {
      setLoadingMatches(true);
      try {
        const res = await fetch(`/api/campaigns/${id}/match`);
        if (res.ok) {
          const { matches: m } = await res.json();
          if (m?.length) {
            setMatches(m);
            return;
          }
        }
      } catch {
        // fall through to placeholder
      } finally {
        setMatches(PLACEHOLDER_MATCHES);
        setLoadingMatches(false);
      }
    }
    loadMatches();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, id]);

  async function handlePropose(match: VideoMatch) {
    setProposingId(match.videoId);
    try {
      const res = await fetch("/api/placements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: id,
          selections: [
            {
              videoId: match.videoId,
              creatorId: match.creatorId,
              agreedCpm: match.cpm,
            },
          ],
        }),
      });

      if (res.ok) {
        setProposedIds((prev) => { const s = new Set(Array.from(prev)); s.add(match.videoId); return s; });
      } else {
        // Optimistic UI for demo
        setProposedIds((prev) => { const s = new Set(Array.from(prev)); s.add(match.videoId); return s; });
      }
    } catch {
      setProposedIds((prev) => { const s = new Set(Array.from(prev)); s.add(match.videoId); return s; });
    } finally {
      setProposingId(null);
    }
  }

  if (loading && !campaign) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  const c = campaign ?? makePlaceholderCampaign(id);
  const spent = c.budgetTotal - c.budgetRemaining;
  const budgetPct = Math.round((spent / c.budgetTotal) * 100);
  const totalImpressions = placements.reduce((s, p) => s + p.impressions, 0);
  const totalClicks = placements.reduce((s, p) => s + p.clicks, 0);
  const totalCost = placements.reduce((s, p) => s + p.costToBrand, 0);
  const ctr =
    totalImpressions > 0
      ? ((totalClicks / totalImpressions) * 100).toFixed(1) + "%"
      : "—";

  return (
    <div className="space-y-6">
      {/* Back link */}
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-3">
          <Link href="/brand/campaigns">
            <ArrowLeft className="h-4 w-4 mr-1" />
            All Campaigns
          </Link>
        </Button>

        {/* Campaign header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{c.name}</h1>
              <Badge variant={CAMPAIGN_STATUS_VARIANT[c.status] ?? "secondary"}>
                {statusLabel(c.status)}
              </Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1 capitalize">
              {c.vertical} · {formatDate(c.startDate)} – {formatDate(c.endDate)}
            </p>
          </div>
        </div>

        {/* Budget progress */}
        <Card className="mt-4">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-600 font-medium">Budget utilization</span>
              <span className="text-slate-900 font-semibold">
                {formatCurrency(spent)} / {formatCurrency(c.budgetTotal)}{" "}
                <span className="text-slate-400 font-normal">({budgetPct}%)</span>
              </span>
            </div>
            <Progress value={budgetPct} className="h-2.5" />
            <p className="text-xs text-slate-400 mt-1.5">
              {formatCurrency(c.budgetRemaining)} remaining
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="matched">Matched Videos</TabsTrigger>
          <TabsTrigger value="placements">Placements</TabsTrigger>
        </TabsList>

        {/* ── Overview Tab ── */}
        <TabsContent value="overview" className="mt-4 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Impressions"
              value={formatNumber(totalImpressions)}
              sub="across all placements"
              icon={<Eye className="h-4 w-4 text-violet-600" />}
              iconBg="bg-violet-50"
            />
            <StatCard
              label="Total Clicks"
              value={formatNumber(totalClicks)}
              sub={`CTR: ${ctr}`}
              icon={<MousePointerClick className="h-4 w-4 text-blue-600" />}
              iconBg="bg-blue-50"
            />
            <StatCard
              label="Total Cost"
              value={formatCurrency(totalCost)}
              sub={`of ${formatCurrency(c.budgetTotal)} budget`}
              icon={<DollarSign className="h-4 w-4 text-emerald-600" />}
              iconBg="bg-emerald-50"
            />
            <StatCard
              label="Active Placements"
              value={placements
                .filter((p) => p.status === "active")
                .length.toString()}
              sub={`${placements.length} total`}
              icon={<Users className="h-4 w-4 text-amber-600" />}
              iconBg="bg-amber-50"
            />
          </div>

          {/* Performance chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Performance Over Time</CardTitle>
                  <CardDescription>Daily impressions and spend</CardDescription>
                </div>
                <TrendingUp className="h-5 w-5 text-slate-400" />
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart
                  data={PERF_DATA}
                  margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="impGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#8b5cf6"
                        stopOpacity={0.15}
                      />
                      <stop
                        offset="95%"
                        stopColor="#8b5cf6"
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient
                      id="spendGrad2"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#10b981"
                        stopOpacity={0.15}
                      />
                      <stop
                        offset="95%"
                        stopColor="#10b981"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    stroke="#94a3b8"
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 11 }}
                    stroke="#94a3b8"
                    tickFormatter={(v) => formatNumber(v)}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11 }}
                    stroke="#94a3b8"
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "6px",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px",
                    }}
                    formatter={(v: unknown, name: unknown) =>
                      name === "spend"
                        ? [formatCurrency(v as number), "Spend"]
                        : [formatNumber(v as number), "Impressions"]
                    }
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="impressions"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fill="url(#impGrad)"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="spend"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#spendGrad2)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Campaign details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Campaign Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 text-sm">
                {[
                  { label: "Vertical", value: c.vertical },
                  {
                    label: "Gender target",
                    value:
                      c.targetAudienceGender === "all"
                        ? "All genders"
                        : c.targetAudienceGender,
                  },
                  {
                    label: "Age range",
                    value: `${c.targetAudienceAgeMin} – ${c.targetAudienceAgeMax}`,
                  },
                  {
                    label: "Target geos",
                    value:
                      c.targetGeos?.length
                        ? c.targetGeos.join(", ")
                        : "All regions",
                  },
                  { label: "Max CPM", value: `$${c.maxCpm}` },
                  {
                    label: "Start date",
                    value: formatDate(c.startDate),
                  },
                  { label: "End date", value: formatDate(c.endDate) },
                  {
                    label: "Ad creative",
                    value: c.adCreativeUrl ? "Uploaded" : "None",
                  },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between">
                    <span className="text-slate-400">{row.label}</span>
                    <span className="text-slate-800 font-medium capitalize">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Matched Videos Tab ── */}
        <TabsContent value="matched" className="mt-4">
          {loadingMatches ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : matches.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <p className="text-slate-500">
                  No matched videos found for this campaign.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">
                {matches.length} videos matched based on your targeting. Select
                videos to propose placements.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                {matches.map((match) => (
                  <VideoMatchCard
                    key={match.videoId}
                    match={match}
                    campaignId={id}
                    onPropose={handlePropose}
                    proposed={proposedIds.has(match.videoId)}
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── Placements Tab ── */}
        <TabsContent value="placements" className="mt-4">
          {placements.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <p className="text-slate-500">
                  No placements yet. Go to Matched Videos to propose placements.
                </p>
                <Button
                  className="mt-4"
                  variant="outline"
                  onClick={() => setActiveTab("matched")}
                >
                  View Matched Videos
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Video</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">CPM</TableHead>
                    <TableHead className="text-right">Impressions</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {placements.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium max-w-[180px] truncate">
                        {p.videoTitle ?? "—"}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {p.channelName ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            PLACEMENT_STATUS_VARIANT[p.status] ?? "secondary"
                          }
                        >
                          {statusLabel(p.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-slate-700">
                        ${p.agreedCpm}
                      </TableCell>
                      <TableCell className="text-right text-slate-700">
                        {p.impressions ? formatNumber(p.impressions) : "—"}
                      </TableCell>
                      <TableCell className="text-right text-slate-700">
                        {p.clicks ? formatNumber(p.clicks) : "—"}
                      </TableCell>
                      <TableCell className="text-right text-slate-700">
                        {p.costToBrand ? formatCurrency(p.costToBrand) : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
