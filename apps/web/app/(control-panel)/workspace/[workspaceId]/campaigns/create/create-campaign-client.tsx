"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Rocket, Bolt, Upload, Check, Loader2, Gauge, Clock2, Search } from "lucide-react";
import { useNotification } from "@repo/ui/notification-provider";
import { createCampaign, type CreateCampaignInput } from "../../../../../src/actions/workspace/create-campaign";
import type { SmtpAccountInfo } from "../../../../../src/actions/workspace/get-smtp-accounts";
import type { GenerationJobInfo } from "../../../../../src/actions/workspace/workspace-info";

const formSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  description: z.string().optional(),
  timezone: z.string().min(1, "Timezone is required"),
  startAt: z.string().min(1, "Start date is required"),
  endAt: z.string().min(1, "End date is required"),
  dailyLimit: z.number().min(1, "Daily limit must be at least 1"),
  randomDelayMin: z.number().min(30, "Minimum delay is 30 seconds"),
  hoursFrom: z.string().min(1, "Start time is required"),
  hoursTo: z.string().min(1, "End time is required"),
  followUpEnabled: z.boolean(),
  stopOnReply: z.boolean(),
  stopOnBounce: z.boolean(),
  smtpAccountId: z.string().min(1, "Select an SMTP account"),
});

type FormValues = z.infer<typeof formSchema>;

type LeadSource = "job" | "manual" | null;

type ParsedRow = {
  email: string;
  subject: string;
  greeting: string;
  body: string;
  signature: string;
};

function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0]!.split(",").map((h) => h.trim().toLowerCase().replace(/^["']|["']$/g, ""));
  const rows = lines.slice(1)
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const values = line.split(",").map((v) => v.trim().replace(/^["']|["']$/g, ""));
      const row: Record<string, string> = {};
      headers.forEach((h, i) => { row[h] = values[i] ?? ""; });
      return row;
    });
  return { headers, rows };
}

function getHourFromTime(timeStr: string): number {
  const [h] = timeStr.split(":").map(Number);
  return h ?? 9;
}

type CreateCampaignClientProps = {
  workspaceId: string;
  generationJobs: GenerationJobInfo[];
  smtpAccounts: SmtpAccountInfo[];
};

const timezoneOptions = [
  { value: "Pacific/Midway", label: "Pacific/Midway (UTC-11:00)" },
  { value: "Pacific/Pago_Pago", label: "Pacific/Pago_Pago (UTC-11:00)" },
  { value: "Pacific/Honolulu", label: "Pacific/Honolulu (UTC-10:00)" },
  { value: "America/Anchorage", label: "America/Anchorage (UTC-09:00)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (UTC-08:00)" },
  { value: "America/Tijuana", label: "America/Tijuana (UTC-08:00)" },
  { value: "America/Denver", label: "America/Denver (UTC-07:00)" },
  { value: "America/Phoenix", label: "America/Phoenix (UTC-07:00)" },
  { value: "America/Chicago", label: "America/Chicago (UTC-06:00)" },
  { value: "America/Mexico_City", label: "America/Mexico_City (UTC-06:00)" },
  { value: "America/Regina", label: "America/Regina (UTC-06:00)" },
  { value: "America/Bogota", label: "America/Bogota (UTC-05:00)" },
  { value: "America/New_York", label: "America/New_York (UTC-05:00)" },
  { value: "America/Port-au-Prince", label: "America/Port-au-Prince (UTC-05:00)" },
  { value: "America/Havana", label: "America/Havana (UTC-05:00)" },
  { value: "America/Caracas", label: "America/Caracas (UTC-04:00)" },
  { value: "America/Halifax", label: "America/Halifax (UTC-04:00)" },
  { value: "America/Santo_Domingo", label: "America/Santo_Domingo (UTC-04:00)" },
  { value: "America/St_Johns", label: "America/St_Johns (UTC-03:30)" },
  { value: "America/Argentina/Buenos_Aires", label: "America/Argentina/Buenos_Aires (UTC-03:00)" },
  { value: "America/Santiago", label: "America/Santiago (UTC-03:00)" },
  { value: "America/Sao_Paulo", label: "America/Sao_Paulo (UTC-03:00)" },
  { value: "America/Godthab", label: "America/Godthab (UTC-03:00)" },
  { value: "America/Montevideo", label: "America/Montevideo (UTC-03:00)" },
  { value: "Atlantic/Azores", label: "Atlantic/Azores (UTC-01:00)" },
  { value: "Atlantic/Cape_Verde", label: "Atlantic/Cape_Verde (UTC-01:00)" },
  { value: "UTC", label: "UTC (UTC+00:00)" },
  { value: "Europe/London", label: "Europe/London (UTC+00:00)" },
  { value: "Europe/Dublin", label: "Europe/Dublin (UTC+00:00)" },
  { value: "Africa/Casablanca", label: "Africa/Casablanca (UTC+00:00)" },
  { value: "Africa/Accra", label: "Africa/Accra (UTC+00:00)" },
  { value: "Europe/Amsterdam", label: "Europe/Amsterdam (UTC+01:00)" },
  { value: "Europe/Berlin", label: "Europe/Berlin (UTC+01:00)" },
  { value: "Europe/Brussels", label: "Europe/Brussels (UTC+01:00)" },
  { value: "Europe/Budapest", label: "Europe/Budapest (UTC+01:00)" },
  { value: "Europe/Copenhagen", label: "Europe/Copenhagen (UTC+01:00)" },
  { value: "Europe/Madrid", label: "Europe/Madrid (UTC+01:00)" },
  { value: "Europe/Paris", label: "Europe/Paris (UTC+01:00)" },
  { value: "Europe/Prague", label: "Europe/Prague (UTC+01:00)" },
  { value: "Europe/Rome", label: "Europe/Rome (UTC+01:00)" },
  { value: "Europe/Stockholm", label: "Europe/Stockholm (UTC+01:00)" },
  { value: "Europe/Vienna", label: "Europe/Vienna (UTC+01:00)" },
  { value: "Europe/Warsaw", label: "Europe/Warsaw (UTC+01:00)" },
  { value: "Europe/Zurich", label: "Europe/Zurich (UTC+01:00)" },
  { value: "Africa/Lagos", label: "Africa/Lagos (UTC+01:00)" },
  { value: "Africa/Tunis", label: "Africa/Tunis (UTC+01:00)" },
  { value: "Europe/Athens", label: "Europe/Athens (UTC+02:00)" },
  { value: "Europe/Bucharest", label: "Europe/Bucharest (UTC+02:00)" },
  { value: "Europe/Helsinki", label: "Europe/Helsinki (UTC+02:00)" },
  { value: "Europe/Istanbul", label: "Europe/Istanbul (UTC+02:00)" },
  { value: "Europe/Kiev", label: "Europe/Kiev (UTC+02:00)" },
  { value: "Europe/Riga", label: "Europe/Riga (UTC+02:00)" },
  { value: "Europe/Sofia", label: "Europe/Sofia (UTC+02:00)" },
  { value: "Europe/Tallinn", label: "Europe/Tallinn (UTC+02:00)" },
  { value: "Europe/Vilnius", label: "Europe/Vilnius (UTC+02:00)" },
  { value: "Asia/Jerusalem", label: "Asia/Jerusalem (UTC+02:00)" },
  { value: "Africa/Cairo", label: "Africa/Cairo (UTC+02:00)" },
  { value: "Africa/Johannesburg", label: "Africa/Johannesburg (UTC+02:00)" },
  { value: "Africa/Khartoum", label: "Africa/Khartoum (UTC+02:00)" },
  { value: "Asia/Baghdad", label: "Asia/Baghdad (UTC+03:00)" },
  { value: "Asia/Kuwait", label: "Asia/Kuwait (UTC+03:00)" },
  { value: "Asia/Qatar", label: "Asia/Qatar (UTC+03:00)" },
  { value: "Asia/Riyadh", label: "Asia/Riyadh (UTC+03:00)" },
  { value: "Europe/Moscow", label: "Europe/Moscow (UTC+03:00)" },
  { value: "Africa/Addis_Ababa", label: "Africa/Addis_Ababa (UTC+03:00)" },
  { value: "Africa/Nairobi", label: "Africa/Nairobi (UTC+03:00)" },
  { value: "Asia/Tehran", label: "Asia/Tehran (UTC+03:30)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (UTC+04:00)" },
  { value: "Asia/Muscat", label: "Asia/Muscat (UTC+04:00)" },
  { value: "Asia/Baku", label: "Asia/Baku (UTC+04:00)" },
  { value: "Asia/Tbilisi", label: "Asia/Tbilisi (UTC+04:00)" },
  { value: "Asia/Yerevan", label: "Asia/Yerevan (UTC+04:00)" },
  { value: "Asia/Kabul", label: "Asia/Kabul (UTC+04:30)" },
  { value: "Asia/Karachi", label: "Asia/Karachi (UTC+05:00)" },
  { value: "Asia/Tashkent", label: "Asia/Tashkent (UTC+05:00)" },
  { value: "Asia/Yekaterinburg", label: "Asia/Yekaterinburg (UTC+05:00)" },
  { value: "Asia/Colombo", label: "Asia/Colombo (UTC+05:30)" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata (UTC+05:30)" },
  { value: "Asia/Kathmandu", label: "Asia/Kathmandu (UTC+05:45)" },
  { value: "Asia/Almaty", label: "Asia/Almaty (UTC+06:00)" },
  { value: "Asia/Dhaka", label: "Asia/Dhaka (UTC+06:00)" },
  { value: "Asia/Novosibirsk", label: "Asia/Novosibirsk (UTC+07:00)" },
  { value: "Asia/Bangkok", label: "Asia/Bangkok (UTC+07:00)" },
  { value: "Asia/Ho_Chi_Minh", label: "Asia/Ho_Chi_Minh (UTC+07:00)" },
  { value: "Asia/Jakarta", label: "Asia/Jakarta (UTC+07:00)" },
  { value: "Asia/Krasnoyarsk", label: "Asia/Krasnoyarsk (UTC+07:00)" },
  { value: "Asia/Shanghai", label: "Asia/Shanghai (UTC+08:00)" },
  { value: "Asia/Hong_Kong", label: "Asia/Hong_Kong (UTC+08:00)" },
  { value: "Asia/Kuala_Lumpur", label: "Asia/Kuala_Lumpur (UTC+08:00)" },
  { value: "Asia/Manila", label: "Asia/Manila (UTC+08:00)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (UTC+08:00)" },
  { value: "Asia/Taipei", label: "Asia/Taipei (UTC+08:00)" },
  { value: "Asia/Ulaanbaatar", label: "Asia/Ulaanbaatar (UTC+08:00)" },
  { value: "Australia/Perth", label: "Australia/Perth (UTC+08:00)" },
  { value: "Asia/Irkutsk", label: "Asia/Irkutsk (UTC+08:00)" },
  { value: "Asia/Seoul", label: "Asia/Seoul (UTC+09:00)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (UTC+09:00)" },
  { value: "Asia/Yakutsk", label: "Asia/Yakutsk (UTC+09:00)" },
  { value: "Australia/Darwin", label: "Australia/Darwin (UTC+09:30)" },
  { value: "Australia/Adelaide", label: "Australia/Adelaide (UTC+09:30)" },
  { value: "Australia/Brisbane", label: "Australia/Brisbane (UTC+10:00)" },
  { value: "Australia/Sydney", label: "Australia/Sydney (UTC+10:00)" },
  { value: "Australia/Melbourne", label: "Australia/Melbourne (UTC+10:00)" },
  { value: "Pacific/Port_Moresby", label: "Pacific/Port_Moresby (UTC+10:00)" },
  { value: "Asia/Vladivostok", label: "Asia/Vladivostok (UTC+10:00)" },
  { value: "Pacific/Guam", label: "Pacific/Guam (UTC+10:00)" },
  { value: "Pacific/Noumea", label: "Pacific/Noumea (UTC+11:00)" },
  { value: "Pacific/Norfolk", label: "Pacific/Norfolk (UTC+11:00)" },
  { value: "Asia/Kamchatka", label: "Asia/Kamchatka (UTC+12:00)" },
  { value: "Pacific/Auckland", label: "Pacific/Auckland (UTC+12:00)" },
  { value: "Pacific/Fiji", label: "Pacific/Fiji (UTC+12:00)" },
  { value: "Pacific/Majuro", label: "Pacific/Majuro (UTC+12:00)" },
  { value: "Pacific/Chatham", label: "Pacific/Chatham (UTC+12:45)" },
  { value: "Pacific/Tongatapu", label: "Pacific/Tongatapu (UTC+13:00)" },
  { value: "Pacific/Apia", label: "Pacific/Apia (UTC+13:00)" },
  { value: "Pacific/Kiritimati", label: "Pacific/Kiritimati (UTC+14:00)" },
];

export function CreateCampaignClient({ workspaceId, generationJobs, smtpAccounts }: CreateCampaignClientProps) {
  const router = useRouter();
  const { notify } = useNotification();
  const [currentStep, setCurrentStep] = useState(1);
  const [leadSource, setLeadSource] = useState<LeadSource>(null);
  const [generationJobId, setGenerationJobId] = useState("");
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [followUpEnabled, setFollowUpEnabled] = useState(true);
  const [stopOnReply, setStopOnReply] = useState(true);
  const [stopOnBounce, setStopOnBounce] = useState(true);
  const [timezoneSearch, setTimezoneSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredTimezoneOptions = timezoneOptions.filter((tz) =>
    tz.label.toLowerCase().includes(timezoneSearch.toLowerCase())
  );
  const completedJobs = generationJobs.filter((job) => job.status === "COMPLETED");

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      timezone: "UTC",
      startAt: new Date().toISOString().split("T")[0],
      endAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      dailyLimit: 50,
      randomDelayMin: 30,
      hoursFrom: "09:00",
      hoursTo: "17:00",
      followUpEnabled: true,
      stopOnReply: true,
      stopOnBounce: true,
      smtpAccountId: "",
    },
  });

  const goToStep = useCallback(async (step: number) => {
    if (step > currentStep) {
      if (currentStep === 1) {
        const valid = await trigger(["name", "timezone", "startAt", "endAt"]);
        if (!valid) return;
      }
      if (currentStep === 2) {
        const valid = await trigger(["dailyLimit", "randomDelayMin", "hoursFrom", "hoursTo", "smtpAccountId"]);
        if (!valid) return;
      }
    }
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep, trigger]);

  const handleLeadSource = useCallback((source: LeadSource) => {
    setLeadSource(source);
    if (source === "manual") setGenerationJobId("");
    if (source === "job") { setParsedRows([]); setCsvFileName(""); }
  }, []);

  const handleCsvFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const { headers, rows } = parseCSV(text);
      if (rows.length === 0) {
        notify({ title: "Invalid CSV", message: "File has no data rows.", tone: "error" });
        return;
      }
      const emailCol = headers.find((h) => h === "email" || h === "e-mail" || h === "mail");
      if (!emailCol) {
        notify({ title: "Missing column", message: "CSV must have an 'email' column.", tone: "error" });
        return;
      }
      const parsed: ParsedRow[] = rows.map((r) => ({
        email: r[emailCol] ?? "",
        subject: (r["subject"] ?? r["sub"] ?? "").trim() || getValues("name"),
        greeting: (r["greeting"] ?? r["greet"] ?? "").trim() || "Hello",
        body: (r["body"] ?? "").trim() || "",
        signature: (r["signature"] ?? r["sig"] ?? r["sign"] ?? "").trim() || "",
      })).filter((r) => r.email.length > 0);
      setParsedRows(parsed);
      notify({ title: "CSV parsed", message: `${parsed.length} email(s) loaded.`, tone: "success" });
    };
    reader.readAsText(file);
  }, [getValues, notify]);

  const onSubmit = useCallback(async () => {
    const values = getValues();
    if (leadSource === "job" && !generationJobId) {
      notify({ title: "Validation Error", message: "Select a generation job or choose manual entry.", tone: "error" });
      return;
    }
    if (leadSource === "manual" && parsedRows.length === 0) {
      notify({ title: "Validation Error", message: "Upload a CSV with email data.", tone: "error" });
      return;
    }

    setIsSubmitting(true);

    const input: CreateCampaignInput = {
      name: values.name,
      description: values.description || undefined,
      timezone: values.timezone,
      startAt: values.startAt,
      endAt: values.endAt,
      dailyLimit: values.dailyLimit,
      sendingFromHour: getHourFromTime(values.hoursFrom),
      sendingToHour: getHourFromTime(values.hoursTo),
      randomDelayMin: Math.max(1, Math.ceil(values.randomDelayMin / 60)),
      followUpEnabled,
      stopOnReply,
      stopOnBounce,
      smtpAccountId: values.smtpAccountId,
    };

    if (leadSource === "job") {
      input.generationJobId = generationJobId;
    } else {
      input.emails = parsedRows.map((r) => ({
        email: r.email,
        subject: r.subject || values.name,
        greeting: r.greeting || "Hello",
        body: r.body || "We'd love to connect.",
        signature: r.signature || "",
      }));
    }

    const result = await createCampaign(workspaceId, input);
    setIsSubmitting(false);

    if (result.status === "error") {
      notify({ title: "Failed to create campaign", message: result.message, tone: "error" });
      return;
    }

    notify({ title: "Campaign created", message: `"${result.campaign.name}" has been created as draft.`, tone: "success" });
    router.push(`/workspace/${workspaceId}/campaigns`);
  }, [getValues, leadSource, generationJobId, parsedRows, workspaceId, notify, router, followUpEnabled, stopOnReply, stopOnBounce]);

  const progressWidth = `${(currentStep - 1) * 50}%`;

  return (
    <div className="min-h-0 flex-1 overflow-auto p-[32px] space-y-[24px] custom-scrollbar max-w-5xl mx-auto w-full">
      <div className="text-center mb-[24px]">
        <h2 className="text-[36px] leading-[44px] font-bold tracking-[-0.01em] text-[#191b23] mb-[8px]">Create New Campaign</h2>
        <p className="text-[16px] leading-[24px] text-[#434655] max-w-2xl mx-auto">
          Set up your strategic outreach with precision. Configure details, delivery logic, and leads to launch your enterprise campaign.
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="relative flex justify-between items-center mb-[48px] max-w-2xl mx-auto px-[24px]">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#c3c6d7] -translate-y-1/2 -z-10" />
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-[#004ac6] -translate-y-1/2 -z-10 transition-all duration-500"
          style={{ width: progressWidth }}
        />
        <StepNode num={1} label="Details" current={currentStep} />
        <StepNode num={2} label="Delivery" current={currentStep} />
        <StepNode num={3} label="Leads" current={currentStep} />
      </div>

      <form className="relative min-h-[500px]" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Step 1: Campaign Details */}
        {currentStep === 1 && (
          <div className="w-full flex flex-col gap-[24px]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[24px]">
              <div className="bg-white border border-[#c3c6d7] p-[24px] rounded-xl flex flex-col gap-[16px]">
                <Label>Campaign Name</Label>
                <input
                  {...register("name")}
                  className="w-full px-[16px] py-[8px] rounded-lg border border-[#c3c6d7] focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6] outline-none transition-all"
                  placeholder="e.g. Q4 EMEA Enterprise SaaS"
                />
                {errors.name && <ErrorMsg>{errors.name.message}</ErrorMsg>}
                <Label className="mt-[16px]">Start Date</Label>
                <input
                  {...register("startAt")}
                  type="date"
                  className="w-full px-[16px] py-[8px] rounded-lg border border-[#c3c6d7] focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6] outline-none transition-all"
                />
                {errors.startAt && <ErrorMsg>{errors.startAt.message}</ErrorMsg>}
                <Label className="mt-[16px]">End Date</Label>
                <input
                  {...register("endAt")}
                  type="date"
                  className="w-full px-[16px] py-[8px] rounded-lg border border-[#c3c6d7] focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6] outline-none transition-all"
                />
                {errors.endAt && <ErrorMsg>{errors.endAt.message}</ErrorMsg>}
                <Label className="mt-[16px]">Timezone</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#737686]" />
                  <input
                    type="text"
                    placeholder="Search timezone..."
                    value={timezoneSearch}
                    onChange={(e) => setTimezoneSearch(e.target.value)}
                    className="w-full px-[16px] pl-10 py-[8px] rounded-lg border border-[#c3c6d7] focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6] outline-none transition-all text-sm"
                  />
                </div>
                <select
                  {...register("timezone")}
                  className="w-full px-[16px] py-[8px] rounded-lg border border-[#c3c6d7] focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6] outline-none transition-all bg-white"
                >
                  {filteredTimezoneOptions.map((tz) => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
                {errors.timezone && <ErrorMsg>{errors.timezone.message}</ErrorMsg>}
              </div>
              <div className="bg-white border border-[#c3c6d7] p-[24px] rounded-xl flex flex-col gap-[16px]">
                <Label>Description</Label>
                <textarea
                  {...register("description")}
                  className="w-full flex-1 px-[16px] py-[8px] rounded-lg border border-[#c3c6d7] focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6] outline-none transition-all resize-none min-h-[200px]"
                  placeholder="Internal notes about the campaign goals and target audience..."
                />
              </div>
            </div>
            <div className="flex justify-end pt-[24px]">
              <button
                type="button"
                onClick={() => goToStep(2)}
                className="px-[24px] py-[16px] bg-[#004ac6] text-white rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all flex items-center gap-[8px]"
              >
                Continue
                <ArrowRight className="size-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Delivery Rules */}
        {currentStep === 2 && (
          <div className="w-full flex flex-col gap-[24px]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px]">
              <div className="lg:col-span-7 space-y-[24px]">
                <div className="bg-white border border-[#c3c6d7] p-[24px] rounded-xl grid grid-cols-2 gap-[24px]">
                  <div className="flex flex-col gap-[8px]">
                    <Label>Daily Limit</Label>
                    <div className="relative">
                      <input
                        {...register("dailyLimit", { valueAsNumber: true })}
                        type="number"
                        className="w-full px-[16px] py-[8px] rounded-lg border border-[#c3c6d7] focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6] outline-none transition-all pl-10"
                      />
                      <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-[#737686]" />
                    </div>
                    {errors.dailyLimit && <ErrorMsg>{errors.dailyLimit.message}</ErrorMsg>}
                  </div>
                  <div className="flex flex-col gap-[8px]">
                    <Label>Random Delay (sec)</Label>
                    <div className="relative">
                      <input
                        {...register("randomDelayMin", { valueAsNumber: true })}
                        type="number"
                        className="w-full px-[16px] py-[8px] rounded-lg border border-[#c3c6d7] focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6] outline-none transition-all pl-10"
                      />
                      <Clock2 className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-[#737686]" />
                    </div>
                    {errors.randomDelayMin && <ErrorMsg>{errors.randomDelayMin.message}</ErrorMsg>}
                  </div>
                  <div className="col-span-2 flex flex-col gap-[8px]">
                    <Label>Sending Hours</Label>
                    <div className="flex items-center gap-[16px]">
                      <input
                        {...register("hoursFrom")}
                        type="time"
                        className="flex-1 px-[16px] py-[8px] rounded-lg border border-[#c3c6d7] focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6] outline-none transition-all"
                      />
                      <span className="text-[#737686]">to</span>
                      <input
                        {...register("hoursTo")}
                        type="time"
                        className="flex-1 px-[16px] py-[8px] rounded-lg border border-[#c3c6d7] focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6] outline-none transition-all"
                      />
                    </div>
                    {(errors.hoursFrom ?? errors.hoursTo) && (
                      <ErrorMsg>{errors.hoursFrom?.message ?? errors.hoursTo?.message}</ErrorMsg>
                    )}
                  </div>
                </div>
                <div className="bg-white border border-[#c3c6d7] p-[24px] rounded-xl flex flex-col gap-[16px]">
                  <Label>Select SMTP Account</Label>
                  <select
                    {...register("smtpAccountId")}
                    className="w-full px-[16px] py-[8px] rounded-lg border border-[#c3c6d7] focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6] outline-none transition-all bg-white"
                  >
                    <option value="">-- Select SMTP Account --</option>
                    {smtpAccounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>{acc.fromEmail} ({acc.name})</option>
                    ))}
                  </select>
                  {errors.smtpAccountId && <ErrorMsg>{errors.smtpAccountId.message}</ErrorMsg>}
                </div>
              </div>
              <div className="lg:col-span-5 bg-[#f3f3fe]/50 border border-[#c3c6d7]/50 p-[24px] rounded-xl flex flex-col gap-[24px]">
                <h3 className="text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#434655] border-b border-[#c3c6d7] pb-[8px]">Automation Rules</h3>
                <ToggleRow label="Follow-up Enabled" desc="Automated sequence logic" checked={followUpEnabled} onChange={setFollowUpEnabled} />
                <ToggleRow label="Stop on Reply" desc="Halt sequence if contact responds" checked={stopOnReply} onChange={setStopOnReply} />
                <ToggleRow label="Stop on Bounce" desc="Maintain domain reputation" checked={stopOnBounce} onChange={setStopOnBounce} />
              </div>
            </div>
            <div className="flex justify-between items-center pt-[24px]">
              <button
                type="button"
                onClick={() => goToStep(1)}
                className="px-[24px] py-[16px] text-[#434655] font-bold hover:bg-[#e7e7f3] rounded-lg transition-all flex items-center gap-[8px]"
              >
                <ArrowLeft className="size-5" />
                Back
              </button>
              <button
                type="button"
                onClick={() => goToStep(3)}
                className="px-[24px] py-[16px] bg-[#004ac6] text-white rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all flex items-center gap-[8px]"
              >
                Next: Lead Selection
                <ArrowRight className="size-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Lead Source Selection */}
        {currentStep === 3 && (
          <div className="w-full flex flex-col gap-[24px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
              {/* Connect AI Job */}
              <div
                className={`group relative bg-white border-2 p-[48px] rounded-xl cursor-pointer hover:border-[#004ac6]/40 transition-all flex flex-col items-center text-center gap-[16px] ${
                  leadSource === "job" ? "border-[#004ac6] bg-[#004ac6]/5" : "border-[#c3c6d7]"
                }`}
                onClick={() => handleLeadSource("job")}
              >
                <div className="w-16 h-16 rounded-full bg-[#dbe1ff] flex items-center justify-center text-[#004ac6] group-hover:scale-110 transition-transform">
                  <Bolt className="size-8" strokeWidth={1.5} />
                </div>
                <h3 className="text-[24px] leading-[32px] font-semibold tracking-[-0.01em]">Connect AI Job</h3>
                <p className="text-[14px] leading-[20px] text-[#434655]">Automatically sync leads from an active generation job in your workspace.</p>
                <div className={`w-full mt-[24px] transition-all ${leadSource === "job" ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                  <select
                    value={generationJobId}
                    onChange={(e) => setGenerationJobId(e.target.value)}
                    className="w-full px-[16px] py-[8px] rounded-lg border border-[#c3c6d7] focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6] outline-none bg-white"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="">-- Select Generation Job --</option>
                    {completedJobs.length === 0 && <option value="" disabled>No completed generation jobs available</option>}
                    {completedJobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.name} ({job.status}) — {job.totalLeads} leads
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* CSV / Manual List */}
              <div
                className={`group relative bg-white border-2 p-[48px] rounded-xl cursor-pointer hover:border-[#004ac6]/40 transition-all flex flex-col items-center text-center gap-[16px] ${
                  leadSource === "manual" ? "border-[#004ac6] bg-[#004ac6]/5" : "border-[#c3c6d7]"
                }`}
                onClick={() => handleLeadSource("manual")}
              >
                <div className="w-16 h-16 rounded-full bg-[#99efe5]/20 flex items-center justify-center text-[#006a63] group-hover:scale-110 transition-transform">
                  <Upload className="size-8" strokeWidth={1.5} />
                </div>
                <h3 className="text-[24px] leading-[32px] font-semibold tracking-[-0.01em]">CSV / Manual List</h3>
                <p className="text-[14px] leading-[20px] text-[#434655]">Upload a custom CSV file with email addresses and email content.</p>
                <div className={`w-full mt-[24px] transition-all ${leadSource === "manual" ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                  <div
                    className="border-2 border-dashed border-[#c3c6d7] rounded-lg p-[16px] bg-[#f3f3fe] hover:bg-[#e7e7f3] transition-colors cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  >
                    {csvFileName ? (
                      <div className="flex items-center justify-center gap-[8px]">
                        <Check className="size-5 text-[#006a63]" />
                        <p className="text-[12px] leading-[16px] font-bold text-[#006a63]">{csvFileName} ({parsedRows.length} rows)</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-[12px] leading-[16px] font-bold text-[#434655]">Drop CSV here or click to browse</p>
                        <p className="text-[10px] text-[#737686] mt-[4px]">Required column: email. Optional: subject, greeting, body, signature</p>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={handleCsvFile}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center pt-[24px] mt-[24px]">
              <button
                type="button"
                onClick={() => goToStep(2)}
                className="px-[24px] py-[16px] text-[#434655] font-bold hover:bg-[#e7e7f3] rounded-lg transition-all flex items-center gap-[8px]"
              >
                <ArrowLeft className="size-5" />
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !leadSource}
                className="px-[48px] py-[16px] bg-[#004ac6] text-white rounded-lg font-bold hover:shadow-lg active:scale-95 transition-all flex items-center gap-[8px] disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <><Loader2 className="size-5 animate-spin" /> Launching...</>
                ) : (
                  <><Rocket className="size-5" fill="currentColor" /> Create Campaign</>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

function StepNode({ num, label, current }: { num: number; label: string; current: number }) {
  const isPast = num < current;
  const isActive = num === current;
  const circleClass = isPast || isActive ? "bg-[#004ac6] text-white" : "bg-[#e1e2ed] text-[#434655]";
  const labelClass = isPast || isActive ? "text-[#004ac6]" : "text-[#434655]";
  return (
    <div className="flex flex-col items-center gap-[4px]">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${circleClass}`}>
        {isPast ? <Check className="size-5" /> : num}
      </div>
      <span className={`text-[14px] leading-[20px] font-semibold tracking-[0.05em] ${labelClass}`}>{label}</span>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={`text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#434655] ${className ?? ""}`}>{children}</label>;
}

function ErrorMsg({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] leading-[16px] text-[#ba1a1a]">{children}</p>;
}

function ToggleRow({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-bold text-[14px] leading-[20px]">{label}</p>
        <p className="text-[12px] leading-[16px] text-[#434655]">{desc}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <div className="w-11 h-6 bg-[#c3c6d7] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#004ac6]" />
      </label>
    </div>
  );
}
