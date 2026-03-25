"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Eye,
  TrendingUp,
  Zap,
  Video,
  Filter,
  Loader2,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatNumber } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

interface MarketplaceVideo {
  id: string;
  title: string;
  creator: string;
  subscriberCount: number;
  vertical: string;
  totalViews: number;
  monthlyViews: number;
  avgWatchThroughRate: number;
  isEvergreen: boolean;
  minCpm: number;
}

// ── Mock data ──────────────────────────────────────────────────────────────────

const MOCK_VIDEOS: MarketplaceVideo[] = [
  {
    id: "v1",
    title: "10 VS Code Tips You Need in 2024",
    creator: "CodeWithAlex",
    subscriberCount: 245000,
    vertical: "tech",
    totalViews: 284000,
    monthlyViews: 18500,
    avgWatchThroughRate: 0.72,
    isEvergreen: true,
    minCpm: 15,
  },
  {
    id: "v2",
    title: "Morning Workout Routine – 20 Min Full Body",
    creator: "FitWithJen",
    subscriberCount: 380000,
    vertical: "fitness",
    totalViews: 510000,
    monthlyViews: 32000,
    avgWatchThroughRate: 0.68,
    isEvergreen: true,
    minCpm: 12,
  },
  {
    id: "v3",
    title: "Building a SaaS in 30 Days – Full Series",
    creator: "IndieHackerPro",
    subscriberCount: 92000,
    vertical: "tech",
    totalViews: 156000,
    monthlyViews: 9200,
    avgWatchThroughRate: 0.61,
    isEvergreen: true,
    minCpm: 18,
  },
  {
    id: "v4",
    title: "Full Body HIIT Workout – No Equipment",
    creator: "HealthFirst",
    subscriberCount: 520000,
    vertical: "fitness",
    totalViews: 720000,
    monthlyViews: 45000,
    avgWatchThroughRate: 0.74,
    isEvergreen: true,
    minCpm: 14,
  },
  {
    id: "v5",
    title: "React 19 New Features Explained",
    creator: "ReactMastery",
    subscriberCount: 178000,
    vertical: "tech",
    totalViews: 98000,
    monthlyViews: 22000,
    avgWatchThroughRate: 0.65,
    isEvergreen: false,
    minCpm: 20,
  },
  {
    id: "v6",
    title: "Docker in 30 Minutes – Full Beginner Guide",
    creator: "DevOpsDaily",
    subscriberCount: 310000,
    vertical: "tech",
    totalViews: 531000,
    monthlyViews: 7400,
    avgWatchThroughRate: 0.71,
    isEvergreen: true,
    minCpm: 16,
  },
  {
    id: "v7",
    title: "Meal Prep for Muscle Gain – Weekly Plan",
    creator: "NutritionLab",
    subscriberCount: 145000,
    vertical: "fitness",
    totalViews: 230000,
    monthlyViews: 15000,
    avgWatchThroughRate: 0.63,
    isEvergreen: true,
    minCpm: 11,
  },
  {
    id: "v8",
    title: "TypeScript Best Practices 2024",
    creator: "CodeWithAlex",
    subscriberCount: 245000,
    vertical: "tech",
    totalViews: 190000,
    monthlyViews: 14100,
    avgWatchThroughRate: 0.75,
    isEvergreen: true,
    minCpm: 15,
  },
];

// ── Component ──────────────────────────────────────────────────────────────────

export default function MarketplacePage() {
  const [videos, setVideos] = useState<MarketplaceVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [verticalFilter, setVerticalFilter] = useState<"all" | "tech" | "fitness">("all");
  const [sortBy, setSortBy] = useState<"monthlyViews" | "totalViews" | "watchRate" | "minCpm">("monthlyViews");

  useEffect(() => {
    // In production, fetch from /api/marketplace
    const timer = setTimeout(() => {
      setVideos(MOCK_VIDEOS);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const filtered = videos
    .filter((v) => verticalFilter === "all" || v.vertical === verticalFilter)
    .sort((a, b) => {
      if (sortBy === "monthlyViews") return b.monthlyViews - a.monthlyViews;
      if (sortBy === "totalViews") return b.totalViews - a.totalViews;
      if (sortBy === "watchRate") return b.avgWatchThroughRate - a.avgWatchThroughRate;
      if (sortBy === "minCpm") return a.minCpm - b.minCpm;
      return 0;
    });

  const totalAvailableSlots = videos.length;
  const totalReach = videos.reduce((s, v) => s + v.monthlyViews, 0);
  const avgWatchRate =
    videos.length > 0
      ? videos.reduce((s, v) => s + v.avgWatchThroughRate, 0) / videos.length
      : 0;
  const uniqueCreators = new Set(videos.map((v) => v.creator)).size;

  const statCards = [
    {
      title: "Available Slots",
      value: String(totalAvailableSlots),
      icon: Zap,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Total Monthly Reach",
      value: formatNumber(totalReach),
      icon: Eye,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Avg Watch Rate",
      value: `${(avgWatchRate * 100).toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Creators",
      value: String(uniqueCreators),
      icon: Users,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Marketplace</h1>
        <p className="text-slate-500 mt-1">
          Browse creator videos with available dynamic ad slots and find the
          right audience for your campaigns.
        </p>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">{card.title}</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
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

      {/* Filters + table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-base">Available Videos</CardTitle>
            <CardDescription>
              Videos with dynamic ad slots enabled by creators
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <Select
              value={verticalFilter}
              onValueChange={(v) => setVerticalFilter(v as typeof verticalFilter)}
            >
              <SelectTrigger className="w-36 h-8 text-sm">
                <SelectValue placeholder="Vertical" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Verticals</SelectItem>
                <SelectItem value="tech">Tech</SelectItem>
                <SelectItem value="fitness">Fitness</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sortBy}
              onValueChange={(v) => setSortBy(v as typeof sortBy)}
            >
              <SelectTrigger className="w-40 h-8 text-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthlyViews">Monthly Views</SelectItem>
                <SelectItem value="totalViews">Total Views</SelectItem>
                <SelectItem value="watchRate">Watch Rate</SelectItem>
                <SelectItem value="minCpm">Min CPM (Low)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Search className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No videos match your filters.</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 pl-6">Thumb</TableHead>
                      <TableHead>Video</TableHead>
                      <TableHead>Creator</TableHead>
                      <TableHead>Vertical</TableHead>
                      <TableHead className="text-right">Monthly Views</TableHead>
                      <TableHead className="text-right">Total Views</TableHead>
                      <TableHead className="text-right">Watch Rate</TableHead>
                      <TableHead className="text-right">Min CPM</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((video) => (
                      <TableRow key={video.id}>
                        <TableCell className="pl-6">
                          <div className="w-14 h-10 rounded bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                            <Video className="h-4 w-4 text-slate-300" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-medium text-slate-900 line-clamp-1 max-w-[220px]">
                            {video.title}
                          </p>
                          {video.isEvergreen && (
                            <Badge variant="success" className="mt-1 text-[10px] px-1.5 py-0">
                              Evergreen
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-medium text-slate-700">{video.creator}</p>
                          <p className="text-xs text-slate-400">
                            {formatNumber(video.subscriberCount)} subs
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {video.vertical}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm text-slate-700">
                          {formatNumber(video.monthlyViews)}
                          <span className="text-xs text-slate-400">/mo</span>
                        </TableCell>
                        <TableCell className="text-right text-sm text-slate-700">
                          {formatNumber(video.totalViews)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={cn(
                              "text-sm font-medium",
                              video.avgWatchThroughRate >= 0.65
                                ? "text-green-600"
                                : video.avgWatchThroughRate >= 0.5
                                ? "text-amber-600"
                                : "text-red-500"
                            )}
                          >
                            {(video.avgWatchThroughRate * 100).toFixed(0)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium text-slate-900">
                          ${video.minCpm}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" className="h-8 text-xs">
                            Add to Campaign
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 md:hidden">
                {filtered.map((video) => (
                  <Card key={video.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-5 pb-4 px-5">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 line-clamp-2">
                            {video.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {video.creator} &middot; {formatNumber(video.subscriberCount)} subs
                          </p>
                        </div>
                        <Badge variant="outline" className="capitalize shrink-0">
                          {video.vertical}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center mb-3">
                        <div>
                          <p className="text-xs text-slate-400">Monthly</p>
                          <p className="text-sm font-medium text-slate-700">
                            {formatNumber(video.monthlyViews)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Watch Rate</p>
                          <p className="text-sm font-medium text-slate-700">
                            {(video.avgWatchThroughRate * 100).toFixed(0)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Min CPM</p>
                          <p className="text-sm font-medium text-slate-700">${video.minCpm}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="w-full h-8 text-xs">
                        Add to Campaign
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
