"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  Clock,
  Loader2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Receipt,
  ArrowDownRight,
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
import { formatCurrency, formatDate, PLATFORM_FEE_RATE } from "@/lib/utils";

// ── Mock data ──────────────────────────────────────────────────────────────────

const MOCK_MONTHLY_SPEND = [
  { month: "Oct", spend: 2400, creatorPayout: 2040, platformFee: 360 },
  { month: "Nov", spend: 3100, creatorPayout: 2635, platformFee: 465 },
  { month: "Dec", spend: 4200, creatorPayout: 3570, platformFee: 630 },
  { month: "Jan", spend: 3800, creatorPayout: 3230, platformFee: 570 },
  { month: "Feb", spend: 5100, creatorPayout: 4335, platformFee: 765 },
  { month: "Mar", spend: 3650, creatorPayout: 3103, platformFee: 548 },
];

interface Invoice {
  id: string;
  date: string;
  description: string;
  campaign: string;
  amount: number;
  status: "paid" | "pending" | "failed";
}

const MOCK_INVOICES: Invoice[] = [
  {
    id: "INV-2026-0042",
    date: "2026-03-20",
    description: "Campaign spend — Q2 SaaS Launch",
    campaign: "Q2 SaaS Launch",
    amount: 1850,
    status: "paid",
  },
  {
    id: "INV-2026-0041",
    date: "2026-03-15",
    description: "Campaign spend — Spring Fitness Promo",
    campaign: "Spring Fitness Promo",
    amount: 2200,
    status: "paid",
  },
  {
    id: "INV-2026-0040",
    date: "2026-03-10",
    description: "Campaign spend — Developer Tools Campaign",
    campaign: "Developer Tools Campaign",
    amount: 900,
    status: "pending",
  },
  {
    id: "INV-2026-0039",
    date: "2026-03-01",
    description: "Campaign spend — Q2 SaaS Launch",
    campaign: "Q2 SaaS Launch",
    amount: 1600,
    status: "paid",
  },
  {
    id: "INV-2026-0038",
    date: "2026-02-25",
    description: "Campaign spend — Spring Fitness Promo",
    campaign: "Spring Fitness Promo",
    amount: 3400,
    status: "paid",
  },
  {
    id: "INV-2026-0037",
    date: "2026-02-15",
    description: "Campaign spend — New Year Tech Review",
    campaign: "New Year Tech Review",
    amount: 1700,
    status: "paid",
  },
];

const MOCK_STRIPE_CONNECTED = true;

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_VARIANT: Record<string, "success" | "warning" | "destructive"> = {
  paid: "success",
  pending: "warning",
  failed: "destructive",
};

function statusLabel(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function BrandBillingPage() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stripeConnected] = useState(MOCK_STRIPE_CONNECTED);
  const [connectingStripe, setConnectingStripe] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInvoices(MOCK_INVOICES);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  async function handleManageBilling() {
    setConnectingStripe(true);
    await new Promise((r) => setTimeout(r, 1200));
    setConnectingStripe(false);
    alert("Stripe billing portal coming soon! This will redirect you to manage your payment methods.");
  }

  // Computed stats
  const totalSpent = MOCK_MONTHLY_SPEND.reduce((s, m) => s + m.spend, 0);
  const thisMonth = MOCK_MONTHLY_SPEND[MOCK_MONTHLY_SPEND.length - 1];
  const lastMonth = MOCK_MONTHLY_SPEND[MOCK_MONTHLY_SPEND.length - 2];
  const pendingAmount = invoices
    .filter((i) => i.status === "pending")
    .reduce((s, i) => s + i.amount, 0);

  const summaryCards = [
    {
      title: "This Month",
      value: formatCurrency(thisMonth.spend),
      sub: "March 2026",
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Last Month",
      value: formatCurrency(lastMonth.spend),
      sub: "February 2026",
      icon: DollarSign,
      color: "text-slate-600",
      bg: "bg-slate-100",
    },
    {
      title: "Total Spent",
      value: formatCurrency(totalSpent),
      sub: "All time",
      icon: ArrowDownRight,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Pending Charges",
      value: formatCurrency(pendingAmount),
      sub: "Awaiting processing",
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Billing</h1>
        <p className="text-slate-500 mt-1">
          Track your ad spend, manage payment methods, and view invoices.
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
        {/* Monthly spend chart */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Monthly Ad Spend</CardTitle>
            <CardDescription>
              Your total campaign spend over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart
                data={MOCK_MONTHLY_SPEND}
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
                  formatter={(value: number, name: string) => [
                    formatCurrency(Number(value ?? 0)),
                    name === "spend" ? "Total Spend" : name === "creatorPayout" ? "Creator Payouts" : "Platform Fee",
                  ]}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="creatorPayout" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="creatorPayout" />
                <Bar dataKey="spend" fill="#6366f1" radius={[4, 4, 0, 0]} name="spend" />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-6 mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-indigo-500" />
                <span className="text-xs text-slate-500">Total Spend</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-slate-200" />
                <span className="text-xs text-slate-500">Creator Payouts</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right column: Stripe + spend breakdown */}
        <div className="lg:col-span-2 space-y-4">
          {/* Stripe card */}
          <Card className={stripeConnected ? "border-green-200 bg-green-50/30" : "border-amber-200 bg-amber-50/30"}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className={`h-5 w-5 ${stripeConnected ? "text-green-600" : "text-amber-600"}`} />
                <CardTitle className="text-base">Payment Method</CardTitle>
              </div>
              <CardDescription>
                {stripeConnected
                  ? "Your Stripe payment method is active."
                  : "Add a payment method to fund your campaigns."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stripeConnected ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4" />
                    Visa ending in 4242
                  </div>
                  <Button
                    onClick={handleManageBilling}
                    disabled={connectingStripe}
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                  >
                    {connectingStripe ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ExternalLink className="h-4 w-4" />
                    )}
                    {connectingStripe ? "Loading..." : "Manage Billing"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-amber-700 text-sm">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>Campaigns cannot run without a payment method.</span>
                  </div>
                  <Button
                    onClick={handleManageBilling}
                    disabled={connectingStripe}
                    className="w-full gap-2 bg-slate-900 hover:bg-slate-700"
                    size="sm"
                  >
                    {connectingStripe ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CreditCard className="h-4 w-4" />
                    )}
                    {connectingStripe ? "Loading..." : "Add Payment Method"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Spend breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Spend Breakdown</CardTitle>
              <CardDescription>How your budget is allocated</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    label: "Total Ad Spend",
                    value: formatCurrency(totalSpent),
                    className: "text-slate-900 font-bold",
                  },
                  {
                    label: "Creator Payouts (85%)",
                    value: formatCurrency(totalSpent * (1 - PLATFORM_FEE_RATE)),
                    className: "text-slate-700",
                  },
                  {
                    label: `Platform Fee (${(PLATFORM_FEE_RATE * 100).toFixed(0)}%)`,
                    value: formatCurrency(totalSpent * PLATFORM_FEE_RATE),
                    className: "text-slate-500",
                  },
                ].map((item, i) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">{item.label}</span>
                      <span className={`text-sm ${item.className}`}>{item.value}</span>
                    </div>
                    {i === 0 && <Separator className="mt-3" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Invoices table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-slate-400" />
            <div>
              <CardTitle className="text-base">Invoices</CardTitle>
              <CardDescription>Your recent billing history</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Receipt className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No invoices yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium text-sm text-slate-800">
                      {inv.id}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {formatDate(inv.date)}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {inv.campaign}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[inv.status] ?? "secondary"}>
                        {statusLabel(inv.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium text-slate-900">
                      {formatCurrency(inv.amount)}
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
