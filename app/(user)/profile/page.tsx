'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, User, ActivitySquare, Save, CheckCircle, Scale, Droplet, Pill
} from "lucide-react";
import { getHealthProfile, updateHealthProfile, type HealthProfile } from "@/lib/api";

export default function Profile() {
  const [age, setAge] = useState("");
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
    setAge(profile.age == null ? "" : String(profile.age));
    setSex(profile.biological_sex ?? "");
    setHeight(profile.height_cm == null ? "" : String(profile.height_cm));
    setWeight(profile.weight_kg == null ? "" : String(profile.weight_kg));
    setBloodType(profile.blood_type ?? "");
    setSmokingStatus(profile.smoking_status || "never");
    setConditions(profile.existing_conditions ?? "");
    setMedications(profile.current_medications ?? "");
  };

  const buildProfilePayload = (): HealthProfile => ({
    age: parseNumber(age),
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

    getHealthProfile(token)
      .then(applyProfile)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load profile"))
      .finally(() => setIsLoading(false));
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
      const profile = await updateHealthProfile(token, buildProfilePayload());
      applyProfile(profile);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "w-full bg-gray-300 border border-foreground/15 squircle px-4 py-3.5 outline-none focus:border-richcerulean transition-all text-sm text-foreground placeholder:text-foreground/30";
  const labelClass = "text-[10px] font-mono font-semibold text-foreground/50 uppercase tracking-widest ml-1 flex items-center gap-2";

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-300 text-foreground font-sans pb-20">
      
      <header className="w-full max-w-3xl mt-6 px-6 flex justify-between items-center" style={{ animation: "fadeUp 0.3s ease-out" }}>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="w-10 h-10 squircle bg-background border border-foreground/10 flex items-center justify-center text-foreground/60 shadow-sm cursor-pointer hover:text-richcerulean hover:border-richcerulean/40 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-foreground">Your Profile</h1>
            <p className="text-[10px] font-mono text-foreground/50 uppercase tracking-widest">Manage your health context</p>
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
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className={labelClass}>Age</label>
              <input 
                type="number" 
                value={age} 
                onChange={e => setAge(e.target.value)} 
                placeholder="e.g. 35" 
                className={inputClass} 
              />
            </div>
            
            <div className="space-y-2">
              <label className={labelClass}>Biological Sex</label>
              <select 
                value={sex} 
                onChange={e => setSex(e.target.value)} 
                className={inputClass}
              >
                <option value="" disabled>Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-foreground/10">
            <div className="space-y-2">
              <label className={labelClass}>
                <Scale size={14} /> Height (cm)
              </label>
              <input 
                type="number" 
                value={height} 
                onChange={e => setHeight(e.target.value)} 
                placeholder="e.g. 170" 
                className={inputClass} 
              />
            </div>
            
            <div className="space-y-2">
              <label className={labelClass}>
                <Scale size={14} /> Weight (kg)
              </label>
              <input 
                type="number" 
                value={weight} 
                onChange={e => setWeight(e.target.value)} 
                placeholder="e.g. 70" 
                className={inputClass} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-foreground/10">
            <div className="space-y-2">
              <label className={labelClass}>
                <Droplet size={14} /> Blood Type
              </label>
              <select 
                value={bloodType} 
                onChange={e => setBloodType(e.target.value)} 
                className={inputClass}
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="Unknown">I don&apos;t know</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className={labelClass}>Smoking Status</label>
              <select 
                value={smokingStatus} 
                onChange={e => setSmokingStatus(e.target.value)} 
                className={inputClass}
              >
                <option value="never">Never Smoked</option>
                <option value="former">Former Smoker</option>
                <option value="current">Current Smoker</option>
              </select>
            </div>
          </div>

          <div className="space-y-6 pt-4 border-t border-foreground/10">
            <div className="space-y-2">
              <label className={labelClass}>
                <ActivitySquare size={14} /> Existing Conditions
              </label>
              <textarea 
                value={conditions} 
                onChange={e => setConditions(e.target.value)} 
                placeholder="e.g. Type 2 Diabetes, Hypertension (Optional)" 
                rows={3} 
                className={`${inputClass} resize-none`}
              />
              <p className="text-[10px] font-mono text-foreground/40 ml-1 mt-1">
                List any chronic conditions you are managing to provide better AI context.
              </p>
            </div>

            <div className="space-y-2">
              <label className={labelClass}>
                <Pill size={14} /> Current Medications
              </label>
              <textarea 
                value={medications} 
                onChange={e => setMedications(e.target.value)} 
                placeholder="e.g. Metformin 500mg, Lisinopril 10mg (Optional)" 
                rows={3} 
                className={`${inputClass} resize-none`}
              />
              <p className="text-[10px] font-mono text-foreground/40 ml-1 mt-1">
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
