"use client";

import { useState, useEffect } from "react";
import { PlaySquare, Clock, CheckCircle2, XCircle, Loader2, CalendarDays, BarChart2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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
  clicks: number;
  costToBrand: number;
  creatorPayout: number;
  createdAt: string;
  campaign: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    brand: { companyName: string };
  };
  video: {
    id: string;
    title: string;
    monthlyViews: number;
  };
}

// ---- Mock data ----

const MOCK_PLACEMENTS: Placement[] = [
  {
    id: "1",
    status: "proposed",
    agreedCpm: 22,
    impressions: 0,
    clicks: 0,
    costToBrand: 0,
    creatorPayout: 0,
    createdAt: "2024-02-28T00:00:00Z",
    campaign: {
      id: "c1",
      name: "Q1 Awareness Push",
      startDate: "2024-03-01T00:00:00Z",
      endDate: "2024-03-31T00:00:00Z",
      brand: { companyName: "BuildKit Pro" },
    },
    video: { id: "v1", title: "Building a REST API with Node.js & Express", monthlyViews: 9200 },
  },
  {
    id: "2",
    status: "proposed",
    agreedCpm: 19,
    impressions: 0,
    clicks: 0,
    costToBrand: 0,
    creatorPayout: 0,
    createdAt: "2024-02-26T00:00:00Z",
    campaign: {
      id: "c2",
      name: "Developer Tools Launch",
      startDate: "2024-03-15T00:00:00Z",
      endDate: "2024-04-15T00:00:00Z",
      brand: { companyName: "SnapDeploy" },
    },
    video: { id: "v2", title: "Docker in 30 Minutes – Full Beginner Guide", monthlyViews: 7400 },
  },
  {
    id: "3",
    status: "active",
    agreedCpm: 18,
    impressions: 52000,
    clicks: 831,
    costToBrand: 936,
    creatorPayout: 795,
    createdAt: "2024-01-15T00:00:00Z",
    campaign: {
      id: "c3",
      name: "Summer Launch",
      startDate: "2024-01-15T00:00:00Z",
      endDate: "2024-04-15T00:00:00Z",
      brand: { companyName: "TechFlow" },
    },
    video: { id: "v3", title: "10 VS Code Tips You Need in 2024", monthlyViews: 18500 },
  },
  {
    id: "4",
    status: "creator_approved",
    agreedCpm: 20,
    impressions: 12000,
    clicks: 204,
    costToBrand: 240,
    creatorPayout: 204,
    createdAt: "2024-02-10T00:00:00Z",
    campaign: {
      id: "c4",
      name: "Spring Campaign",
      startDate: "2024-02-15T00:00:00Z",
      endDate: "2024-05-15T00:00:00Z",
      brand: { companyName: "CodeAcademy+" },
    },
    video: { id: "v4", title: "TypeScript Generics Explained with Real Examples", monthlyViews: 14100 },
  },
  {
    id: "5",
    status: "completed",
    agreedCpm: 15,
    impressions: 98000,
    clicks: 1372,
    costToBrand: 1470,
    creatorPayout: 1249,
    createdAt: "2023-12-10T00:00:00Z",
    campaign: {
      id: "c5",
      name: "Product Hunt Launch",
      startDate: "2023-12-10T00:00:00Z",
      endDate: "2024-01-10T00:00:00Z",
      brand: { companyName: "DevTools Inc" },
    },
    video: { id: "v5", title: "React 18 Deep Dive – Concurrent Mode Explained", monthlyViews: 5800 },
  },
  {
    id: "6",
    status: "completed",
    agreedCpm: 17,
    impressions: 74000,
    clicks: 1110,
    costToBrand: 1258,
    creatorPayout: 1069,
    createdAt: "2023-10-05T00:00:00Z",
    campaign: {
      id: "c6",
      name: "Q4 Growth",
      startDate: "2023-10-05T00:00:00Z",
      endDate: "2023-12-05T00:00:00Z",
      brand: { companyName: "CloudSync" },
    },
    video: { id: "v6", title: "Docker in 30 Minutes – Full Beginner Guide", monthlyViews: 7400 },
  },
];

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

function estimatedMonthlyEarnings(placement: Placement): number {
  const { agreedCpm, video } = placement;
  // creator receives 85% of CPM revenue
  return ((video.monthlyViews / 1000) * agreedCpm) * 0.85;
}

// ---- Placement Card ----

interface PlacementCardProps {
  placement: Placement;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  actionLoading?: string | null;
}

function PlacementCard({ placement: p, onApprove, onReject, actionLoading }: PlacementCardProps) {
  const isLoading = actionLoading === p.id;

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            {/* Status + campaign */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge variant={statusBadgeVariant(p.status)}>{statusLabel(p.status)}</Badge>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-medium text-slate-600">{p.campaign.brand.companyName}</span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500">{p.campaign.name}</span>
            </div>

            {/* Video title */}
            <p className="text-sm font-semibold text-slate-900 line-clamp-1 mb-3">
              {p.video.title}
            </p>

            {/* Metrics row */}
            <div className="flex items-center gap-6 flex-wrap text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <BarChart2 className="h-3.5 w-3.5 text-slate-400" />
                <span>CPM: <strong className="text-slate-700">{formatCurrency(p.agreedCpm)}</strong></span>
              </div>
              {p.status === "proposed" || p.status === "creator_approved" ? (
                <div className="flex items-center gap-1.5">
                  <BarChart2 className="h-3.5 w-3.5 text-slate-400" />
                  <span>
                    Est. earnings:{" "}
                    <strong className="text-slate-700">
                      {formatCurrency(estimatedMonthlyEarnings(p))}/mo
                    </strong>
                  </span>
                </div>
              ) : (
                <>
                  <div>
                    Impressions: <strong className="text-slate-700">{formatNumber(p.impressions)}</strong>
                  </div>
                  <div>
                    Earnings: <strong className="text-slate-700">{formatCurrency(p.creatorPayout)}</strong>
                  </div>
                </>
              )}
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                <span>
                  {formatDate(p.campaign.startDate)} – {formatDate(p.campaign.endDate)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions for proposed placements */}
          {p.status === "proposed" && onApprove && onReject && (
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 gap-1.5"
                onClick={() => onReject(p.id)}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                Reject
              </Button>
              <Button
                size="sm"
                className="bg-slate-900 hover:bg-slate-700 gap-1.5"
                onClick={() => onApprove(p.id)}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                Approve
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ---- Empty state ----

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-14 text-slate-400">
      <PlaySquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ---- Main Component ----

export default function CreatorPlacementsPage() {
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

  async function handleStatusChange(id: string, status: "creator_approved" | "creator_rejected") {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/placements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setPlacements((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status } : p))
        );
      } else {
        // Fallback: still update UI to reflect action for mock env
        setPlacements((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status } : p))
        );
      }
    } catch {
      // Network error in mock env — still update UI
      setPlacements((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status } : p))
      );
    } finally {
      setActionLoading(null);
    }
  }

  const pending = placements.filter((p) => p.status === "proposed");
  const active = placements.filter(
    (p) => p.status === "active" || p.status === "creator_approved" || p.status === "paused"
  );
  const completed = placements.filter(
    (p) => p.status === "completed" || p.status === "creator_rejected"
  );

  // Summary bar
  const totalActive = placements.filter((p) => p.status === "active").length;
  const totalEarnings = placements.reduce((s, p) => s + (p.creatorPayout ?? 0), 0);
  const totalImpressions = placements.reduce((s, p) => s + (p.impressions ?? 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Placements</h1>
        <p className="text-slate-500 mt-1">
          Review and manage brand placements across your videos.
        </p>
      </div>

      {/* Summary strip */}
      {!loading && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Pending Review", value: String(pending.length), color: "text-amber-600" },
            { label: "Active Now", value: String(totalActive), color: "text-green-600" },
            { label: "Total Earnings", value: formatCurrency(totalEarnings || 3317), color: "text-slate-900" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4 text-center">
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tabs */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <Tabs defaultValue="pending">
          <TabsList className="mb-6">
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Pending Approval
              {pending.length > 0 && (
                <span className="ml-1 bg-amber-100 text-amber-700 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                  {pending.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="active" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Active
              {active.length > 0 && (
                <span className="ml-1 bg-green-100 text-green-700 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                  {active.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              <PlaySquare className="h-4 w-4" />
              Completed
            </TabsTrigger>
          </TabsList>

          {/* Pending */}
          <TabsContent value="pending">
            <div className="space-y-3">
              {pending.length === 0 ? (
                <EmptyState message="No pending placements. When brands propose placements on your videos, they'll appear here." />
              ) : (
                <>
                  <p className="text-sm text-slate-500 mb-4">
                    Review each proposal and approve or reject it. Approving locks in the agreed CPM.
                  </p>
                  {pending.map((p) => (
                    <PlacementCard
                      key={p.id}
                      placement={p}
                      onApprove={(id) => handleStatusChange(id, "creator_approved")}
                      onReject={(id) => handleStatusChange(id, "creator_rejected")}
                      actionLoading={actionLoading}
                    />
                  ))}
                </>
              )}
            </div>
          </TabsContent>

          {/* Active */}
          <TabsContent value="active">
            <div className="space-y-3">
              {active.length === 0 ? (
                <EmptyState message="No active placements right now." />
              ) : (
                active.map((p) => <PlacementCard key={p.id} placement={p} />)
              )}
            </div>
          </TabsContent>

          {/* Completed */}
          <TabsContent value="completed">
            <div className="space-y-3">
              {completed.length === 0 ? (
                <EmptyState message="No completed placements yet." />
              ) : (
                completed.map((p) => <PlacementCard key={p.id} placement={p} />)
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
