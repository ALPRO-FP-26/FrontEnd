export type HealthRecord = {
  id: string;
  createdAt: Date;
  // patient
  reportDate: string;
  lab: string;
  patientName: string;
  dob: string;
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
  patientName: "",
  dob: "",
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
};

// OCR mock data — replace with real OCR API response
export const MOCK_OCR_DATA: Omit<HealthRecord, "id" | "createdAt"> = {
  reportDate: new Date().toISOString().split("T")[0],
  lab: "Prodia Laboratorium",
  patientName: "Budi Santoso",
  dob: "1985-04-12",
  glucoseFasting: "104",
  glucosePostmeal: "138",
  hba1c: "5.4",
  cholTotal: "210",
  cholLDL: "128",
  cholHDL: "48",
  triglycerides: "165",
  hemoglobin: "14.2",
  hematocrit: "43.1",
  wbc: "7.5",
  platelets: "248",
  uricAcid: "6.1",
  creatinine: "0.92",
  bun: "15",
  notes: "Slightly elevated cholesterol and triglycerides. Follow up in 3 months.",
};