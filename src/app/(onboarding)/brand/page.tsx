"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  CreditCard,
  Building2,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

interface FormData {
  companyName: string;
  website: string;
  category: string;
  vertical: "tech" | "fitness" | "";
  logoUrl: string;
  paymentConnected: boolean;
}

type FieldErrors = Partial<Record<keyof FormData, string>>;

const CATEGORIES = [
  "SaaS",
  "eCommerce",
  "Health & Wellness",
  "Finance",
  "Gaming",
  "Other",
];

const STEPS = [
  { number: 1, label: "Company Info" },
  { number: 2, label: "Brand Assets & Billing" },
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

// ── Step 1 ─────────────────────────────────────────────────────────────────────

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
        <Label htmlFor="companyName">Company Name *</Label>
        <Input
          id="companyName"
          placeholder="Acme Corp"
          value={data.companyName}
          onChange={(e) => onChange({ companyName: e.target.value })}
          className={cn("mt-1", errors.companyName && "border-red-400")}
        />
        <FieldError msg={errors.companyName} />
      </div>

      <div>
        <Label htmlFor="website">Website URL *</Label>
        <Input
          id="website"
          type="url"
          placeholder="https://acmecorp.com"
          value={data.website}
          onChange={(e) => onChange({ website: e.target.value })}
          className={cn("mt-1", errors.website && "border-red-400")}
        />
        <FieldError msg={errors.website} />
      </div>

      <div>
        <Label htmlFor="category">Category *</Label>
        <Select
          value={data.category}
          onValueChange={(v) => onChange({ category: v })}
        >
          <SelectTrigger
            id="category"
            className={cn("mt-1 w-full", errors.category && "border-red-400")}
          >
            <SelectValue placeholder="Select your category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError msg={errors.category} />
      </div>

      <div>
        <Label>Vertical Preference *</Label>
        <p className="text-xs text-slate-400 mb-2 mt-0.5">
          Which content vertical best fits your brand?
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

// ── Step 2 ─────────────────────────────────────────────────────────────────────

function Step2({
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
      {/* Logo URL */}
      <div>
        <Label htmlFor="logoUrl">Logo URL</Label>
        <Input
          id="logoUrl"
          type="url"
          placeholder="https://acmecorp.com/logo.png"
          value={data.logoUrl}
          onChange={(e) => onChange({ logoUrl: e.target.value })}
          className="mt-1"
        />
        <p className="text-xs text-slate-400 mt-1">
          Link to your company logo (PNG or SVG recommended).
        </p>
        {data.logoUrl && (
          <div className="mt-3 w-16 h-16 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.logoUrl}
              alt="Logo preview"
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
      </div>

      {/* Payment setup */}
      <div>
        <Label>Payment Method</Label>
        <p className="text-xs text-slate-400 mt-0.5 mb-3">
          Connect a payment method to fund your campaigns.
        </p>
        {data.paymentConnected ? (
          <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">
                Payment method connected
              </p>
              <p className="text-xs text-green-600">
                Your account is ready for billing.
              </p>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onChange({ paymentConnected: true })}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 border-dashed border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50 transition-colors text-sm font-medium"
          >
            <CreditCard className="h-4 w-4" />
            Connect Payment Method
          </button>
        )}
        <FieldError msg={errors.paymentConnected} />
      </div>

      {/* Summary */}
      <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-4">
        <h4 className="text-sm font-semibold text-slate-700 mb-2">
          Account Summary
        </h4>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Company</span>
            <span className="text-slate-700 font-medium">
              {data.companyName || "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Website</span>
            <span className="text-slate-700 font-medium truncate max-w-[200px]">
              {data.website || "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Category</span>
            <span className="text-slate-700 font-medium">
              {data.category || "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Vertical</span>
            <span className="text-slate-700 font-medium capitalize">
              {data.vertical || "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

const INITIAL: FormData = {
  companyName: "",
  website: "",
  category: "",
  vertical: "",
  logoUrl: "",
  paymentConnected: false,
};

export default function BrandOnboardingPage() {
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
    if (!form.companyName.trim()) e.companyName = "Company name is required.";
    if (!form.website.trim()) e.website = "Website URL is required.";
    else if (
      !/^https?:\/\/.+/.test(form.website)
    )
      e.website = "Please enter a valid URL starting with http:// or https://";
    if (!form.category) e.category = "Please select a category.";
    if (!form.vertical) e.vertical = "Please select a vertical preference.";
    return e;
  }

  function validateStep2(): FieldErrors {
    const e: FieldErrors = {};
    if (!form.paymentConnected)
      e.paymentConnected = "Please connect a payment method to continue.";
    return e;
  }

  function handleNext() {
    const errs = validateStep1();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStep(2);
  }

  async function handleSubmit() {
    const errs = validateStep2();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    setApiError("");

    try {
      const res = await fetch("/api/brands/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: form.companyName,
          website: form.website,
          category: form.category,
          vertical: form.vertical,
          logoUrl: form.logoUrl,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to complete onboarding.");
      }

      router.push("/brand/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setApiError(message);
      // Redirect anyway in demo mode
      setTimeout(() => router.push("/brand/dashboard"), 1500);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-100 mb-4">
          <Building2 className="h-7 w-7 text-slate-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          Set up your brand account
        </h1>
        <p className="text-slate-500 mt-2 text-sm">
          Tell us about your company so we can match you with the right
          YouTube creators.
        </p>
      </div>

      <StepIndicator current={step} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{STEPS[step - 1].label}</CardTitle>
          <CardDescription>
            {step === 1
              ? "Basic information about your company and advertising goals."
              : "Add your logo and connect a payment method to get started."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <Step1 data={form} errors={errors} onChange={patch} />
          ) : (
            <Step2 data={form} errors={errors} onChange={patch} />
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
              onClick={() => setStep(1)}
              disabled={step === 1 || submitting}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>

            {step === 1 ? (
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
