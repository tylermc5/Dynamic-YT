"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Users, Building2, BarChart3, DollarSign, TrendingUp, Activity } from "lucide-react";

interface AdminStats {
  totalCreators: number;
  totalBrands: number;
  totalCampaigns: number;
  activeCampaigns: number;
  totalPlacements: number;
  activePlacements: number;
  gmv: number;
  platformRevenue: number;
}

const mockMonthlyData = [
  { month: "Oct", gmv: 18200, revenue: 2730, creators: 340, brands: 68 },
  { month: "Nov", gmv: 22400, revenue: 3360, creators: 378, brands: 76 },
  { month: "Dec", gmv: 31500, revenue: 4725, creators: 412, brands: 84 },
  { month: "Jan", gmv: 28900, revenue: 4335, creators: 445, brands: 91 },
  { month: "Feb", gmv: 34700, revenue: 5205, creators: 476, brands: 97 },
  { month: "Mar", gmv: 41200, revenue: 6180, creators: 502, brands: 103 },
];

const mockRecentActivity = [
  { id: "1", type: "creator_joined", name: "TechWithTim", detail: "Joined platform - 245K subscribers", time: "2 hours ago" },
  { id: "2", type: "campaign_launched", name: "Notion", detail: "Campaign launched - $5,000 budget", time: "4 hours ago" },
  { id: "3", type: "placement_approved", name: "Creator + Brand", detail: "Placement approved - $22 CPM", time: "6 hours ago" },
  { id: "4", type: "payout", name: "Creator Payout", detail: "Biweekly payout processed - $12,450", time: "1 day ago" },
  { id: "5", type: "brand_joined", name: "Fitbit", detail: "New brand onboarded - Fitness vertical", time: "1 day ago" },
  { id: "6", type: "campaign_launched", name: "Linear", detail: "Campaign launched - $8,000 budget", time: "2 days ago" },
];

const mockTopCreators = [
  { id: "1", name: "MKBHD", vertical: "tech", subscribers: 18500000, activeSlots: 42, monthlyEarnings: 8400 },
  { id: "2", name: "Linus Tech Tips", vertical: "tech", subscribers: 15200000, activeSlots: 38, monthlyEarnings: 7200 },
  { id: "3", name: "AthleanX", vertical: "fitness", subscribers: 13800000, activeSlots: 31, monthlyEarnings: 5900 },
  { id: "4", name: "Dave2D", vertical: "tech", subscribers: 3400000, activeSlots: 28, monthlyEarnings: 4100 },
  { id: "5", name: "Jeff Nippard", vertical: "fitness", subscribers: 4200000, activeSlots: 25, monthlyEarnings: 3800 },
];

const mockTopBrands = [
  { id: "1", name: "Notion", category: "SaaS", activeCampaigns: 3, totalSpend: 24500 },
  { id: "2", name: "NordVPN", category: "SaaS", activeCampaigns: 2, totalSpend: 19800 },
  { id: "3", name: "Whoop", category: "Fitness Tech", activeCampaigns: 2, totalSpend: 15200 },
  { id: "4", name: "Skillshare", category: "EdTech", activeCampaigns: 1, totalSpend: 12400 },
  { id: "5", name: "Squarespace", category: "SaaS", activeCampaigns: 2, totalSpend: 11800 },
];

function activityBadgeColor(type: string) {
  switch (type) {
    case "creator_joined": return "bg-blue-100 text-blue-700";
    case "brand_joined": return "bg-purple-100 text-purple-700";
    case "campaign_launched": return "bg-green-100 text-green-700";
    case "placement_approved": return "bg-yellow-100 text-yellow-700";
    case "payout": return "bg-slate-100 text-slate-700";
    default: return "bg-slate-100 text-slate-700";
  }
}

function activityLabel(type: string) {
  switch (type) {
    case "creator_joined": return "Creator";
    case "brand_joined": return "Brand";
    case "campaign_launched": return "Campaign";
    case "placement_approved": return "Placement";
    case "payout": return "Payout";
    default: return type;
  }
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => {
        // Use mock data if API fails
        setStats({
          totalCreators: 502,
          totalBrands: 103,
          totalCampaigns: 248,
          activeCampaigns: 89,
          totalPlacements: 1840,
          activePlacements: 634,
          gmv: 41200,
          platformRevenue: 6180,
        });
        setLoading(false);
      });
  }, []);

  const statCards = [
    {
      label: "Total Creators",
      value: stats ? formatNumber(stats.totalCreators) : "—",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      sub: "Active on platform",
    },
    {
      label: "Total Brands",
      value: stats ? formatNumber(stats.totalBrands) : "—",
      icon: Building2,
      color: "text-purple-600",
      bg: "bg-purple-50",
      sub: `${stats?.activeCampaigns ?? "—"} active campaigns`,
    },
    {
      label: "Platform GMV",
      value: stats ? formatCurrency(stats.gmv) : "—",
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
      sub: "This month",
    },
    {
      label: "Platform Revenue",
      value: stats ? formatCurrency(stats.platformRevenue) : "—",
      icon: TrendingUp,
      color: "text-red-600",
      bg: "bg-red-50",
      sub: "15% take rate",
    },
    {
      label: "Total Placements",
      value: stats ? formatNumber(stats.totalPlacements) : "—",
      icon: BarChart3,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      sub: `${stats?.activePlacements ?? "—"} active`,
    },
    {
      label: "Active Campaigns",
      value: stats ? formatNumber(stats.activeCampaigns) : "—",
      icon: Activity,
      color: "text-slate-600",
      bg: "bg-slate-50",
      sub: `of ${stats?.totalCampaigns ?? "—"} total`,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Platform-wide overview and metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">{card.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {loading ? <span className="animate-pulse">—</span> : card.value}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
                </div>
                <div className={`h-10 w-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly GMV & Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={mockMonthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Bar dataKey="gmv" fill="#e2e8f0" name="GMV" radius={[4, 4, 0, 0]} />
                <Bar dataKey="revenue" fill="#0f172a" name="Revenue" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Creator & Brand Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={mockMonthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="creators" stroke="#3b82f6" strokeWidth={2} name="Creators" dot={false} />
                <Line type="monotone" dataKey="brands" stroke="#a855f7" strokeWidth={2} name="Brands" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Creators */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Top Creators by Earnings</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs">View all</Button>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-slate-500 font-medium px-6 py-3">Creator</th>
                  <th className="text-right text-slate-500 font-medium px-6 py-3">Monthly</th>
                </tr>
              </thead>
              <tbody>
                {mockTopCreators.map((creator) => (
                  <tr key={creator.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-6 py-3">
                      <div className="font-medium text-slate-900">{creator.name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-xs py-0">
                          {creator.vertical}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          {formatNumber(creator.subscribers)} subs · {creator.activeSlots} slots
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right font-medium text-slate-900">
                      {formatCurrency(creator.monthlyEarnings)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Top Brands */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Top Brands by Spend</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs">View all</Button>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-slate-500 font-medium px-6 py-3">Brand</th>
                  <th className="text-right text-slate-500 font-medium px-6 py-3">Total Spend</th>
                </tr>
              </thead>
              <tbody>
                {mockTopBrands.map((brand) => (
                  <tr key={brand.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-6 py-3">
                      <div className="font-medium text-slate-900">{brand.name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-400">
                          {brand.category} · {brand.activeCampaigns} active campaign{brand.activeCampaigns !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right font-medium text-slate-900">
                      {formatCurrency(brand.totalSpend)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-50">
            {mockRecentActivity.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${activityBadgeColor(item.type)}`}>
                  {activityLabel(item.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-slate-900 text-sm">{item.name}</span>
                  <span className="text-slate-500 text-sm"> — {item.detail}</span>
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap">{item.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
