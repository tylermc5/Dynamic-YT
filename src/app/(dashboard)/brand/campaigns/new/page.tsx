"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Check, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatCurrency } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

interface FormData {
  // Step 1 – Campaign basics
  name: string;
  vertical: "tech" | "fitness" | "";
  startDate: string;
  endDate: string;
  adCreativeUrl: string;

  // Step 2 – Audience
  ageMin: number;
  ageMax: number;
  gender: "all" | "male" | "female";
  geos: string[];

  // Step 3 – Budget
  budgetTotal: string;
  maxCpm: string;
}

type FieldErrors = Partial<Record<keyof FormData, string>>;

// ── Constants ──────────────────────────────────────────────────────────────────

const GEO_OPTIONS = ["US", "UK", "CA", "AU", "DE", "FR", "BR", "IN", "MX"];

const STEPS = [
  { number: 1, label: "Campaign Basics" },
  { number: 2, label: "Audience" },
  { number: 3, label: "Budget & Review" },
];

// ── Step progress indicator ────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((step, i) => (
        <div key={step.number} className="flex items-center">
          <div
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors",
              current === step.number
                ? "bg-slate-900 text-white"
                : current > step.number
                ? "bg-green-500 text-white"
                : "bg-slate-200 text-slate-500"
            )}
          >
            {current > step.number ? (
              <Check className="h-4 w-4" />
            ) : (
              step.number
            )}
          </div>
          <span
            className={cn(
              "ml-2 text-sm font-medium",
              current === step.number
                ? "text-slate-900"
                : current > step.number
                ? "text-green-600"
                : "text-slate-400"
            )}
          >
            {step.label}
          </span>
          {i < STEPS.length - 1 && (
            <div
              className={cn(
                "h-0.5 w-8 mx-3",
                current > step.number ? "bg-green-400" : "bg-slate-200"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Field error message ────────────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-red-500 mt-1">{msg}</p>;
}

// ── Step 1: Campaign Basics ────────────────────────────────────────────────────

function Step1({
  data,
  errors,
  onChange,
}: {
  data: FormData;
  errors: FieldErrors;
  onChange: (patch: Partial<FormData>) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="name">Campaign Name *</Label>
        <Input
          id="name"
          placeholder="e.g. Q2 SaaS Launch"
          value={data.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className={cn("mt-1", errors.name && "border-red-400")}
        />
        <FieldError msg={errors.name} />
      </div>

      <div>
        <Label>Vertical *</Label>
        <div className="flex gap-3 mt-1">
          {(["tech", "fitness"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onChange({ vertical: v })}
              className={cn(
                "flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-colors capitalize",
                data.vertical === v
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
              )}
            >
              {v === "tech" ? "Tech / Software" : "Health & Fitness"}
            </button>
          ))}
        </div>
        <FieldError msg={errors.vertical} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date *</Label>
          <Input
            id="startDate"
            type="date"
            value={data.startDate}
            onChange={(e) => onChange({ startDate: e.target.value })}
            className={cn("mt-1", errors.startDate && "border-red-400")}
          />
          <FieldError msg={errors.startDate} />
        </div>
        <div>
          <Label htmlFor="endDate">End Date *</Label>
          <Input
            id="endDate"
            type="date"
            value={data.endDate}
            onChange={(e) => onChange({ endDate: e.target.value })}
            className={cn("mt-1", errors.endDate && "border-red-400")}
          />
          <FieldError msg={errors.endDate} />
        </div>
      </div>

      <div>
        <Label htmlFor="adCreativeUrl">Ad Creative URL</Label>
        <Input
          id="adCreativeUrl"
          type="url"
          placeholder="https://your-cdn.com/ad-brief.pdf"
          value={data.adCreativeUrl}
          onChange={(e) => onChange({ adCreativeUrl: e.target.value })}
          className="mt-1"
        />
        <p className="text-xs text-slate-400 mt-1">
          Link to your ad brief, video, or creative assets.
        </p>
      </div>
    </div>
  );
}

// ── Step 2: Audience Targeting ─────────────────────────────────────────────────

function Step2({
  data,
  errors,
  onChange,
}: {
  data: FormData;
  errors: FieldErrors;
  onChange: (patch: Partial<FormData>) => void;
}) {
  function toggleGeo(geo: string) {
    const next = data.geos.includes(geo)
      ? data.geos.filter((g) => g !== geo)
      : [...data.geos, geo];
    onChange({ geos: next });
  }

  return (
    <div className="space-y-6">
      {/* Age range */}
      <div>
        <Label>Age Range</Label>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex-1">
            <Label htmlFor="ageMin" className="text-xs text-slate-500">
              Min age
            </Label>
            <Input
              id="ageMin"
              type="number"
              min={13}
              max={65}
              value={data.ageMin}
              onChange={(e) =>
                onChange({ ageMin: parseInt(e.target.value) || 18 })
              }
              className="mt-1"
            />
          </div>
          <span className="text-slate-400 mt-5">–</span>
          <div className="flex-1">
            <Label htmlFor="ageMax" className="text-xs text-slate-500">
              Max age
            </Label>
            <Input
              id="ageMax"
              type="number"
              min={13}
              max={65}
              value={data.ageMax}
              onChange={(e) =>
                onChange({ ageMax: parseInt(e.target.value) || 45 })
              }
              className="mt-1"
            />
          </div>
        </div>
        <FieldError msg={errors.ageMin} />
      </div>

      {/* Gender */}
      <div>
        <Label>Target Gender</Label>
        <div className="flex gap-3 mt-2">
          {(["all", "male", "female"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => onChange({ gender: g })}
              className={cn(
                "flex-1 py-2 px-3 rounded-lg border text-sm font-medium capitalize transition-colors",
                data.gender === g
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
              )}
            >
              {g === "all" ? "All Genders" : g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Target Geos */}
      <div>
        <Label>Target Regions</Label>
        <p className="text-xs text-slate-400 mb-2 mt-0.5">
          Select one or more target markets.
        </p>
        <div className="flex flex-wrap gap-2">
          {GEO_OPTIONS.map((geo) => (
            <button
              key={geo}
              type="button"
              onClick={() => toggleGeo(geo)}
              className={cn(
                "px-3 py-1.5 rounded-full border text-sm font-medium transition-colors",
                data.geos.includes(geo)
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
              )}
            >
              {geo}
            </button>
          ))}
        </div>
        <FieldError msg={errors.geos} />
        {data.geos.length > 0 && (
          <p className="text-xs text-slate-500 mt-2">
            Selected: {data.geos.join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Step 3: Budget & Review ────────────────────────────────────────────────────

function Step3({
  data,
  errors,
  onChange,
}: {
  data: FormData;
  errors: FieldErrors;
  onChange: (patch: Partial<FormData>) => void;
}) {
  const budgetNum = parseFloat(data.budgetTotal) || 0;
  const cpmNum = parseFloat(data.maxCpm) || 0;
  const estimatedImpressions =
    cpmNum > 0 ? Math.floor((budgetNum / cpmNum) * 1000) : 0;

  return (
    <div className="space-y-6">
      {/* Budget inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="budgetTotal">Total Budget (USD) *</Label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              $
            </span>
            <Input
              id="budgetTotal"
              type="number"
              min={500}
              step={100}
              placeholder="5000"
              value={data.budgetTotal}
              onChange={(e) => onChange({ budgetTotal: e.target.value })}
              className={cn("pl-7", errors.budgetTotal && "border-red-400")}
            />
          </div>
          <FieldError msg={errors.budgetTotal} />
        </div>
        <div>
          <Label htmlFor="maxCpm">Max CPM (USD) *</Label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              $
            </span>
            <Input
              id="maxCpm"
              type="number"
              min={5}
              max={100}
              step={1}
              placeholder="25"
              value={data.maxCpm}
              onChange={(e) => onChange({ maxCpm: e.target.value })}
              className={cn("pl-7", errors.maxCpm && "border-red-400")}
            />
          </div>
          <FieldError msg={errors.maxCpm} />
          <p className="text-xs text-slate-400 mt-1">
            Maximum cost per 1,000 impressions.
          </p>
        </div>
      </div>

      {/* Estimate */}
      {budgetNum > 0 && cpmNum > 0 && (
        <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
          <p className="text-sm text-blue-700 font-medium">
            Estimated reach:{" "}
            <span className="font-bold">
              {estimatedImpressions.toLocaleString()} impressions
            </span>
          </p>
          <p className="text-xs text-blue-500 mt-0.5">
            Based on your budget and max CPM
          </p>
        </div>
      )}

      {/* Review summary */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">
          Campaign Summary
        </h3>
        <div className="rounded-lg border border-slate-200 divide-y divide-slate-100">
          {[
            { label: "Name", value: data.name || "—" },
            {
              label: "Vertical",
              value: data.vertical
                ? data.vertical === "tech"
                  ? "Tech / Software"
                  : "Health & Fitness"
                : "—",
            },
            {
              label: "Dates",
              value:
                data.startDate && data.endDate
                  ? `${data.startDate} → ${data.endDate}`
                  : "—",
            },
            {
              label: "Audience",
              value: `Ages ${data.ageMin}–${data.ageMax} · ${data.gender === "all" ? "All genders" : data.gender}`,
            },
            {
              label: "Regions",
              value:
                data.geos.length > 0 ? data.geos.join(", ") : "All regions",
            },
            {
              label: "Budget",
              value: budgetNum ? formatCurrency(budgetNum) : "—",
            },
            { label: "Max CPM", value: cpmNum ? `$${cpmNum}` : "—" },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-start justify-between px-4 py-2.5 text-sm"
            >
              <span className="text-slate-500 shrink-0 w-24">{row.label}</span>
              <span className="text-slate-800 text-right font-medium">
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

const INITIAL: FormData = {
  name: "",
  vertical: "",
  startDate: "",
  endDate: "",
  adCreativeUrl: "",
  ageMin: 18,
  ageMax: 45,
  gender: "all",
  geos: ["US"],
  budgetTotal: "",
  maxCpm: "",
};

export default function NewCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  function patch(update: Partial<FormData>) {
    setForm((prev) => ({ ...prev, ...update }));
    // Clear related errors on change
    const keys = Object.keys(update) as (keyof FormData)[];
    setErrors((prev) => {
      const next = { ...prev };
      keys.forEach((k) => delete next[k]);
      return next;
    });
  }

  function validateStep1(): FieldErrors {
    const e: FieldErrors = {};
    if (!form.name.trim()) e.name = "Campaign name is required.";
    if (!form.vertical) e.vertical = "Please select a vertical.";
    if (!form.startDate) e.startDate = "Start date is required.";
    if (!form.endDate) e.endDate = "End date is required.";
    if (form.startDate && form.endDate && form.endDate <= form.startDate)
      e.endDate = "End date must be after start date.";
    return e;
  }

  function validateStep2(): FieldErrors {
    const e: FieldErrors = {};
    if (form.ageMin < 13 || form.ageMin > 65)
      e.ageMin = "Age must be between 13 and 65.";
    if (form.ageMax <= form.ageMin)
      e.ageMin = "Max age must be greater than min age.";
    return e;
  }

  function validateStep3(): FieldErrors {
    const e: FieldErrors = {};
    const budget = parseFloat(form.budgetTotal);
    const cpm = parseFloat(form.maxCpm);
    if (!form.budgetTotal || isNaN(budget) || budget < 500)
      e.budgetTotal = "Minimum budget is $500.";
    if (!form.maxCpm || isNaN(cpm) || cpm < 5)
      e.maxCpm = "Minimum CPM is $5.";
    if (cpm > 100) e.maxCpm = "Max CPM cannot exceed $100.";
    return e;
  }

  function handleNext() {
    const validators: Record<number, () => FieldErrors> = {
      1: validateStep1,
      2: validateStep2,
    };
    const errs = validators[step]?.() ?? {};
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStep((s) => s + 1);
  }

  async function handleSubmit() {
    const errs = validateStep3();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    setApiError("");

    try {
      // Get current user's brand id
      const meRes = await fetch("/api/auth/me");
      let brandId: string | undefined;
      if (meRes.ok) {
        const { user } = await meRes.json();
        brandId = user?.brand?.id;
      }

      const payload = {
        brandId: brandId ?? "demo-brand-id",
        name: form.name,
        vertical: form.vertical,
        startDate: form.startDate,
        endDate: form.endDate,
        adCreativeUrl: form.adCreativeUrl,
        targetAudienceAgeMin: form.ageMin,
        targetAudienceAgeMax: form.ageMax,
        targetAudienceGender: form.gender,
        targetGeos: form.geos,
        budgetTotal: parseFloat(form.budgetTotal),
        maxCpm: parseFloat(form.maxCpm),
      };

      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to create campaign.");
      }

      router.push("/brand/campaigns");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setApiError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Create Campaign</h1>
        <p className="text-sm text-slate-500 mt-1">
          Set up your new sponsorship campaign in a few steps.
        </p>
      </div>

      {/* Step indicator */}
      <StepIndicator current={step} />

      {/* Step content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {STEPS[step - 1].label}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Name your campaign and set the flight dates."}
            {step === 2 && "Define who you want to reach."}
            {step === 3 && "Set your budget and review before submitting."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <Step1 data={form} errors={errors} onChange={patch} />
          )}
          {step === 2 && (
            <Step2 data={form} errors={errors} onChange={patch} />
          )}
          {step === 3 && (
            <Step3 data={form} errors={errors} onChange={patch} />
          )}

          {apiError && (
            <div className="mt-4 rounded-md bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm text-red-700">{apiError}</p>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 1 || submitting}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>

            {step < 3 ? (
              <Button type="button" onClick={handleNext}>
                Continue
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating…
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Create Campaign
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
