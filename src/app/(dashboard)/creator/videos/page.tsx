"use client";

import { useState, useEffect } from "react";
import { Video, Eye, TrendingUp, Zap, Loader2, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatNumber, formatDate } from "@/lib/utils";

// ---- Types ----

interface VideoItem {
  id: string;
  title: string;
  youtubeVideoId: string;
  publishedAt: string;
  durationSeconds: number;
  totalViews: number;
  monthlyViews: number;
  avgWatchThroughRate: number;
  isEvergreen: boolean;
  dynamicSlotAvailable: boolean;
  tags: string[];
}

// ---- Mock data ----

const MOCK_VIDEOS: VideoItem[] = [
  {
    id: "1",
    title: "10 VS Code Tips You Need in 2024",
    youtubeVideoId: "abc123",
    publishedAt: "2024-01-10T00:00:00Z",
    durationSeconds: 742,
    totalViews: 284000,
    monthlyViews: 18500,
    avgWatchThroughRate: 0.72,
    isEvergreen: true,
    dynamicSlotAvailable: true,
    tags: ["productivity", "vscode", "developer"],
  },
  {
    id: "2",
    title: "Building a REST API with Node.js & Express",
    youtubeVideoId: "def456",
    publishedAt: "2024-01-28T00:00:00Z",
    durationSeconds: 1540,
    totalViews: 156000,
    monthlyViews: 9200,
    avgWatchThroughRate: 0.61,
    isEvergreen: true,
    dynamicSlotAvailable: false,
    tags: ["nodejs", "api", "backend"],
  },
  {
    id: "3",
    title: "React 18 Deep Dive – Concurrent Mode Explained",
    youtubeVideoId: "ghi789",
    publishedAt: "2023-11-15T00:00:00Z",
    durationSeconds: 2280,
    totalViews: 412000,
    monthlyViews: 5800,
    avgWatchThroughRate: 0.68,
    isEvergreen: true,
    dynamicSlotAvailable: true,
    tags: ["react", "javascript", "frontend"],
  },
  {
    id: "4",
    title: "TypeScript Generics Explained with Real Examples",
    youtubeVideoId: "jkl012",
    publishedAt: "2024-02-05T00:00:00Z",
    durationSeconds: 890,
    totalViews: 98000,
    monthlyViews: 14100,
    avgWatchThroughRate: 0.75,
    isEvergreen: true,
    dynamicSlotAvailable: true,
    tags: ["typescript", "programming"],
  },
  {
    id: "5",
    title: "My 2024 Tech Setup Tour",
    youtubeVideoId: "mno345",
    publishedAt: "2024-02-20T00:00:00Z",
    durationSeconds: 1120,
    totalViews: 63000,
    monthlyViews: 22000,
    avgWatchThroughRate: 0.54,
    isEvergreen: false,
    dynamicSlotAvailable: false,
    tags: ["setup", "tech", "lifestyle"],
  },
  {
    id: "6",
    title: "Docker in 30 Minutes – Full Beginner Guide",
    youtubeVideoId: "pqr678",
    publishedAt: "2023-09-08T00:00:00Z",
    durationSeconds: 1800,
    totalViews: 531000,
    monthlyViews: 7400,
    avgWatchThroughRate: 0.71,
    isEvergreen: true,
    dynamicSlotAvailable: true,
    tags: ["docker", "devops", "backend"],
  },
];

// ---- Helpers ----

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return `${h}:${rem.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ---- Component ----

export default function CreatorVideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "evergreen" | "non_evergreen">("all");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/videos");
        if (res.ok) {
          const data = await res.json();
          setVideos(data.videos ?? []);
        } else {
          setVideos(MOCK_VIDEOS);
        }
      } catch {
        setVideos(MOCK_VIDEOS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function toggleDynamicSlot(video: VideoItem) {
    setTogglingId(video.id);
    const newValue = !video.dynamicSlotAvailable;

    // Optimistic update
    setVideos((prev) =>
      prev.map((v) =>
        v.id === video.id ? { ...v, dynamicSlotAvailable: newValue } : v
      )
    );

    try {
      const res = await fetch(`/api/videos/${video.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dynamicSlotAvailable: newValue }),
      });
      if (!res.ok) {
        // Revert on failure
        setVideos((prev) =>
          prev.map((v) =>
            v.id === video.id ? { ...v, dynamicSlotAvailable: !newValue } : v
          )
        );
      }
    } catch {
      // Revert on network error
      setVideos((prev) =>
        prev.map((v) =>
          v.id === video.id ? { ...v, dynamicSlotAvailable: !newValue } : v
        )
      );
    } finally {
      setTogglingId(null);
    }
  }

  const filtered = videos.filter((v) => {
    if (filter === "evergreen") return v.isEvergreen;
    if (filter === "non_evergreen") return !v.isEvergreen;
    return true;
  });

  const totalViews = videos.reduce((s, v) => s + v.totalViews, 0);
  const totalMonthlyViews = videos.reduce((s, v) => s + v.monthlyViews, 0);
  const avgWatchRate =
    videos.length > 0
      ? videos.reduce((s, v) => s + v.avgWatchThroughRate, 0) / videos.length
      : 0;
  const activeSlots = videos.filter((v) => v.dynamicSlotAvailable).length;

  const statCards = [
    {
      title: "Total Videos",
      value: String(videos.length || 24),
      icon: Video,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Total Views",
      value: formatNumber(totalViews || 1544000),
      icon: Eye,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Avg Watch Rate",
      value: `${((avgWatchRate || 0.675) * 100).toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Active Slots",
      value: String(activeSlots || 4),
      icon: Zap,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Videos</h1>
        <p className="text-slate-500 mt-1">
          Manage your video catalog and control which videos accept dynamic ad placements.
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

      {/* Videos table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base">Your Videos</CardTitle>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <Select
              value={filter}
              onValueChange={(v) => setFilter(v as typeof filter)}
            >
              <SelectTrigger className="w-44 h-8 text-sm">
                <SelectValue placeholder="Filter videos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Videos</SelectItem>
                <SelectItem value="evergreen">Evergreen Only</SelectItem>
                <SelectItem value="non_evergreen">Non-Evergreen</SelectItem>
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
              <Video className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No videos found. Adjust your filter or sync your YouTube channel.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 pl-6">Thumb</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="text-right">Total Views</TableHead>
                  <TableHead className="text-right">Monthly Views</TableHead>
                  <TableHead className="text-right">Watch Rate</TableHead>
                  <TableHead className="text-right">Duration</TableHead>
                  <TableHead className="text-center">Evergreen</TableHead>
                  <TableHead className="text-center">Dynamic Slot</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((video) => (
                  <TableRow key={video.id}>
                    {/* Thumbnail placeholder */}
                    <TableCell className="pl-6">
                      <div className="w-14 h-10 rounded bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                        <Video className="h-4 w-4 text-slate-300" />
                      </div>
                    </TableCell>

                    {/* Title */}
                    <TableCell>
                      <div className="max-w-[260px]">
                        <p className="text-sm font-medium text-slate-900 line-clamp-2 leading-snug">
                          {video.title}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {formatDate(video.publishedAt)}
                        </p>
                      </div>
                    </TableCell>

                    {/* Total Views */}
                    <TableCell className="text-right text-sm text-slate-700">
                      {formatNumber(video.totalViews)}
                    </TableCell>

                    {/* Monthly Views */}
                    <TableCell className="text-right text-sm text-slate-700">
                      {formatNumber(video.monthlyViews)}
                      <span className="text-xs text-slate-400">/mo</span>
                    </TableCell>

                    {/* Watch Rate */}
                    <TableCell className="text-right">
                      <span
                        className={`text-sm font-medium ${
                          video.avgWatchThroughRate >= 0.65
                            ? "text-green-600"
                            : video.avgWatchThroughRate >= 0.5
                            ? "text-amber-600"
                            : "text-red-500"
                        }`}
                      >
                        {(video.avgWatchThroughRate * 100).toFixed(0)}%
                      </span>
                    </TableCell>

                    {/* Duration */}
                    <TableCell className="text-right text-sm text-slate-500">
                      {formatDuration(video.durationSeconds)}
                    </TableCell>

                    {/* Evergreen badge */}
                    <TableCell className="text-center">
                      {video.isEvergreen ? (
                        <Badge variant="success">Evergreen</Badge>
                      ) : (
                        <Badge variant="secondary">Trending</Badge>
                      )}
                    </TableCell>

                    {/* Dynamic Slot toggle */}
                    <TableCell className="text-center">
                      <Switch
                        checked={video.dynamicSlotAvailable}
                        onCheckedChange={() => toggleDynamicSlot(video)}
                        disabled={togglingId === video.id}
                        aria-label="Toggle dynamic slot"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-slate-400 text-center pb-2">
        Enabling a dynamic slot allows brands to place ads in your video via our matching engine.
        You can approve or reject each placement before it goes live.
      </p>
    </div>
  );
}
