export type HealthRecord = {
  id: string;
  createdAt: Date;
  // patient
  reportDate: string;
  lab: string;
  // blood sugar
  glucoseFasting: string;
  glucosePostmeal: string;
  hba1c: string;
  // cholesterol
  cholTotal: string;
  cholLDL: string;
  cholHDL: string;
  triglycerides: string;
  // CBC
  hemoglobin: string;
  hematocrit: string;
  wbc: string;
  platelets: string;
  // kidney
  uricAcid: string;
  creatinine: string;
  bun: string;
  // misc
  notes: string;
  additionalMetrics?: Record<string, string>;
};

export type FieldStatus = "ok" | "warn" | "bad" | "empty";

export function getStatus(
  value: string,
  low: number,
  high: number
): FieldStatus {
  if (!value) return "empty";
  const n = parseFloat(value);
  if (n >= low && n <= high) return "ok";
  const margin = (high - low) * 0.2;
  if (n < low - margin || n > high + margin) return "bad";
  return "warn";
}

export const EMPTY_RECORD: Omit<HealthRecord, "id" | "createdAt"> = {
  reportDate: "",
  lab: "",
  glucoseFasting: "",
  glucosePostmeal: "",
  hba1c: "",
  cholTotal: "",
  cholLDL: "",
  cholHDL: "",
  triglycerides: "",
  hemoglobin: "",
  hematocrit: "",
  wbc: "",
  platelets: "",
  uricAcid: "",
  creatinine: "",
  bun: "",
  notes: "",

  additionalMetrics: {}
};

export const MARKERS: [string, keyof HealthRecord, number, number, string][] = [
  ["Glucose (F)", "glucoseFasting", 70, 99, "mg/dL"],
  ["HbA1c", "hba1c", 0, 5.7, "%"],
  ["Chol", "cholTotal", 0, 200, "mg/dL"],
  ["LDL", "cholLDL", 0, 100, "mg/dL"],
  ["HDL", "cholHDL", 40, 999, "mg/dL"],
  ["Trig", "triglycerides", 0, 150, "mg/dL"],
  ["Uric Acid", "uricAcid", 3.5, 7.2, "mg/dL"],
];

export const STANDARD_FIELDS: Array<{
  key: string;
  label: string;
  cat: string;
  unit: string;
  hint: string;
}> = [
  { key: "glucoseFasting", label: "Fasting Glucose", cat: "Blood Sugar", unit: "mg/dL", hint: "Normal: 70–99" },
  { key: "glucosePostmeal", label: "Post-meal Glucose (2h)", cat: "Blood Sugar", unit: "mg/dL", hint: "Normal: < 140" },
  { key: "hba1c", label: "HbA1c", cat: "Blood Sugar", unit: "%", hint: "Normal: < 5.7" },
  { key: "cholTotal", label: "Total Cholesterol", cat: "Cholesterol Panel", unit: "mg/dL", hint: "Normal: < 200" },
  { key: "cholLDL", label: "LDL Cholesterol", cat: "Cholesterol Panel", unit: "mg/dL", hint: "Normal: < 100" },
  { key: "cholHDL", label: "HDL Cholesterol", cat: "Cholesterol Panel", unit: "mg/dL", hint: "Normal (M): > 40" },
  { key: "triglycerides", label: "Triglycerides", cat: "Cholesterol Panel", unit: "mg/dL", hint: "Normal: < 150" },
  { key: "hemoglobin", label: "Hemoglobin", cat: "Blood Count", unit: "g/dL", hint: "13.5–17.5" },
  { key: "hematocrit", label: "Hematocrit", cat: "Blood Count", unit: "%", hint: "41–53" },
  { key: "wbc", label: "White Blood Cells", cat: "Blood Count", unit: "×10³/µL", hint: "4.5–11" },
  { key: "platelets", label: "Platelets", cat: "Blood Count", unit: "×10³/µL", hint: "150–400" },
  { key: "uricAcid", label: "Uric Acid", cat: "Kidney & Urine", unit: "mg/dL", hint: "3.5–7.2" },
  { key: "creatinine", label: "Creatinine", cat: "Kidney & Urine", unit: "mg/dL", hint: "0.7–1.3" },
  { key: "bun", label: "BUN", cat: "Kidney & Urine", unit: "mg/dL", hint: "7–20" }
];

export function getCategoryForLabel(label: string): string {
  const lower = label.toLowerCase();
  if (/\b(glucose|glukosa|sugar|gula|hba1c|a1c|glycated|glycosylated|fbg|fbs|rbs|rbg|gdp|gds|pp|insulin|c-peptide|homa-ir)\b/.test(lower)) {
    return "Blood Sugar";
  }
  if (/\b(cholesterol|kolesterol|chol|ldl|ldl-c|hdl|hdl-c|triglyceride|trigliserida|tg|trig|vldl|lipid|apolipoprotein|apoa|apob)\b/.test(lower)) {
    return "Cholesterol Panel";
  }
  if (/\b(hemoglobin|hgb|hb|hematocrit|hematokrit|hct|pcv|wbc|leukosit|leukocyte|white blood cell|sel darah putih|platelet|trombosit|plt|rbc|eritrosit|erythrocyte|red blood cell|sel darah merah|mcv|mch|mchc|rdw|rdw-cv|rdw-sd|mpv|pdw|p-lcr|lymphocyte|limfosit|monocyte|monosit|eosinophil|eosinofil|basophil|basofil|neutrophil|neutrofil|granulocyte|granulosit|ig|esr|led|sedimentation|bse)\b/.test(lower)) {
    return "Blood Count";
  }
  if (/\b(uric acid|asam urat|ua|creatinine|kreatinin|cr|crea|bun|urea|ureum|blood urea nitrogen|egfr|gfr|cct|urine|urin|urinalysis|urinalisis|microalbumin|albuminuria|specific gravity|berat jenis|bj|ph|urobilinogen|keton|ketone|nitrit|nitrite|sedimen)\b/.test(lower)) {
    return "Kidney & Urine";
  }
  if (/\b(sgot|ast|sgpt|alt|bilirubin|bili|protein|albumin|globulin|a\/g|alp|alkaline phosphatase|alkali fosfatase|ggt|gamma gt|hepar|hati)\b/.test(lower)) {
    return "Liver Function";
  }
  if (/\b(calcium|kalsium|ca|chloride|klorida|cl|potassium|kalium|k|sodium|natrium|na|iron|zat besi|fe|tibc|transferrin|ferritin|magnesium|mg|phosphorus|fosfor|phosphate|fosfat|po4)\b/.test(lower)) {
    return "Electrolytes & Minerals";
  }
  if (/\b(hbsag|anti-hbs|anti-hcv|hepatitis|hiv|ige|igg|igm|iga|psa|cea|ca-125|ca 15-3|ca 19-9|afp|homocysteine|vitamin|vit|crp|hs-crp|dengue|ns1|widal|salmonella|typhi|vdrl|tpha|antibody|antibodi|ana|serology|serologi)\b/.test(lower)) {
    return "Immunology & Markers";
  }  
  return "Other Tests";
}

export function formatDateToYYYYMMDD(dateStr: string): string {
  if (!dateStr) return "";

  const idFormatMatch = dateStr.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (idFormatMatch) {
    const day = idFormatMatch[1].padStart(2, '0');
    const month = idFormatMatch[2].padStart(2, '0');
    const year = idFormatMatch[3];
    return `${year}-${month}-${day}`;
  }

  const stdFormatMatch = dateStr.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
  if (stdFormatMatch) {
    const year = stdFormatMatch[1];
    const month = stdFormatMatch[2].padStart(2, '0');
    const day = stdFormatMatch[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
  return dateStr; 
}