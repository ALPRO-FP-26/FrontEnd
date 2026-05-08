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