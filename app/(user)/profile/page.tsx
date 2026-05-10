'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, User, ActivitySquare, Save, CheckCircle, Scale, Droplet, Pill
} from "lucide-react";
import { getHealthProfile, updateHealthProfile, getWeightLogs, createWeightLog, type HealthProfile } from "@/lib/api";
import { formatDateToYYYYMMDD } from "@/lib/healthRecord";
import Button from "@/components/button";
import FieldInput from "@/components/fieldInput";
import SelectInput from "@/components/selectInput";

export default function Profile() {
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [sex, setSex] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  
  const [bloodType, setBloodType] = useState("");
  const [smokingStatus, setSmokingStatus] = useState("never");
  const [conditions, setConditions] = useState("");
  const [medications, setMedications] = useState("");
  
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const parseNumber = (value: string) => {
    const parsed = Number(value);
    return value.trim() === "" || Number.isNaN(parsed) ? null : parsed;
  };

  const applyProfile = (profile: HealthProfile) => {
    setDateOfBirth(profile.date_of_birth ? formatDateToYYYYMMDD(profile.date_of_birth) : "");
    setSex(profile.biological_sex ?? "");
    setHeight(profile.height_cm == null ? "" : String(profile.height_cm));
    setWeight(profile.weight_kg == null ? "" : String(profile.weight_kg));
    setBloodType(profile.blood_type ?? "");
    setSmokingStatus(profile.smoking_status || "never");
    setConditions(profile.existing_conditions ?? "");
    setMedications(profile.current_medications ?? "");
  };

  const buildProfilePayload = (): HealthProfile => ({
    date_of_birth: dateOfBirth,
    biological_sex: sex,
    height_cm: parseNumber(height),
    weight_kg: parseNumber(weight),
    blood_type: bloodType,
    smoking_status: smokingStatus,
    existing_conditions: conditions,
    current_medications: medications,
  });

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setIsLoading(false);
      setError("Please sign in to manage your profile.");
      return;
    }

    const loadData = async () => {
      try {
        const [profile, weightLogs] = await Promise.all([
          getHealthProfile(token),
          getWeightLogs(token)
        ]);
        
        applyProfile(profile);
        
        if (weightLogs && weightLogs.length > 0) {
          const sorted = [...weightLogs].sort((a, b) => 
            new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
          );
          const latest = sorted[0];
          setWeight(String(latest.weight_kg));
          if (latest.height_cm) {
            setHeight(String(latest.height_cm));
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Please sign in to save your profile.");
      return;
    }

    setIsSaving(true);
    try {
      // Save profile
      const profile = await updateHealthProfile(token, buildProfilePayload());
      applyProfile(profile);

      // Automatically create a weight tracking log if weight is provided
      const weightVal = parseNumber(weight);
      const heightVal = parseNumber(height);
      if (weightVal != null) {
        try {
          await createWeightLog(token, {
            recorded_at: new Date().toISOString(),
            weight_kg: weightVal,
            height_cm: heightVal,
            notes: "Updated from Profile"
          });
        } catch (logErr) {
          console.error("Failed to auto-create weight log:", logErr);
          // We don't block the profile save if the log fails
        }
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-300 text-foreground font-sans pb-20">
      
      <header className="w-full max-w-3xl mt-6 px-6 flex justify-between items-center" style={{ animation: "fadeUp 0.3s ease-out" }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <Button
              href="/dashboard"
              title="Back"
              bgClass="bg-richcerulean text-background"
              hoverClass="hover:bg-foreground hover:text-background"
            >
              <ArrowLeft size={20} />
            </Button>
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-foreground">Your Profile</h1>
            <p className="text-[12px] font-mono text-foreground/50">Manage your health context</p>
          </div>
        </div>
      </header>

      <main className="w-full max-w-3xl flex flex-col gap-6 px-6 mt-8" style={{ animation: "fadeUp 0.4s ease-out" }}>
        
        <form onSubmit={handleSave} className="squircle bg-background border border-foreground/10 shadow-sm p-6 sm:p-10 flex flex-col gap-8">
          {error && (
            <div className="squircle border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {isLoading && (
            <div className="squircle border border-foreground/10 bg-gray-300 px-4 py-3 text-sm text-foreground/60">
              Loading profile...
            </div>
          )}
          
          <div className="flex items-center gap-4 border-b border-foreground/10 pb-6">
            <div className="w-16 h-16 squircle bg-richcerulean/10 flex items-center justify-center text-richcerulean shrink-0">
              <User size={32} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Health Context</h2>
              <p className="text-[12px] font-mono text-foreground/60 mt-1 leading-relaxed">
                We use this information to accurately interpret your lab results. Reference ranges can vary significantly based on age, sex, and lifestyle factors.
              </p>
              
              {height && weight && (
                <div className="mt-4 flex items-center gap-3">
                  <div className="px-3 py-1.5 squircle bg-foreground/5 border border-foreground/10 flex flex-col">
                    <span className="text-[9px] font-mono font-bold uppercase text-foreground/30 leading-none">Your Current BMI</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-sm font-bold text-richcerulean">
                        {(Number(weight) / Math.pow(Number(height) / 100, 2)).toFixed(1)}
                      </span>
                      <span className={`text-[10px] font-mono font-bold uppercase ${
                        (Number(weight) / Math.pow(Number(height) / 100, 2)) < 18.5 ? 'text-amber-500' :
                        (Number(weight) / Math.pow(Number(height) / 100, 2)) < 25 ? 'text-emerald-500' :
                        (Number(weight) / Math.pow(Number(height) / 100, 2)) < 30 ? 'text-yellow-600' : 'text-rose-500'
                      }`}>
                        {(Number(weight) / Math.pow(Number(height) / 100, 2)) < 18.5 ? 'Underweight' :
                         (Number(weight) / Math.pow(Number(height) / 100, 2)) < 25 ? 'Normal' :
                         (Number(weight) / Math.pow(Number(height) / 100, 2)) < 30 ? 'Overweight' : 'Obese'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FieldInput
              label="Date of Birth"
              type="date"
              value={dateOfBirth}
              onChange={setDateOfBirth}
              required
            />
            
            <SelectInput
              label="Biological Sex"
              value={sex}
              onChange={setSex}
              placeholder="Select..."
              options={[
                { label: "Male", value: "male" },
                { label: "Female", value: "female" },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-foreground/10">
            <FieldInput
              label="Height (cm)"
              type="number"
              icon={Scale}
              value={height}
              onChange={setHeight}
              placeholder="e.g. 170"
            />
            
            <FieldInput
              label="Weight (kg)"
              type="number"
              icon={Scale}
              value={weight}
              onChange={setWeight}
              placeholder="e.g. 70"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-foreground/10">
            <SelectInput
              label="Blood Type"
              icon={Droplet}
              value={bloodType}
              onChange={setBloodType}
              options={[
                { label: "A+", value: "A+" },
                { label: "A-", value: "A-" },
                { label: "B+", value: "B+" },
                { label: "B-", value: "B-" },
                { label: "O+", value: "O+" },
                { label: "O-", value: "O-" },
                { label: "AB+", value: "AB+" },
                { label: "AB-", value: "AB-" },
                { label: "I don't know", value: "Unknown" },
              ]}
            />
            
            <SelectInput
              label="Smoking Status"
              value={smokingStatus}
              onChange={setSmokingStatus}
              options={[
                { label: "Never Smoked", value: "never" },
                { label: "Former Smoker", value: "former" },
                { label: "Current Smoker", value: "current" },
              ]}
            />
          </div>

          <div className="space-y-6 pt-4 border-t border-foreground/10">
            <div className="space-y-1">
              <FieldInput
                label="Existing Conditions"
                icon={ActivitySquare}
                value={conditions}
                onChange={setConditions}
                placeholder="e.g. Type 2 Diabetes, Hypertension (Optional)"
              />
              <p className="text-[10px] font-mono text-foreground/40 ml-1">
                List any chronic conditions you are managing to provide better AI context.
              </p>
            </div>

            <div className="space-y-1">
              <FieldInput
                label="Current Medications"
                icon={Pill}
                value={medications}
                onChange={setMedications}
                placeholder="e.g. Metformin 500mg, Lisinopril 10mg (Optional)"
              />
              <p className="text-[10px] font-mono text-foreground/40 ml-1">
                Medications can affect lab result reference ranges.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end border-t border-foreground/10 pt-6 gap-4">
            {isSaved && (
              <span className="text-[12px] font-mono font-medium text-green-500 flex items-center gap-1.5 animate-in fade-in slide-in-from-right-4 duration-300">
                <CheckCircle size={14} /> Saved Successfully
              </span>
            )}
            <button 
              type="submit"
              disabled={isSaving}
              className="px-8 py-3 squircle bg-richcerulean text-background font-medium hover:bg-foreground transition-colors flex items-center gap-2 shadow-sm"
            >
              <Save size={18} /> {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>

        </form>

      </main>
    </div>
  );
}
