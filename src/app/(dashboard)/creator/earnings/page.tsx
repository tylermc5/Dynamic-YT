"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CreditCard,
  Loader2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatNumber, formatDate, PLATFORM_FEE_RATE } from "@/lib/utils";

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
  costToBrand: number;
  creatorPayout: number;
  createdAt: string;
  campaign: {
    name: string;
    brand: { companyName: string };
    startDate: string;
    endDate: string;
  };
  video: { title: string };
}

// ---- Mock data ----

const MOCK_PLACEMENTS: Placement[] = [
  {
    id: "1",
    status: "active",
    agreedCpm: 18,
    impressions: 52000,
    costToBrand: 936,
    creatorPayout: 795,
    createdAt: "2024-01-15T00:00:00Z",
    campaign: {
      name: "Summer Launch",
      brand: { companyName: "TechFlow" },
      startDate: "2024-01-15T00:00:00Z",
      endDate: "2024-04-15T00:00:00Z",
    },
    video: { title: "10 VS Code Tips You Need in 2024" },
  },
  {
    id: "2",
    status: "creator_approved",
    agreedCpm: 20,
    impressions: 12000,
    costToBrand: 240,
    creatorPayout: 204,
    createdAt: "2024-02-10T00:00:00Z",
    campaign: {
      name: "Spring Campaign",
      brand: { companyName: "CodeAcademy+" },
      startDate: "2024-02-15T00:00:00Z",
      endDate: "2024-05-15T00:00:00Z",
    },
    video: { title: "TypeScript Generics Explained with Real Examples" },
  },
  {
    id: "3",
    status: "completed",
    agreedCpm: 15,
    impressions: 98000,
    costToBrand: 1470,
    creatorPayout: 1249,
    createdAt: "2023-12-10T00:00:00Z",
    campaign: {
      name: "Product Hunt Launch",
      brand: { companyName: "DevTools Inc" },
      startDate: "2023-12-10T00:00:00Z",
      endDate: "2024-01-10T00:00:00Z",
    },
    video: { title: "React 18 Deep Dive – Concurrent Mode Explained" },
  },
  {
    id: "4",
    status: "completed",
    agreedCpm: 17,
    impressions: 74000,
    costToBrand: 1258,
    creatorPayout: 1069,
    createdAt: "2023-10-05T00:00:00Z",
    campaign: {
      name: "Q4 Growth",
      brand: { companyName: "CloudSync" },
      startDate: "2023-10-05T00:00:00Z",
      endDate: "2023-12-05T00:00:00Z",
    },
    video: { title: "Docker in 30 Minutes – Full Beginner Guide" },
  },
];

const MOCK_MONTHLY_EARNINGS = [
  { month: "Sep", earnings: 620, gross: 729 },
  { month: "Oct", earnings: 940, gross: 1106 },
  { month: "Nov", earnings: 780, gross: 918 },
  { month: "Dec", earnings: 1249, gross: 1470 },
  { month: "Jan", earnings: 1680, gross: 1976 },
  { month: "Feb", earnings: 997, gross: 1173 },
];

// ---- Stripe Connect status (mock) ----
// In production this would come from the API
const MOCK_STRIPE_CONNECTED = false;

// ---- Helpers ----

function statusBadgeVariant(
  status: PlacementStatus
): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" {
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

export default function CreatorEarningsPage() {
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [loading, setLoading] = useState(true);
  const [stripeConnected] = useState(MOCK_STRIPE_CONNECTED);
  const [connectingStripe, setConnectingStripe] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/placements");
        if (res.ok) {
          const data = await res.json();
          setPlacements(data.placements ?? []);
        } else {
          setPlacements(MOCK_PLACEMENTS);
        }
      } catch {
        setPlacements(MOCK_PLACEMENTS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleConnectStripe() {
    setConnectingStripe(true);
    // In production: redirect to Stripe Connect onboarding URL
    // For now, simulate a brief loading state
    await new Promise((r) => setTimeout(r, 1200));
    setConnectingStripe(false);
    alert("Stripe Connect integration coming soon! This will redirect you to Stripe's onboarding flow.");
  }

  // Computed stats
  const earnedPlacements = placements.filter(
    (p) => p.creatorPayout > 0 && (p.status === "active" || p.status === "completed" || p.status === "creator_approved")
  );

  const totalEarned = placements.reduce((s, p) => s + (p.creatorPayout ?? 0), 0) || 3317;
  const totalGross = placements.reduce((s, p) => s + (p.costToBrand ?? 0), 0) || 3904;
  const platformFees = totalGross - totalEarned;

  const thisMonthData = MOCK_MONTHLY_EARNINGS[MOCK_MONTHLY_EARNINGS.length - 1];
  const lastMonthData = MOCK_MONTHLY_EARNINGS[MOCK_MONTHLY_EARNINGS.length - 2];

  // Pending payout = active placements earnings (not yet disbursed)
  const pendingPayout = placements
    .filter((p) => p.status === "active" || p.status === "creator_approved")
    .reduce((s, p) => s + (p.creatorPayout ?? 0), 0) || 999;

  const summaryCards = [
    {
      title: "This Month",
      value: formatCurrency(thisMonthData.earnings),
      sub: "February 2024",
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Last Month",
      value: formatCurrency(lastMonthData.earnings),
      sub: "January 2024",
      icon: DollarSign,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Total Earned",
      value: formatCurrency(totalEarned),
      sub: "All time (net)",
      icon: DollarSign,
      color: "text-slate-700",
      bg: "bg-slate-100",
    },
    {
      title: "Pending Payout",
      value: formatCurrency(pendingPayout),
      sub: "Awaiting disbursement",
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Earnings & Payouts</h1>
        <p className="text-slate-500 mt-1">
          Track your creator revenue and manage your payout settings.
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
                      <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
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
        {/* Monthly earnings chart */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Monthly Earnings Trend</CardTitle>
            <CardDescription>
              Your net creator payout over the last 6 months (after {(PLATFORM_FEE_RATE * 100).toFixed(0)}% platform fee)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart
                data={MOCK_MONTHLY_EARNINGS}
                margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
              >
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
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any, name: any) => [
                    formatCurrency(Number(value ?? 0)),
                    name === "earnings" ? "Net Earnings" : "Gross Revenue",
                  ]}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="gross" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="gross" />
                <Bar dataKey="earnings" fill="#0f172a" radius={[4, 4, 0, 0]} name="earnings" />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-6 mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-slate-900" />
                <span className="text-xs text-slate-500">Net Earnings</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-slate-200" />
                <span className="text-xs text-slate-500">Gross Revenue</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right column: Stripe + fee breakdown */}
        <div className="lg:col-span-2 space-y-4">
          {/* Stripe Connect card */}
          <Card className={stripeConnected ? "border-green-200 bg-green-50/30" : "border-amber-200 bg-amber-50/30"}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className={`h-5 w-5 ${stripeConnected ? "text-green-600" : "text-amber-600"}`} />
                <CardTitle className="text-base">Stripe Connect</CardTitle>
              </div>
              <CardDescription>
                {stripeConnected
                  ? "Your Stripe account is connected and ready to receive payouts."
                  : "Connect your Stripe account to receive creator payouts."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stripeConnected ? (
                <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  Connected — payouts active
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-amber-700 text-sm">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>You won&apos;t receive payouts until Stripe is connected.</span>
                  </div>
                  <Button
                    onClick={handleConnectStripe}
                    disabled={connectingStripe}
                    className="w-full gap-2 bg-slate-900 hover:bg-slate-700"
                    size="sm"
                  >
                    {connectingStripe ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ExternalLink className="h-4 w-4" />
                    )}
                    {connectingStripe ? "Connecting..." : "Connect Stripe"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fee breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Revenue Breakdown</CardTitle>
              <CardDescription>Lifetime totals across all placements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    label: "Gross Brand Spend",
                    value: formatCurrency(totalGross),
                    className: "text-slate-900",
                  },
                  {
                    label: `Platform Fee (${(PLATFORM_FEE_RATE * 100).toFixed(0)}%)`,
                    value: `– ${formatCurrency(platformFees)}`,
                    className: "text-red-500",
                  },
                  {
                    label: "Your Net Earnings",
                    value: formatCurrency(totalEarned),
                    className: "text-green-700 font-bold",
                  },
                  {
                    label: "Paid Out",
                    value: formatCurrency(totalEarned - pendingPayout),
                    className: "text-slate-700",
                  },
                  {
                    label: "Pending",
                    value: formatCurrency(pendingPayout),
                    className: "text-amber-600",
                  },
                ].map((item, i, arr) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">{item.label}</span>
                      <span className={`text-sm ${item.className}`}>{item.value}</span>
                    </div>
                    {i === 1 && <Separator className="mt-3" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Earnings breakdown table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Earnings by Placement</CardTitle>
          <CardDescription>Detailed breakdown of revenue from each placement</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : placements.filter((p) => p.creatorPayout > 0 || p.status === "active").length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <DollarSign className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No earnings yet. Approve a placement to start earning.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Video</TableHead>
                  <TableHead>Campaign / Brand</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Impressions</TableHead>
                  <TableHead className="text-right">CPM</TableHead>
                  <TableHead className="text-right">Gross</TableHead>
                  <TableHead className="text-right">Platform Fee</TableHead>
                  <TableHead className="text-right">Your Payout</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {placements
                  .filter((p) => p.status !== "proposed" && p.status !== "creator_rejected")
                  .map((p) => {
                    const fee = p.costToBrand - p.creatorPayout;
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="max-w-[180px]">
                          <span className="text-sm font-medium line-clamp-1">{p.video.title}</span>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-medium">{p.campaign.name}</p>
                          <p className="text-xs text-slate-400">{p.campaign.brand.companyName}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusBadgeVariant(p.status)}>
                            {statusLabel(p.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm text-slate-600">
                          {p.impressions > 0 ? formatNumber(p.impressions) : "—"}
                        </TableCell>
                        <TableCell className="text-right text-sm text-slate-600">
                          {formatCurrency(p.agreedCpm)}
                        </TableCell>
                        <TableCell className="text-right text-sm text-slate-600">
                          {p.costToBrand > 0 ? formatCurrency(p.costToBrand) : "—"}
                        </TableCell>
                        <TableCell className="text-right text-sm text-red-400">
                          {p.costToBrand > 0 ? `– ${formatCurrency(fee)}` : "—"}
                        </TableCell>
                        <TableCell className="text-right text-sm font-semibold text-slate-900">
                          {p.creatorPayout > 0 ? formatCurrency(p.creatorPayout) : "—"}
                        </TableCell>
                        <TableCell className="text-right text-xs text-slate-400">
                          {formatDate(p.createdAt)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
