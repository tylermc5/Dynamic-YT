"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  Youtube,
  ExternalLink,
} from "lucide-react";
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
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

interface FormData {
  channelId: string;
  channelName: string;
  subscriberCount: string;
  vertical: "tech" | "fitness" | "";

  minCpmFloor: string;
  blockedCategories: string[];

  stripeConnected: boolean;
}

type FieldErrors = Partial<Record<keyof FormData, string>>;

const BLOCKED_CATEGORY_OPTIONS = [
  { value: "Alcohol", label: "Alcohol & Spirits" },
  { value: "Gambling", label: "Gambling" },
  { value: "Political", label: "Political Advertising" },
  { value: "Adult", label: "Adult Content" },
  { value: "Tobacco", label: "Tobacco & Vaping" },
];

const STEPS = [
  { number: 1, label: "Channel Info" },
  { number: 2, label: "Preferences" },
  { number: 3, label: "Payouts" },
];

// ── Step indicator ─────────────────────────────────────────────────────────────

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

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-red-500 mt-1">{msg}</p>;
}

// ── Step 1: Channel Info ───────────────────────────────────────────────────────

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
        <Label htmlFor="channelId">YouTube Channel ID *</Label>
        <Input
          id="channelId"
          placeholder="UCxxxxxxxxxxxxxxxxxxxxxx"
          value={data.channelId}
          onChange={(e) => onChange({ channelId: e.target.value })}
          className={cn("mt-1 font-mono text-sm", errors.channelId && "border-red-400")}
        />
        <p className="text-xs text-slate-400 mt-1">
          Found in YouTube Studio under Settings → Channel → Advanced settings.
        </p>
        <FieldError msg={errors.channelId} />
      </div>

      <div>
        <Label htmlFor="channelName">Channel Name *</Label>
        <Input
          id="channelName"
          placeholder="TechWithDan"
          value={data.channelName}
          onChange={(e) => onChange({ channelName: e.target.value })}
          className={cn("mt-1", errors.channelName && "border-red-400")}
        />
        <FieldError msg={errors.channelName} />
      </div>

      <div>
        <Label htmlFor="subscriberCount">Subscriber Count *</Label>
        <Input
          id="subscriberCount"
          type="number"
          min={1000}
          placeholder="125000"
          value={data.subscriberCount}
          onChange={(e) => onChange({ subscriberCount: e.target.value })}
          className={cn("mt-1", errors.subscriberCount && "border-red-400")}
        />
        <p className="text-xs text-slate-400 mt-1">
          Minimum 1,000 subscribers required to join DynamicYT.
        </p>
        <FieldError msg={errors.subscriberCount} />
      </div>

      <div>
        <Label>Content Vertical *</Label>
        <p className="text-xs text-slate-400 mb-2 mt-0.5">
          What type of content do you primarily create?
        </p>
        <div className="flex gap-3">
          {(["tech", "fitness"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onChange({ vertical: v })}
              className={cn(
                "flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-colors",
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
    </div>
  );
}

// ── Step 2: Preferences ────────────────────────────────────────────────────────

function Step2({
  data,
  errors,
  onChange,
}: {
  data: FormData;
  errors: FieldErrors;
  onChange: (patch: Partial<FormData>) => void;
}) {
  function toggleCategory(cat: string) {
    const next = data.blockedCategories.includes(cat)
      ? data.blockedCategories.filter((c) => c !== cat)
      : [...data.blockedCategories, cat];
    onChange({ blockedCategories: next });
  }

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="minCpm">Minimum CPM Floor (USD) *</Label>
        <div className="relative mt-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            $
          </span>
          <Input
            id="minCpm"
            type="number"
            min={5}
            max={200}
            step={1}
            value={data.minCpmFloor}
            onChange={(e) => onChange({ minCpmFloor: e.target.value })}
            className={cn("pl-7", errors.minCpmFloor && "border-red-400")}
          />
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Campaigns offering less than this amount per 1,000 views will be
          automatically skipped.
        </p>
        <FieldError msg={errors.minCpmFloor} />
      </div>

      <div>
        <Label>Blocked Brand Categories</Label>
        <p className="text-xs text-slate-400 mt-0.5 mb-3">
          Select any categories you don&apos;t want to promote.
        </p>
        <div className="space-y-2.5">
          {BLOCKED_CATEGORY_OPTIONS.map((opt) => {
            const checked = data.blockedCategories.includes(opt.value);
            return (
              <label
                key={opt.value}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors",
                  checked
                    ? "border-red-200 bg-red-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                <div
                  className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                    checked
                      ? "border-red-500 bg-red-500"
                      : "border-slate-300"
                  )}
                  onClick={() => toggleCategory(opt.value)}
                >
                  {checked && <Check className="h-3 w-3 text-white" />}
                </div>
                <span className="text-sm text-slate-700">{opt.label}</span>
              </label>
            );
          })}
        </div>
        {data.blockedCategories.length > 0 && (
          <p className="text-xs text-slate-500 mt-2">
            Blocking: {data.blockedCategories.join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Step 3: Stripe Payouts ─────────────────────────────────────────────────────

function Step3({
  data,
  errors,
  onChange,
}: {
  data: FormData;
  errors: FieldErrors;
  onChange: (patch: Partial<FormData>) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-slate-50 border border-slate-200 px-5 py-4">
        <h4 className="text-sm font-semibold text-slate-700 mb-1">
          Why do we need this?
        </h4>
        <p className="text-sm text-slate-500">
          DynamicYT pays creators directly via Stripe. Connecting your Stripe
          account enables fast, automatic payouts when campaigns complete.
        </p>
      </div>

      {data.stripeConnected ? (
        <div className="flex items-center gap-4 rounded-lg border border-green-200 bg-green-50 px-5 py-4">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <Check className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-green-800">
              Stripe Connected
            </p>
            <p className="text-xs text-green-600">
              You&apos;re all set to receive payouts.
            </p>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onChange({ stripeConnected: true })}
          className="w-full flex items-center justify-center gap-3 py-4 px-5 rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-300 transition-colors group"
        >
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
            <ExternalLink className="h-4 w-4 text-white" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-indigo-900">
              Connect with Stripe
            </p>
            <p className="text-xs text-indigo-600">
              Secure payout setup — takes 2 minutes
            </p>
          </div>
        </button>
      )}

      <FieldError msg={errors.stripeConnected} />

      {/* Summary */}
      <div className="rounded-lg border border-slate-200 divide-y divide-slate-100">
        <div className="px-4 py-2 bg-slate-50 rounded-t-lg">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Account Preview
          </p>
        </div>
        {[
          { label: "Channel", value: data.channelName || "—" },
          { label: "Vertical", value: data.vertical || "—" },
          { label: "Min CPM", value: data.minCpmFloor ? `$${data.minCpmFloor}` : "—" },
          {
            label: "Blocked",
            value:
              data.blockedCategories.length > 0
                ? data.blockedCategories.join(", ")
                : "None",
          },
          {
            label: "Stripe",
            value: data.stripeConnected ? "Connected" : "Not connected",
          },
        ].map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between px-4 py-2.5 text-sm"
          >
            <span className="text-slate-400">{row.label}</span>
            <span className="text-slate-700 font-medium capitalize">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

const INITIAL: FormData = {
  channelId: "",
  channelName: "",
  subscriberCount: "",
  vertical: "",
  minCpmFloor: "15",
  blockedCategories: [],
  stripeConnected: false,
};

export default function CreatorOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  function patch(update: Partial<FormData>) {
    setForm((prev) => ({ ...prev, ...update }));
    const keys = Object.keys(update) as (keyof FormData)[];
    setErrors((prev) => {
      const next = { ...prev };
      keys.forEach((k) => delete next[k]);
      return next;
    });
  }

  function validateStep1(): FieldErrors {
    const e: FieldErrors = {};
    if (!form.channelId.trim()) e.channelId = "Channel ID is required.";
    if (!form.channelName.trim()) e.channelName = "Channel name is required.";
    const subs = parseInt(form.subscriberCount);
    if (!form.subscriberCount || isNaN(subs) || subs < 1000)
      e.subscriberCount = "You need at least 1,000 subscribers.";
    if (!form.vertical) e.vertical = "Please select a vertical.";
    return e;
  }

  function validateStep2(): FieldErrors {
    const e: FieldErrors = {};
    const cpm = parseFloat(form.minCpmFloor);
    if (!form.minCpmFloor || isNaN(cpm) || cpm < 5)
      e.minCpmFloor = "Minimum CPM floor is $5.";
    return e;
  }

  function validateStep3(): FieldErrors {
    const e: FieldErrors = {};
    if (!form.stripeConnected)
      e.stripeConnected = "Please connect Stripe to receive payouts.";
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
      const res = await fetch("/api/creators/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId: form.channelId,
          channelName: form.channelName,
          subscriberCount: parseInt(form.subscriberCount),
          vertical: form.vertical,
          minCpmFloor: parseFloat(form.minCpmFloor),
          blockedCategories: form.blockedCategories,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to complete onboarding.");
      }

      router.push("/creator/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setApiError(message);
      // Redirect anyway in demo mode
      setTimeout(() => router.push("/creator/dashboard"), 1500);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-50 mb-4">
          <Youtube className="h-7 w-7 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          Set up your creator account
        </h1>
        <p className="text-slate-500 mt-2 text-sm">
          Connect your YouTube channel and start earning from dynamic ad
          placements.
        </p>
      </div>

      <StepIndicator current={step} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{STEPS[step - 1].label}</CardTitle>
          <CardDescription>
            {step === 1 && "Tell us about your YouTube channel."}
            {step === 2 &&
              "Set your minimum earnings floor and category preferences."}
            {step === 3 && "Connect Stripe to receive your campaign earnings."}
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
                    Finishing…
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Complete Setup
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
