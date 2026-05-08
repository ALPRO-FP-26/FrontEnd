'use client';

import { useState, useRef, useCallback, useEffect } from "react";
import {
  FileUp, PenLine, FileText, X, CheckCircle, Loader2,
  FlaskConical, Pencil, Trash2, ClipboardList, FilePlus2,
  ChevronDown, ChevronUp, AlertTriangle,
} from "lucide-react";
import Button from "@/components/button";
import { HealthRecord, EMPTY_RECORD, getStatus } from "@/lib/healthRecord";
import {
  uploadDocument,
  getDocuments,
  confirmDocument,
  createManualDocument,
  deleteDocument as apiDeleteDocument,
} from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "add" | "records";
type InputMethod = "pdf" | "manual";
type OcrState = "idle" | "processing" | "done";
type ModalState =
  | { type: "none" }
  | { type: "edit"; record: HealthRecord }
  | { type: "delete"; id: string; name: string };

// ─── Markers for status chips ─────────────────────────────────────────────────

const MARKERS: [string, keyof HealthRecord, number, number, string][] = [
  ["Glucose (F)", "glucoseFasting", 70, 99, "mg/dL"],
  ["HbA1c", "hba1c", 0, 5.7, "%"],
  ["Chol", "cholTotal", 0, 200, "mg/dL"],
  ["LDL", "cholLDL", 0, 100, "mg/dL"],
  ["HDL", "cholHDL", 40, 999, "mg/dL"],
  ["Trig", "triglycerides", 0, 150, "mg/dL"],
  ["Uric Acid", "uricAcid", 3.5, 7.2, "mg/dL"],
];

const chipClass: Record<string, string> = {
  ok: "border-green-400/60  bg-green-50   text-green-700",
  warn: "border-amber-400/60  bg-amber-50   text-amber-700",
  bad: "border-red-400/60    bg-red-50     text-red-600",
};
const chipIcon: Record<string, string> = { ok: "✓", warn: "!", bad: "✕" };

// ─── Small re-usable pieces ───────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="h-px flex-1 bg-foreground/10" />
      <span className="text-[10px] font-mono font-semibold text-foreground/40 uppercase tracking-widest whitespace-nowrap">
        {children}
      </span>
      <div className="h-px flex-1 bg-foreground/10" />
    </div>
  );
}

function FieldInput({
  label, value, type = "text", placeholder, unit, hint, autofilled, onChange,
}: {
  label: string; value: string; type?: string; placeholder?: string;
  unit?: string; hint?: string; autofilled?: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-mono font-semibold text-foreground/50 uppercase tracking-widest">
        {label}
      </label>
      <div className={`relative flex items-center squircle border transition-all duration-200 ${autofilled
        ? "border-green-400 bg-green-50/50"
        : "border-foreground/15 bg-background focus-within:border-richcerulean"
        }`}>
        <input
          type={type}
          step={type === "number" ? "any" : undefined}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-foreground/25"
        />
        {autofilled && (
          <span className="shrink-0 pr-3 text-[10px] font-mono text-green-600 font-semibold">
            OCR ✓
          </span>
        )}
      </div>
      {(unit || hint) && (
        <span className="text-[10px] font-mono text-foreground/35">
          {unit}{hint && ` · ${hint}`}
        </span>
      )}
    </div>
  );
}

// ─── Health Form ──────────────────────────────────────────────────────────────

function HealthForm({
  values,
  autofilled,
  onChange,
}: {
  values: Omit<HealthRecord, "id" | "createdAt">;
  autofilled: Set<string>;
  onChange: (field: keyof typeof EMPTY_RECORD, value: string) => void;
}) {
  const af = (k: string) => autofilled.has(k);
  const f = (
    key: keyof typeof EMPTY_RECORD,
    label: string,
    type = "text",
    placeholder = "",
    unit?: string,
    hint?: string,
  ) => (
    <FieldInput
      key={key}
      label={label}
      type={type}
      placeholder={placeholder}
      unit={unit}
      hint={hint}
      value={values[key]}
      autofilled={af(key)}
      onChange={v => onChange(key, v)}
    />
  );

  return (
    <div className="flex flex-col gap-4">
      <SectionLabel>Patient Info</SectionLabel>
      <div className="grid grid-cols-2 gap-3">
        {f("reportDate", "Report Date", "date")}
        {f("lab", "Lab / Source", "text", "e.g. Prodia, Kimia Farma")}
        {f("patientName", "Patient Name", "text", "Full name")}
        {f("dob", "Date of Birth", "date")}
      </div>

      <SectionLabel>Blood Sugar</SectionLabel>
      <div className="grid grid-cols-2 gap-3">
        {f("glucoseFasting", "Fasting Glucose", "number", "70–99", "mg/dL", "Normal: 70–99")}
        {f("glucosePostmeal", "Post-meal Glucose (2h)", "number", "< 140", "mg/dL", "Normal: < 140")}
        {f("hba1c", "HbA1c", "number", "< 5.7", "%", "Normal: < 5.7")}
      </div>

      <SectionLabel>Cholesterol Panel</SectionLabel>
      <div className="grid grid-cols-2 gap-3">
        {f("cholTotal", "Total Cholesterol", "number", "< 200", "mg/dL", "Normal: < 200")}
        {f("cholLDL", "LDL Cholesterol", "number", "< 100", "mg/dL", "Normal: < 100")}
        {f("cholHDL", "HDL Cholesterol", "number", "> 40", "mg/dL", "Normal (M): > 40")}
        {f("triglycerides", "Triglycerides", "number", "< 150", "mg/dL", "Normal: < 150")}
      </div>

      <SectionLabel>Blood Count</SectionLabel>
      <div className="grid grid-cols-2 gap-3">
        {f("hemoglobin", "Hemoglobin", "number", "13.5–17.5", "g/dL")}
        {f("hematocrit", "Hematocrit", "number", "41–53", "%")}
        {f("wbc", "White Blood Cells", "number", "4.5–11", "×10³/µL")}
        {f("platelets", "Platelets", "number", "150–400", "×10³/µL")}
      </div>

      <SectionLabel>Uric Acid &amp; Kidney</SectionLabel>
      <div className="grid grid-cols-2 gap-3">
        {f("uricAcid", "Uric Acid", "number", "3.5–7.2", "mg/dL")}
        {f("creatinine", "Creatinine", "number", "0.7–1.3", "mg/dL")}
        {f("bun", "BUN", "number", "7–20", "mg/dL")}
      </div>

      <SectionLabel>Notes</SectionLabel>
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-mono font-semibold text-foreground/50 uppercase tracking-widest">
          Doctor&apos;s Comments
        </label>
        <div className={`squircle border transition-all duration-200 ${af("notes")
          ? "border-green-400 bg-green-50/50"
          : "border-foreground/15 bg-background focus-within:border-richcerulean"
          }`}>
          <textarea
            value={values.notes}
            onChange={e => onChange("notes", e.target.value)}
            placeholder="Any additional notes from your doctor…"
            rows={3}
            className="w-full bg-transparent px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-foreground/25 resize-none"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Record Card ──────────────────────────────────────────────────────────────

function RecordCard({
  record, onEdit, onDelete,
}: {
  record: HealthRecord;
  onEdit: (r: HealthRecord) => void;
  onDelete: (id: string, name: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const chips = MARKERS.flatMap(([label, field, low, high, unit]) => {
    const val = record[field] as string;
    const st = getStatus(val, low, high);
    return st === "empty" ? [] : [{ label, val, unit, st }];
  });

  return (
    <div
      className="squircle bg-background border border-foreground/10 hover:border-richcerulean/40 transition-all duration-200 overflow-hidden"
      style={{ animation: "fadeUp 0.25s ease-out" }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between px-5 py-4 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 squircle bg-richcerulean/10 flex items-center justify-center shrink-0">
            <FlaskConical size={18} className="text-richcerulean" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">
              {record.patientName || "Unknown Patient"}
            </p>
            <p className="text-[11px] font-mono text-foreground/50 mt-0.5">
              {record.reportDate} · {record.lab || "No source"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Quick chips preview */}
          <div className="hidden sm:flex gap-1.5">
            {chips.slice(0, 3).map(c => (
              <span
                key={c.label}
                className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-medium ${chipClass[c.st]}`}
              >
                {c.label} {chipIcon[c.st]}
              </span>
            ))}
            {chips.length > 3 && (
              <span className="px-2 py-0.5 rounded-full border border-foreground/15 text-[10px] font-mono text-foreground/40">
                +{chips.length - 3}
              </span>
            )}
          </div>

          <button
            onClick={() => onEdit(record)}
            className="w-8 h-8 rounded-full border border-foreground/15 flex items-center justify-center text-foreground/40 hover:border-richcerulean hover:text-richcerulean transition-all duration-150"
            title="Edit"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(record.id, record.patientName)}
            className="w-8 h-8 rounded-full border border-foreground/15 flex items-center justify-center text-foreground/40 hover:border-red-400 hover:text-red-500 transition-all duration-150"
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
          <button
            onClick={() => setExpanded(p => !p)}
            className="w-8 h-8 rounded-full border border-foreground/15 flex items-center justify-center text-foreground/40 hover:border-foreground/40 transition-all duration-150"
            title={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div
          className="border-t border-foreground/10 px-5 py-4 flex flex-col gap-3"
          style={{ animation: "fadeUp 0.2s ease-out" }}
        >
          <div className="flex flex-wrap gap-1.5">
            {chips.map(c => (
              <span
                key={c.label}
                className={`px-2.5 py-1 rounded-full border text-[11px] font-mono font-medium ${chipClass[c.st]}`}
              >
                {c.label}: {c.val} {c.unit} {chipIcon[c.st]}
              </span>
            ))}
          </div>
          {record.notes && (
            <div className="squircle bg-foreground/5 px-4 py-3">
              <p className="text-[10px] font-mono text-foreground/40 uppercase tracking-widest mb-1">Notes</p>
              <p className="text-sm text-foreground/70 leading-relaxed">{record.notes}</p>
            </div>
          )}
          <p className="text-[10px] font-mono text-foreground/30">
            DOB: {record.dob} · Added {record.createdAt.toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Documents() {
  // State
  const [activeTab, setActiveTab] = useState<Tab>("add");
  const [inputMethod, setInputMethod] = useState<InputMethod>("pdf");
  const [records, setRecords] = useState<HealthRecord[]>([]);

  const [formValues, setFormValues] = useState({ ...EMPTY_RECORD });
  const [autofilled, setAutofilled] = useState<Set<string>>(new Set());

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [ocrState, setOcrState] = useState<OcrState>("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null);

  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const [editValues, setEditValues] = useState({ ...EMPTY_RECORD });

  const [toast, setToast] = useState<{ msg: string; warn: boolean } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast helper
  const showToast = useCallback((msg: string, warn = false) => {
    setToast({ msg, warn });
    setTimeout(() => setToast(null), 2800);
  }, []);

  // Fetch documents on mount
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;
        const resp = await getDocuments(token);
        if (resp && resp.documents) {
          const fetchedRecords = resp.documents.map((d: any) => ({
            id: d.id,
            createdAt: new Date(d.created_at),

            reportDate: d.metrics?.report_date || "",
            lab: d.metrics?.lab || "",
            patientName: d.metrics?.patient_name || "",
            dob: d.metrics?.dob || "",

            glucoseFasting: d.metrics?.glucose_fasting || "",
            glucosePostmeal: d.metrics?.glucose_postmeal || "",
            hba1c: d.metrics?.hba1c || "",

            cholTotal: d.metrics?.chol_total || "",
            cholLDL: d.metrics?.chol_ldl || "",
            cholHDL: d.metrics?.chol_hdl || "",
            triglycerides: d.metrics?.triglycerides || "",

            hemoglobin: d.metrics?.hemoglobin || "",
            hematocrit: d.metrics?.hematocrit || "",
            wbc: d.metrics?.wbc || "",
            platelets: d.metrics?.platelets || "",

            uricAcid: d.metrics?.uric_acid || "",
            creatinine: d.metrics?.creatinine || "",
            bun: d.metrics?.bun || "",

            notes: d.metrics?.notes || "",
          }));

          setRecords(fetchedRecords);
        }
      } catch (error) {
        console.error("Failed to fetch documents:", error);
      }
    };
    fetchDocs();
  }, []);

  // OCR 
  const runOCR = useCallback(async (file: File) => {
    setOcrState("processing");
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("Not authenticated");

      const resp = await uploadDocument(token, file, "lab_result");

      if (resp.document_id) setCurrentDocumentId(resp.document_id);

      const extracted = resp.extracted_data || resp.metrics;

      if (!extracted) {
        throw new Error("OCR extraction failed");
      }
      setFormValues({ ...EMPTY_RECORD, ...extracted });
      setAutofilled(new Set(Object.keys(extracted)));
      setOcrState("done");
      showToast("OCR complete — please review the fields");
    } catch (error) {
      console.error(error);
      setOcrState("idle");
      showToast("Failed to run OCR on document", true);
    }
  }, [showToast]);

  const handleFileSelect = (file: File) => {
    if (file.type !== "application/pdf") { showToast("Please upload a PDF file", true); return; }
    if (file.size > 10 * 1024 * 1024) { showToast("File exceeds the 10 MB limit", true); return; }
    setPdfFile(file);
    runOCR(file);
  };

  const clearFile = () => {
    setPdfFile(null);
    setOcrState("idle");
    setFormValues({ ...EMPTY_RECORD });
    setAutofilled(new Set());
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFormChange = (field: keyof typeof EMPTY_RECORD, value: string) => {
    setFormValues(p => ({ ...p, [field]: value }));
    // Remove OCR highlight when user manually edits a field
    setAutofilled(p => { const n = new Set(p); n.delete(field); return n; });
  };

  const handleSubmit = async () => {
    if (!formValues.reportDate || !formValues.patientName) {
      showToast("Please fill in at least Date and Patient Name", true);
      return;
    }

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("Not authenticated");
      }

      let response;

      if (inputMethod === "manual") {
        response = await createManualDocument(
          token,
          formValues
        );
      } else {
        if (!currentDocumentId) {
          throw new Error("Missing document id");
        }

        response = await confirmDocument(
          token,
          currentDocumentId,
          formValues
        );
      }
    } catch (error) {
      console.error(error);
      showToast("Failed to save document to server", true);
    }

    const rec: HealthRecord = { id: currentDocumentId || Date.now().toString(), createdAt: new Date(), ...formValues };
    setRecords(p => [rec, ...p]);
    setFormValues({ ...EMPTY_RECORD });
    setAutofilled(new Set());
    setCurrentDocumentId(null);
    clearFile();
    showToast("Health record saved!");
    setActiveTab("records");
  };

  const openEdit = (r: HealthRecord) => {
    const { id, createdAt, ...rest } = r;
    setEditValues(rest);
    setModal({ type: "edit", record: r });
  };

  const saveEdit = () => {
    if (modal.type !== "edit") return;
    setRecords(p => p.map(r => r.id === modal.record.id ? { ...modal.record, ...editValues } : r));
    setModal({ type: "none" });
    showToast("Record updated");
  };

  const confirmDelete = async () => {
    if (modal.type !== "delete") return;

    try {
      const token = localStorage.getItem("access_token");
      if (token && modal.id && !modal.id.startsWith("demo")) {
        await apiDeleteDocument(token, modal.id);
      }
    } catch (error) {
      console.error(error);
      showToast("Failed to delete document from server", true);
    }

    setRecords(p => p.filter(r => r.id !== (modal as any).id));
    setModal({ type: "none" });
    showToast("Record deleted");
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-300 text-foreground">

      {/* ══ Header — mirrors chatbot exactly ══ */}
      <header className="w-[70%] mt-5 z-10 flex -space-x-2.75 items-center">
        <div className="flex flex-col w-full px-6 py-4 squircle bg-background">
          <h1 className="text-xl font-semibold text-foreground">Health Documents</h1>
          <p className="text-[12px] font-mono text-foreground/50">manage your health report data</p>
        </div>
      </header>

      {/* ══ Tabs ══ */}
      <div className="w-[70%] z-10 mt-4 flex gap-2">
        {(["add", "records"] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-5 py-2.5 squircle text-[13px] font-medium font-mono border transition-all duration-200 ${activeTab === tab
              ? "bg-richcerulean text-background border-richcerulean"
              : "bg-background text-foreground/60 border-foreground/15 hover:border-richcerulean hover:text-richcerulean"
              }`}
          >
            {tab === "add" ? <FileUp size={14} /> : <ClipboardList size={14} />}
            {tab === "add" ? "Upload / Add" : `My Records (${records.length})`}
          </button>
        ))}
      </div>

      {/* ══ Main ══ */}
      <main className="relative w-[70%] z-10 mt-4 mb-16 flex flex-col gap-4">

        {/* ═══ ADD TAB ═══ */}
        {activeTab === "add" && (
          <div className="squircle bg-background p-8 flex flex-col gap-5" style={{ animation: "fadeUp 0.25s ease-out" }}>

            {/* Input method toggle */}
            <div className="flex gap-2">
              {(["pdf", "manual"] as InputMethod[]).map(m => (
                <button
                  key={m}
                  onClick={() => { setInputMethod(m); if (m === "manual") clearFile(); }}
                  className={`flex items-center gap-2 px-4 py-2 squircle text-[13px] font-mono font-medium border transition-all duration-150 ${inputMethod === m
                    ? "bg-richcerulean/10 text-richcerulean border-richcerulean/40"
                    : "text-foreground/50 border-foreground/15 hover:border-foreground/30 hover:text-foreground/70"
                    }`}
                >
                  {m === "pdf" ? <FileText size={14} /> : <PenLine size={14} />}
                  {m === "pdf" ? "Upload PDF" : "Manual Entry"}
                </button>
              ))}
            </div>

            {/* PDF section */}
            {inputMethod === "pdf" && (
              <div className="flex flex-col gap-3">
                {!pdfFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={e => {
                      e.preventDefault();
                      setIsDragging(false);
                      const f = e.dataTransfer.files[0];
                      if (f) handleFileSelect(f);
                    }}
                    className={`border-2 border-dashed rounded-[40px] p-12 flex flex-col items-center gap-3 cursor-pointer text-center transition-all duration-200 ${isDragging
                      ? "border-richcerulean bg-richcerulean/10"
                      : "border-foreground/20 bg-richcerulean/5 hover:border-richcerulean hover:bg-richcerulean/10"
                      }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
                    />
                    <FileUp size={38} className="text-richcerulean/50" />
                    <div>
                      <p className="font-semibold text-sm text-foreground">
                        Drop your PDF health report here
                      </p>
                      <p className="text-[12px] font-mono text-foreground/40 mt-1">
                        or click to browse · max 10 MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="squircle border border-foreground/15 bg-background p-4 flex items-center gap-3">
                    <div className="w-10 h-10 squircle bg-richcerulean/10 flex items-center justify-center shrink-0">
                      <FileText size={18} className="text-richcerulean" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{pdfFile.name}</p>
                      <p className="text-[11px] font-mono text-foreground/40 mt-0.5">
                        {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {ocrState === "processing" && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1 rounded-full bg-foreground/10 overflow-hidden">
                            <div
                              className="h-full bg-richcerulean rounded-full"
                              style={{ animation: "grow 2s ease-out forwards" }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-foreground/40 flex items-center gap-1">
                            <Loader2 size={10} className="animate-spin" /> reading…
                          </span>
                        </div>
                      )}
                      {ocrState === "done" && (
                        <div className="mt-1 flex items-center gap-1.5">
                          <CheckCircle size={11} className="text-green-500" />
                          <span className="text-[11px] font-mono text-green-600">
                            OCR complete — review fields below
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={clearFile}
                      className="w-7 h-7 rounded-full border border-foreground/15 flex items-center justify-center text-foreground/40 hover:text-foreground/70 hover:border-foreground/40 transition-all shrink-0"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                {ocrState === "done" && (
                  <div
                    className="flex items-center gap-2.5 squircle border border-amber-300/60 bg-amber-50 px-4 py-3"
                    style={{ animation: "fadeUp 0.2s ease-out" }}
                  >
                    <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                    <p className="text-[12px] font-mono text-amber-700">
                      Fields highlighted in green were auto-filled by OCR. Please review and correct any errors before saving.
                    </p>
                  </div>
                )}

                {ocrState === "processing" && (
                  <div className="flex items-center gap-2.5 squircle border border-richcerulean/20 bg-richcerulean/5 px-4 py-3">
                    <Loader2 size={14} className="text-richcerulean animate-spin shrink-0" />
                    <p className="text-[12px] font-mono text-richcerulean">
                      Reading your document with OCR…
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Form — shown for manual always, for pdf once file is selected */}
            {(inputMethod === "manual" || pdfFile) && (
              <div style={{ animation: "fadeUp 0.2s ease-out" }}>
                <HealthForm
                  values={formValues}
                  autofilled={autofilled}
                  onChange={handleFormChange}
                />

                {/* Submit footer — mirrors chatbot input footer style */}
                <div className="mt-8 flex -space-x-2.75 items-center">
                  <div className="flex flex-col w-full squircle bg-foreground/5 px-5 py-3">
                    <p className="text-[11px] font-mono text-foreground/40">
                      Review all fields before saving · Date &amp; Patient Name are required
                    </p>
                  </div>
                  <span className="w-7 h-7 rotate-135 bg-foreground/5 scoop-70-30 -z-1" />
                  <Button
                    bgClass="bg-richcerulean text-background"
                    hoverClass="hover:bg-foreground hover:text-background"
                    onClick={handleSubmit}
                    title="New record"
                  >
                    <FilePlus2 size={20} />
                  </Button>
                </div>
              </div>
            )}

            {inputMethod === "pdf" && !pdfFile && (
              <p className="text-[12px] font-mono text-foreground/30 text-center mt-2">
                Upload a PDF to auto-fill the form, or switch to Manual Entry.
              </p>
            )}
          </div>
        )}

        {/* ═══ RECORDS TAB ═══ */}
        {activeTab === "records" && (
          <div style={{ animation: "fadeUp 0.25s ease-out" }}>
            {records.length === 0 ? (
              <div className="squircle bg-background p-16 flex flex-col items-center gap-4 text-center">
                <ClipboardList size={40} className="text-foreground/20" />
                <div>
                  <p className="font-semibold text-foreground/60">No records yet</p>
                  <p className="text-[12px] font-mono text-foreground/40 mt-1">
                    Upload a PDF or enter data manually to get started.
                  </p>
                </div>
                <Button
                  onClick={() => setActiveTab("add")}
                  bgClass="bg-richcerulean text-background"
                  hoverClass="hover:bg-foreground hover:text-background"
                  title="Add record"
                >
                  <FilePlus2 size={20} />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {records.map(r => (
                  <RecordCard
                    key={r.id}
                    record={r}
                    onEdit={openEdit}
                    onDelete={(id, name) => setModal({ type: "delete", id, name })}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ═══ EDIT DRAWER ═══ */}
      {modal.type === "edit" && (
        <>
          <div
            className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setModal({ type: "none" })}
          />
          <div
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-background flex flex-col"
            style={{ animation: "slideIn 0.25s ease-out", boxShadow: "-8px 0 40px rgba(0,0,0,0.12)" }}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-foreground/10">
              <div>
                <h2 className="font-semibold text-foreground">Edit Record</h2>
                <p className="text-[11px] font-mono text-foreground/40 mt-0.5">
                  {modal.record.patientName} · {modal.record.reportDate}
                </p>
              </div>
              <button
                onClick={() => setModal({ type: "none" })}
                className="w-8 h-8 rounded-full border border-foreground/15 flex items-center justify-center text-foreground/40 hover:border-foreground/40 transition-all"
              >
                <X size={14} />
              </button>
            </div>

            {/* Scrollable form */}
            <div className="flex-1 overflow-y-auto px-6 py-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-foreground/10 [&::-webkit-scrollbar-thumb]:rounded-full">
              <HealthForm
                values={editValues}
                autofilled={new Set()}
                onChange={(f, v) => setEditValues(p => ({ ...p, [f]: v }))}
              />
            </div>

            {/* Drawer footer — same connector style as chatbot input */}
            <div className="border-t border-foreground/10 px-6 py-4 flex -space-x-2.75 items-center">
              <div className="flex flex-col w-full squircle bg-foreground/5 px-5 py-3">
                <p className="text-[11px] font-mono text-foreground/40">Changes are saved locally</p>
              </div>
              <span className="w-7 h-7 rotate-135 bg-foreground/5 scoop-70-30 -z-1" />
              <Button
                onClick={saveEdit}
                bgClass="bg-richcerulean text-background"
                hoverClass="hover:bg-foreground hover:text-background"
                title="Save changes"
              >
                <CheckCircle size={20} />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* ═══ DELETE CONFIRM ═══ */}
      {modal.type === "delete" && (
        <>
          <div
            className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setModal({ type: "none" })}
          />
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ animation: "fadeUp 0.2s ease-out" }}
          >
            <div className="squircle bg-background p-8 w-full max-w-sm flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 squircle bg-red-50 border border-red-200 flex items-center justify-center">
                <Trash2 size={22} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Delete this record?</h3>
                <p className="text-[12px] font-mono text-foreground/50 mt-1">{modal.name}</p>
                <p className="text-sm text-foreground/60 mt-2 leading-relaxed">
                  This action cannot be undone. The health data will be permanently removed.
                </p>
              </div>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setModal({ type: "none" })}
                  className="flex-1 py-3 squircle border border-foreground/20 text-sm font-medium text-foreground/60 hover:border-foreground/40 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3 squircle bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-all"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ═══ TOAST ═══ */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] pointer-events-none flex items-center gap-2 px-5 py-2.5 squircle font-mono text-[12px] font-medium ${toast.warn ? "bg-amber-500 text-white" : "bg-foreground text-background"
            }`}
          style={{ animation: "fadeUp 0.3s ease-out" }}
        >
          {toast.warn ? <AlertTriangle size={13} /> : <CheckCircle size={13} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}