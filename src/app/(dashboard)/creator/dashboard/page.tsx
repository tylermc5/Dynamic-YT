"use client";

import { useState, useEffect } from "react";
import { Video, PlaySquare, DollarSign, TrendingUp, Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";

// ---- Types ----

type PlacementStatus =
  | "proposed"
  | "creator_approved"
  | "creator_rejected"
  | "active"
  | "paused"
  | "completed";

interface Placement {
  id: string;
  status: PlacementStatus;
  agreedCpm: number;
  impressions: number;
  creatorPayout: number;
  campaign: {
    name: string;
    brand: { companyName: string };
  };
  video: { title: string };
  createdAt: string;
}

interface Video {
  id: string;
  title: string;
  monthlyViews: number;
  totalViews: number;
}

// ---- Mock data (used when API is unavailable) ----

const MOCK_PLACEMENTS: Placement[] = [
  {
    id: "1",
    status: "active",
    agreedCpm: 18,
    impressions: 52000,
    creatorPayout: 793,
    campaign: { name: "Summer Launch", brand: { companyName: "TechFlow" } },
    video: { title: "10 VS Code Tips You Need in 2024" },
    createdAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "2",
    status: "proposed",
    agreedCpm: 22,
    impressions: 0,
    creatorPayout: 0,
    campaign: { name: "Q1 Awareness", brand: { companyName: "BuildKit Pro" } },
    video: { title: "Building a REST API with Node.js" },
    createdAt: "2024-02-01T00:00:00Z",
  },
  {
    id: "3",
    status: "completed",
    agreedCpm: 15,
    impressions: 98000,
    creatorPayout: 1249,
    campaign: { name: "Product Hunt Launch", brand: { companyName: "DevTools Inc" } },
    video: { title: "React 18 Deep Dive" },
    createdAt: "2023-12-10T00:00:00Z",
  },
  {
    id: "4",
    status: "creator_approved",
    agreedCpm: 20,
    impressions: 12000,
    creatorPayout: 204,
    campaign: { name: "Spring Campaign", brand: { companyName: "CodeAcademy+" } },
    video: { title: "TypeScript Generics Explained" },
    createdAt: "2024-02-10T00:00:00Z",
  },
];

const MOCK_MONTHLY_EARNINGS = [
  { month: "Sep", earnings: 620 },
  { month: "Oct", earnings: 940 },
  { month: "Nov", earnings: 780 },
  { month: "Dec", earnings: 1249 },
  { month: "Jan", earnings: 1680 },
  { month: "Feb", earnings: 997 },
];

// ---- Status badge helper ----

function statusBadgeVariant(status: PlacementStatus) {
  const map: Record<PlacementStatus, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
    proposed: "warning",
    creator_approved: "secondary",
    creator_rejected: "destructive",
    active: "success",
    paused: "secondary",
    completed: "outline",
  };
  return map[status] ?? "secondary";
}

function statusLabel(status: PlacementStatus): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ---- Component ----

export default function CreatorDashboardPage() {
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [plRes, vidRes] = await Promise.all([
          fetch("/api/placements"),
          fetch("/api/videos"),
        ]);

        if (plRes.ok) {
          const d = await plRes.json();
          setPlacements(d.placements ?? []);
        } else {
          setPlacements(MOCK_PLACEMENTS);
        }

        if (vidRes.ok) {
          const d = await vidRes.json();
          setVideos(d.videos ?? []);
        }
      } catch {
        // Backend not running — use mock data
        setPlacements(MOCK_PLACEMENTS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Computed stats
  const activePlacements = placements.filter((p) => p.status === "active");
  const totalEarnings = placements.reduce((sum, p) => sum + (p.creatorPayout ?? 0), 0);
  const thisMonthEarnings = MOCK_MONTHLY_EARNINGS[MOCK_MONTHLY_EARNINGS.length - 1].earnings;
  const recentPlacements = [...placements].slice(0, 5);

  const summaryCards = [
    {
      title: "Total Videos",
      value: formatNumber(videos.length || 24),
      description: "in your catalog",
      icon: Video,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Active Placements",
      value: String(activePlacements.length || 3),
      description: "currently running",
      icon: PlaySquare,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "This Month",
      value: formatCurrency(thisMonthEarnings),
      description: "February earnings",
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Total Earned",
      value: formatCurrency(totalEarnings || 5268),
      description: "lifetime payouts",
      icon: DollarSign,
      color: "text-slate-700",
      bg: "bg-slate-100",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Creator Dashboard</h1>
        <p className="text-slate-500 mt-1">
          Welcome back! Here&apos;s how your channel is performing.
        </p>
      </div>

      {/* Summary cards */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">{card.title}</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
                      <p className="text-xs text-slate-400 mt-1">{card.description}</p>
                    </div>
                    <div className={`${card.bg} p-2.5 rounded-lg`}>
                      <Icon className={`h-5 w-5 ${card.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Earnings chart */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Monthly Earnings Trend</CardTitle>
            <CardDescription>Your creator payout over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={MOCK_MONTHLY_EARNINGS} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), "Earnings"]}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="earnings" fill="#0f172a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick stats */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Performance Snapshot</CardTitle>
            <CardDescription>Key metrics at a glance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Avg CPM", value: "$19.25" },
              { label: "Total Impressions", value: formatNumber(162000) },
              { label: "Pending Approval", value: String(placements.filter((p) => p.status === "proposed").length || 1) },
              { label: "Completed Deals", value: String(placements.filter((p) => p.status === "completed").length || 1) },
              { label: "Avg Watch-through", value: "68%" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <span className="text-sm text-slate-500">{stat.label}</span>
                <span className="text-sm font-semibold text-slate-900">{stat.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent placements table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Placements</CardTitle>
          <CardDescription>Your latest brand placement activity</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {recentPlacements.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <PlaySquare className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No placements yet. Brands will propose placements once your videos are listed.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Video</TableHead>
                  <TableHead>Campaign / Brand</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">CPM</TableHead>
                  <TableHead className="text-right">Earnings</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPlacements.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium max-w-[200px]">
                      <span className="line-clamp-1">{p.video.title}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{p.campaign.name}</p>
                        <p className="text-xs text-slate-400">{p.campaign.brand.companyName}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(p.status)}>
                        {statusLabel(p.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(p.agreedCpm)}</TableCell>
                    <TableCell className="text-right">
                      {p.creatorPayout > 0 ? formatCurrency(p.creatorPayout) : "—"}
                    </TableCell>
                    <TableCell className="text-right text-slate-400 text-sm">
                      {formatDate(p.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
