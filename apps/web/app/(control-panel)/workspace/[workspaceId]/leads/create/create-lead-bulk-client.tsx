"use client";

import Link from "next/link";
import { useState, useRef, useCallback } from "react";
import { ArrowLeft, Upload, FileText, AlertTriangle, CheckCircle, RefreshCw, Trash2, Plus, ChevronLeft, Database, Table, X, Download } from "lucide-react";
import { useNotification } from "@repo/ui/notification-provider";
import { bulkCreateLeads } from "../../../../../src/actions/workspace/bulk-create-leads";
import type { GenerationJobInfo } from "../../../../../src/actions/workspace/workspace-info";

type Props = {
  workspaceId: string;
  jobs: GenerationJobInfo[];
};

type ParsedRow = Record<string, string>;

type ColumnMap = {
  csvCol: string;
  targetField: string;
};

const TARGET_FIELDS = [
  { value: "email", label: "Email (Required)", required: true },
  { value: "name", label: "First Name", required: false },
  { value: "lastName", label: "Last Name", required: false },
  { value: "companyName", label: "Company Name", required: false },
  { value: "jobTitle", label: "Job Title", required: false },
  { value: "linkedinUrl", label: "LinkedIn URL", required: false },
  { value: "purpose", label: "Purpose (Required)", required: true },
  { value: "city", label: "City", required: false },
  { value: "phone", label: "Phone", required: false },
  { value: "_ignore", label: "Ignore Column", required: false },
];

const REQUIRED_FIELDS = ["email", "purpose"];

function detectDelimiter(firstLine: string): string {
  const comma = (firstLine.match(/,/g) || []).length;
  const tab = (firstLine.match(/\t/g) || []).length;
  const semicolon = (firstLine.match(/;/g) || []).length;
  if (tab > comma && tab > semicolon) return "\t";
  if (semicolon > comma && semicolon > tab) return ";";
  return ",";
}

function parseCSV(text: string): { headers: string[]; rows: ParsedRow[] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return { headers: [], rows: [] };
  const delimiter = detectDelimiter(lines[0]!);
  const headers = lines[0]!.split(delimiter).map((h) => h.trim().replace(/^["']|["']$/g, ""));
  const rows: ParsedRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i]!.split(delimiter).map((v) => v.trim().replace(/^["']|["']$/g, ""));
    if (vals.length === 1 && !vals[0]) continue;
    const row: ParsedRow = {};
    headers.forEach((h, idx) => {
      row[h] = vals[idx] ?? "";
    });
    rows.push(row);
  }
  return { headers, rows };
}

function autoMapColumns(headers: string[]): ColumnMap[] {
  return headers.map((h) => {
    const hl = h.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (/email/.test(hl) || /e\s*mail/.test(hl)) return { csvCol: h, targetField: "email" };
    if (/first.?name|given.?name|fname/.test(hl)) return { csvCol: h, targetField: "name" };
    if (/last.?name|family.?name|lname|surname/.test(hl)) return { csvCol: h, targetField: "lastName" };
    if (/company|org|organization|firm/.test(hl)) return { csvCol: h, targetField: "companyName" };
    if (/job.?title|title|position|role/.test(hl)) return { csvCol: h, targetField: "jobTitle" };
    if (/linkedin|li|social/.test(hl)) return { csvCol: h, targetField: "linkedinUrl" };
    if (/purpose|reason|goal|objective/.test(hl)) return { csvCol: h, targetField: "purpose" };
    if (/city|location|town|place/.test(hl)) return { csvCol: h, targetField: "city" };
    if (/phone|mobile|tel|contact/.test(hl)) return { csvCol: h, targetField: "phone" };
    return { csvCol: h, targetField: h };
  });
}

function validateRow(row: Record<string, string>, maps: ColumnMap[]): string[] {
  const errors: string[] = [];
  const mapped: Record<string, string> = {};
  maps.forEach((m) => {
    if (m.targetField !== "_ignore") mapped[m.targetField] = row[m.csvCol] ?? "";
  });
  if (!mapped.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mapped.email)) errors.push("email");
  if (!mapped.purpose) errors.push("purpose");
  const hasName = !!mapped.name?.trim();
  const hasCompany = !!mapped.companyName?.trim();
  if (!hasName && !hasCompany) errors.push("nameOrCompany");
  return errors;
}

export function CreateLeadBulkClient({ workspaceId, jobs: initialJobs }: Props) {
  const { notify } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<"upload" | "review">("upload");
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<ParsedRow[]>([]);
  const [columnMaps, setColumnMaps] = useState<ColumnMap[]>([]);
  const [rowErrors, setRowErrors] = useState<Record<number, string[]>>({});
  const [editingRows, setEditingRows] = useState<Record<number, Record<string, string>>>({});
  const [availableJobs, setAvailableJobs] = useState(initialJobs);
  const [generationJobId, setGenerationJobId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const displayRows = step === "review" && rawRows.length > 0
    ? rawRows.map((row, i) => editingRows[i] ?? { ...row })
    : rawRows;

  function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const file = files[0]!;
    if (!file.name.endsWith(".csv") && !file.name.endsWith(".json")) {
      notify({ title: "Invalid File", message: "Please upload a CSV or JSON file.", tone: "error" });
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (file.name.endsWith(".json")) {
        try {
          const data = JSON.parse(text);
          const arr = Array.isArray(data) ? data : data.leads ?? data.rows ?? [];
          if (!arr.length) {
            notify({ title: "Empty File", message: "No leads found in JSON.", tone: "error" });
            return;
          }
          const hdrs = Object.keys(arr[0]!);
          setHeaders(hdrs);
          setRawRows(arr.map((r: Record<string, unknown>) => {
            const row: ParsedRow = {};
            hdrs.forEach((h) => { row[h] = String(r[h] ?? ""); });
            return row;
          }));
        } catch {
          notify({ title: "Parse Error", message: "Invalid JSON file.", tone: "error" });
          return;
        }
      } else {
        const parsed = parseCSV(text);
        if (!parsed.headers.length || !parsed.rows.length) {
          notify({ title: "Empty File", message: "No data found in CSV.", tone: "error" });
          return;
        }
        setHeaders(parsed.headers);
        setRawRows(parsed.rows);
      }
    };
    reader.readAsText(file);
  }

  const [fillColumn, setFillColumn] = useState<string | null>(null);
  const [fillValue, setFillValue] = useState("");

  function onParseComplete() {
    let maps = autoMapColumns(headers);
    let finalHeaders = headers;
    let finalRows = rawRows;

    if (!maps.some((m) => m.targetField === "email")) {
      finalHeaders = [...finalHeaders, "email"];
      finalRows = finalRows.map((r) => ({ ...r, email: "" }));
      maps = [...maps, { csvCol: "email", targetField: "email" }];
    }
    if (!maps.some((m) => m.targetField === "purpose")) {
      finalHeaders = [...finalHeaders, "purpose"];
      finalRows = finalRows.map((r) => ({ ...r, purpose: "" }));
      maps = [...maps, { csvCol: "purpose", targetField: "purpose" }];
    }

    setHeaders(finalHeaders);
    setRawRows(finalRows);
    setColumnMaps(maps);
    setEditingRows({});
    setRowErrors({});
    setStep("review");
  }

  const updateColumnMap = useCallback((headerIdx: number, targetField: string) => {
    setColumnMaps((prev) => {
      const next = [...prev];
      next[headerIdx] = { ...next[headerIdx]!, targetField };
      return next;
    });
  }, []);

  const updateCell = useCallback((rowIdx: number, colHeader: string, value: string) => {
    setEditingRows((prev) => {
      const row = prev[rowIdx] ?? { ...rawRows[rowIdx] };
      return { ...prev, [rowIdx]: { ...row, [colHeader]: value } };
    });
  }, [rawRows]);

  const removeRow = useCallback((rowIdx: number) => {
    setRawRows((prev) => prev.filter((_, i) => i !== rowIdx));
    setEditingRows((prev) => {
      const next = { ...prev };
      delete next[rowIdx];
      return next;
    });
  }, []);

  const addRow = useCallback(() => {
    const newRow: ParsedRow = {};
    headers.forEach((h) => { newRow[h] = ""; });
    setRawRows((prev) => [...prev, newRow]);
  }, [headers]);

  function validateAll(): boolean {
    if (errorCount > 0) {
      notify({ title: "Validation Errors", message: "Fix highlighted cells before uploading.", tone: "error" });
      return false;
    }
    return true;
  }

  async function handleBulkSubmit() {
    if (!generationJobId) {
      notify({ title: "Validation Error", message: "Please select a generation job.", tone: "error" });
      return;
    }
    if (!validateAll()) return;

    setSubmitting(true);
    const leads = displayRows.map((row) => {
      const mapped: Record<string, string> = {};
      columnMaps.forEach((m) => {
        if (m.targetField !== "_ignore") mapped[m.targetField] = row[m.csvCol] ?? "";
      });
      return {
        email: mapped.email ?? "",
        metadata: {
          name: mapped.name ?? "",
          lastName: mapped.lastName ?? "",
          companyName: mapped.companyName ?? "",
          jobTitle: mapped.jobTitle ?? "",
          linkedinUrl: mapped.linkedinUrl ?? "",
          purpose: mapped.purpose ?? "",
          city: mapped.city ?? "",
          phone: mapped.phone ?? "",
          ...Object.fromEntries(
            columnMaps
              .filter((m) => !TARGET_FIELDS.some((t) => t.value === m.targetField) && m.targetField !== "_ignore")
              .map((m) => [m.targetField, row[m.csvCol] ?? ""]),
          ),
        },
      };
    });

    const result = await bulkCreateLeads(workspaceId, generationJobId, leads);
    setSubmitting(false);

    if (result.status === "error") {
      notify({ title: "Upload Failed", message: result.message, tone: "error" });
    } else {
      setSuccess(true);
      setSuccessCount(result.count);
      setAvailableJobs((prev) => prev.filter((j) => j.id !== generationJobId));
      notify({ title: "Bulk Upload Complete", message: `${result.count} leads created successfully.`, tone: "success" });
    }
  }

  const totalRows = displayRows.length;
  const hasEmailMap = columnMaps.some((m) => m.targetField === "email");
  const hasPurposeMap = columnMaps.some((m) => m.targetField === "purpose");

  const liveRowErrors: Record<number, string[]> = {};
  displayRows.forEach((row, i) => {
    const e = validateRow(row, columnMaps);
    if (e.length) liveRowErrors[i] = e;
  });
  const errorCount = Object.keys(liveRowErrors).length;
  const mappedCount = columnMaps.filter((m) => m.targetField !== "_ignore").length;

  if (success) {
    return (
      <div className="min-h-0 flex-1 flex items-center justify-center">
        <div className="text-center space-y-[24px]">
          <div className="mx-auto w-[64px] h-[64px] rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="size-[32px] text-green-600" />
          </div>
          <h2 className="text-[24px] leading-[32px] font-bold text-[#191b23]">Upload Complete</h2>
          <p className="text-[16px] leading-[24px] text-[#434655]">{successCount} leads created successfully.</p>
          <div className="flex gap-[16px] justify-center">
            <button
              onClick={() => { setSuccess(false); setStep("upload"); setRawRows([]); setHeaders([]); setFileName(""); setGenerationJobId(""); setEditingRows({}); setRowErrors({}); }}
              className="rounded-lg bg-[#004ac6] px-[32px] py-[12px] text-[14px] font-semibold text-white hover:bg-[#003ea8] transition-all"
            >
              Upload Another
            </button>
            <Link
              href={`/workspace/${workspaceId}/leads`}
              className="rounded-lg border border-[#c3c6d7] px-[32px] py-[12px] text-[14px] font-semibold text-[#434655] hover:bg-[#ededf9] transition-all"
            >
              Back to Leads
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <div className="fixed inset-0 opacity-20 pointer-events-none -z-10"
        style={{ backgroundImage: "radial-gradient(#d1d5db 0.5px, transparent 0.5px)", backgroundSize: "24px 24px" }}
      />
      <main className="flex flex-grow items-center justify-center px-[32px] py-[48px]">
        <div className="w-full max-w-5xl">
          {step === "upload" ? (
            <>
              <header className="mb-[24px] text-center">
                <h1 className="text-[36px] leading-[44px] font-bold tracking-[-0.01em] text-[#191b23] mb-[8px]">Manual Bulk Upload</h1>
                <p className="text-[16px] leading-[24px] text-[#434655]">Upload a CSV or JSON file to add multiple leads at once.</p>
              </header>

              <div className="rounded-xl border border-[#c3c6d7] bg-white/95 p-[32px] shadow-sm backdrop-blur-[8px] md:p-[48px]">
                <div
                  className={`border-2 border-dashed rounded-xl p-[48px] text-center cursor-pointer transition-all duration-200 ${dragOver ? "border-[#004ac6] bg-[#f3f3fe]" : "border-[#c3c6d7] hover:border-[#004ac6] hover:bg-[#f3f3fe]"}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.json"
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                  <div className="flex flex-col items-center gap-[16px]">
                    <div className="w-[64px] h-[64px] rounded-full bg-[#dbe1ff] flex items-center justify-center">
                      <Upload className="size-[32px] text-[#004ac6]" />
                    </div>
                    <div>
                      <p className="text-[24px] leading-[32px] font-semibold text-[#191b23]">Drag and drop your file here</p>
                      <p className="text-[16px] leading-[24px] text-[#434655] mt-[4px]">or <span className="text-[#004ac6] font-semibold">browse files</span> from your computer</p>
                    </div>
                    <div className="flex gap-[8px] mt-[16px]">
                      <span className="px-[16px] py-[4px] bg-[#ededf9] rounded-full text-[12px] leading-[16px] font-medium text-[#434655]">CSV</span>
                      <span className="px-[16px] py-[4px] bg-[#ededf9] rounded-full text-[12px] leading-[16px] font-medium text-[#434655]">JSON</span>
                    </div>
                  </div>
                </div>

                {fileName && (
                  <div className="mt-[16px] p-[16px] bg-[#f3f3fe] rounded-lg border border-[#c3c6d7] flex items-center justify-between">
                    <div className="flex items-center gap-[16px]">
                      <FileText className="size-5 text-[#004ac6]" />
                      <span className="text-[14px] leading-[20px] font-semibold text-[#191b23]">{fileName}</span>
                      <span className="text-[12px] leading-[16px] text-[#737686]">({rawRows.length} rows detected)</span>
                    </div>
                    <button onClick={() => { setFileName(""); setRawRows([]); setHeaders([]); }} className="text-[#737686] hover:text-[#ba1a1a] transition-colors">
                      <X className="size-5" />
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-end gap-[16px] pt-[24px] mt-[24px] border-t border-[#c3c6d7]">
                  <Link
                    href={`/workspace/${workspaceId}/leads`}
                    className="px-[32px] py-[12px] rounded-lg text-[14px] leading-[20px] font-semibold text-[#434655] hover:bg-[#ededf9] transition-all"
                  >
                    Cancel
                  </Link>
                  <button
                    onClick={onParseComplete}
                    disabled={!rawRows.length}
                    className="flex items-center gap-[8px] px-[32px] py-[12px] rounded-lg text-[14px] leading-[20px] font-semibold bg-[#004ac6] text-white hover:bg-[#003ea8] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Table className="size-[18px]" /> Review & Map Leads
                  </button>
                </div>
              </div>

              <div className="mt-[16px] p-[16px] bg-[#f3f3fe] border border-[#c3c6d7] rounded-xl flex gap-[12px]">
                <AlertTriangle className="size-5 text-[#004ac6] shrink-0 mt-[2px]" />
                <p className="text-[14px] leading-[20px] text-[#434655]">
                  <span className="font-semibold text-[#191b23]">Pro Tip:</span> Unknown columns auto-map as custom fields. You can rename or ignore any column on the next screen. Email and Purpose are required.
                </p>
              </div>
            </>
          ) : (
            <>
              <header className="mb-[24px]">
                <div className="flex items-center gap-[12px]">
                  <button onClick={() => setStep("upload")} className="p-[8px] hover:bg-[#ededf9] rounded-lg transition-colors flex items-center gap-[8px] text-[14px] leading-[20px] font-semibold text-[#434655]">
                    <ChevronLeft className="size-[18px]" />
                    Back to Upload
                  </button>
                  <div className="h-[24px] w-[1px] bg-[#c3c6d7]" />
                  <h1 className="text-[24px] leading-[32px] font-bold tracking-[-0.01em] text-[#191b23]">Review & Map Leads</h1>
                  {!!headers.length && (
                    <span className="ml-auto text-[12px] leading-[16px] text-[#737686]">
                      {headers.length} columns · {totalRows} rows
                    </span>
                  )}
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px] mb-[24px]">
                <div className="bg-white border border-[#c3c6d7] p-[16px] rounded-xl flex items-center gap-[16px]">
                  <div className="w-[48px] h-[48px] rounded-full bg-[#dbe1ff] flex items-center justify-center text-[#004ac6]">
                    <Database className="size-6" />
                  </div>
                  <div>
                    <p className="text-[12px] leading-[16px] font-medium text-[#434655]">Total Rows Detected</p>
                    <p className="text-[24px] leading-[32px] font-bold text-[#191b23]">{totalRows}</p>
                  </div>
                </div>
                <div className="bg-white border border-[#c3c6d7] p-[16px] rounded-xl flex items-center gap-[16px]">
                  <div className="w-[48px] h-[48px] rounded-full bg-[#9cf2e8] flex items-center justify-center text-[#006a63]">
                    <Table className="size-6" />
                  </div>
                  <div>
                    <p className="text-[12px] leading-[16px] font-medium text-[#434655]">Mapped Columns</p>
                    <p className="text-[24px] leading-[32px] font-bold text-[#191b23]">{mappedCount} / {headers.length}</p>
                  </div>
                </div>
                <div className={`${errorCount ? "bg-[#ffdad6] border border-[#ba1a1a]/20" : "bg-white border border-[#c3c6d7]"} p-[16px] rounded-xl flex items-center gap-[16px]`}>
                  <div className={`w-[48px] h-[48px] rounded-full ${errorCount ? "bg-white" : "bg-[#dbe1ff]"} flex items-center justify-center ${errorCount ? "text-[#ba1a1a]" : "text-[#004ac6]"}`}>
                    <AlertTriangle className="size-6" />
                  </div>
                  <div>
                    <p className="text-[12px] leading-[16px] font-medium text-[#434655]">Validation Errors</p>
                    <p className={`text-[24px] leading-[32px] font-bold ${errorCount ? "text-[#ba1a1a]" : "text-[#191b23]"}`}>{errorCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#c3c6d7] rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#737686 transparent" }}>
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-[#ededf9]">
                        <th className="p-[12px] border-b border-[#c3c6d7] sticky left-0 z-20 bg-[#ededf9] min-w-[60px] text-center text-[12px] leading-[16px] font-medium text-[#434655] uppercase tracking-wider">#</th>
                        {headers.map((h, idx) => (
                          <th key={idx} className="p-[12px] border-b border-r border-[#c3c6d7] min-w-[200px]">
                            <div className="space-y-[4px]">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] leading-[14px] text-[#737686] uppercase tracking-wider">CSV Column: {h}</span>
                                <button
                                  type="button"
                                  onClick={() => setFillColumn(fillColumn === h ? null : h)}
                                  className="text-[10px] font-semibold text-[#004ac6] hover:underline leading-[14px]"
                                >
                                  {fillColumn === h ? "Cancel" : "Fill"}
                                </button>
                              </div>
                              <input
                                value={columnMaps[idx]?.targetField ?? "_ignore"}
                                onChange={(e) => updateColumnMap(idx, e.target.value)}
                                list={`col-map-${idx}`}
                                className="w-full bg-white border border-[#c3c6d7] rounded-lg text-[12px] leading-[16px] font-medium px-[8px] py-[4px] focus:ring-2 focus:ring-[#004ac6] focus:border-[#004ac6] outline-none"
                              />
                              <datalist id={`col-map-${idx}`}>
                                {TARGET_FIELDS.map((f) => (
                                  <option key={f.value} value={f.value}>{f.label}</option>
                                ))}
                              </datalist>
                              {fillColumn === h && (
                                <div className="flex gap-[4px] items-center pt-[4px]">
                                  <input
                                    value={fillValue}
                                    onChange={(e) => setFillValue(e.target.value)}
                                    placeholder="Value for all rows"
                                    autoFocus
                                    className="flex-1 border border-[#c3c6d7] rounded text-[11px] px-[6px] py-[2px] outline-none focus:border-[#004ac6]"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!fillValue) return;
                                      setRawRows((prev) => prev.map((r) => ({ ...r, [h]: fillValue })));
                                      setFillColumn(null);
                                      setFillValue("");
                                    }}
                                    className="text-[11px] font-semibold text-[#004ac6] hover:underline shrink-0"
                                  >
                                    Apply
                                  </button>
                                </div>
                              )}
                            </div>
                          </th>
                        ))}
                        <th className="p-[12px] border-b border-[#c3c6d7] text-center text-[12px] leading-[16px] font-medium text-[#434655]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#c3c6d7]">
                      {displayRows.map((row, rowIdx) => {
                        const errors = liveRowErrors[rowIdx] ?? [];
                        return (
                          <tr key={rowIdx} className={`${errors.length ? "bg-[#fff1f0]" : "hover:bg-[#f3f3fe]"} transition-colors group`}>
                            <td className="p-[12px] sticky left-0 z-10 bg-inherit text-center text-[14px] leading-[20px] text-[#434655]">{rowIdx + 1}</td>
                            {headers.map((h, colIdx) => {
                              const targetField = columnMaps[colIdx]?.targetField ?? "_ignore";
                              const isError = errors.includes("email") && targetField === "email"
                                || errors.includes("purpose") && targetField === "purpose"
                                || errors.includes("nameOrCompany") && (targetField === "name" || targetField === "companyName" || targetField === "lastName");
                              const isMissingRequired = (targetField === "email" || targetField === "purpose") && !row[h];
                              const isNameCompanyMissing = (targetField === "name" || targetField === "companyName") && errors.includes("nameOrCompany");
                              const isLinkedin = targetField === "linkedinUrl";
                              const missingLabel = targetField === "email" ? "email" : targetField === "purpose" ? "purpose" : "";
                              return (
                                <td key={colIdx} className={`p-[12px] border-r border-[#c3c6d7] ${isLinkedin ? "text-[#004ac6]" : ""}`}>
                                  <div className="flex items-center gap-[8px]">
                                    {(isMissingRequired || isNameCompanyMissing) && (
                                      <AlertTriangle className="size-4 text-[#ba1a1a] shrink-0" />
                                    )}
                                    <input
                                      value={row[h] ?? ""}
                                      onChange={(e) => updateCell(rowIdx, h, e.target.value)}
                                      className={`w-full bg-transparent border-none p-0 focus:ring-0 text-[14px] leading-[20px] outline-none ${isError ? "text-[#ba1a1a] placeholder-[#ba1a1a]/60" : isLinkedin ? "text-[#004ac6]" : "text-[#191b23]"}`}
                                      placeholder={isMissingRequired ? `Missing ${missingLabel}` : ""}
                                    />
                                  </div>
                                </td>
                              );
                            })}
                            <td className="p-[12px] text-center">
                              <button
                                onClick={() => removeRow(rowIdx)}
                                className="text-[#737686] hover:text-[#ba1a1a] transition-colors"
                              >
                                <Trash2 className="size-[18px]" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="bg-[#ededf9] p-[12px] border-t border-[#c3c6d7] flex items-center justify-between">
                  <p className="text-[12px] leading-[16px] text-[#434655]">Showing 1-{totalRows} of {totalRows} entries</p>
                  <button
                    onClick={addRow}
                    className="flex items-center gap-[8px] text-[12px] leading-[16px] font-semibold text-[#004ac6] hover:underline"
                  >
                    <Plus className="size-[14px]" /> Add Row
                  </button>
                </div>
              </div>

              <div className="mt-[16px]">
                <div className="space-y-[8px] mb-[16px]">
                  <label className="flex items-center gap-[8px] text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-[#191b23]" htmlFor="bulkGenerationJob">
                    Target Generation Job <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <select
                    id="bulkGenerationJob"
                    value={generationJobId}
                    onChange={(e) => setGenerationJobId(e.target.value)}
                    required
                    className="w-full rounded-lg border border-[#c3c6d7] bg-white px-[16px] py-[16px] text-[16px] leading-[24px] outline-none transition-all focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]"
                  >
                    <option value="">Select a generation job...</option>
                    {availableJobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.name} ({job.totalLeads} leads)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-[12px] p-[12px] bg-[#f3f3fe] rounded-xl border border-[#c3c6d7]/50">
                <AlertTriangle className="size-5 text-[#004ac6] shrink-0" />
                <p className="text-[14px] leading-[20px] text-[#434655]">
                  <span className="font-bold text-[#191b23]">Tip:</span> Ensure the <span className="font-bold">Email</span> column is correctly mapped. ColdReach AI will use this as the primary identifier. Fields with red backgrounds must be corrected before upload.
                </p>
              </div>

              <div className="flex items-center justify-end gap-[16px] pt-[24px]">
                <div className="flex-1 flex flex-wrap gap-[8px]">
                  {!generationJobId && (
                    <span className="text-[12px] leading-[16px] font-medium text-[#ba1a1a]">Select a generation job</span>
                  )}
                  {!hasEmailMap && (
                    <span className="text-[12px] leading-[16px] font-medium text-[#ba1a1a]">Map an Email column</span>
                  )}
                  {!hasPurposeMap && (
                    <span className="text-[12px] leading-[16px] font-medium text-[#ba1a1a]">Map a Purpose column</span>
                  )}
                  {errorCount > 0 && (
                    <span className="text-[12px] leading-[16px] font-medium text-[#ba1a1a]">{errorCount} row(s) with errors — fix highlighted cells</span>
                  )}
                </div>
                <button
                  onClick={handleBulkSubmit}
                  disabled={submitting || !generationJobId || !hasEmailMap || !hasPurposeMap || errorCount > 0}
                  className="flex items-center gap-[8px] rounded-lg bg-[#004ac6] px-[32px] py-[14px] text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-white shadow-sm hover:bg-[#003ea8] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <><RefreshCw className="size-5 animate-spin" /> Uploading...</>
                  ) : (
                    <><Upload className="size-5" /> Start Upload ({totalRows} Leads)</>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
