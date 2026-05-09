'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  ActivitySquare,
  ArrowLeft,
  ArrowRight,
  Droplet,
  Lock,
  Mail,
  Pill,
  Scale,
  User,
  type LucideIcon,
} from "lucide-react";
import Button from "@/components/button";
import { login, register, saveAuth, updateHealthProfile, type HealthProfile } from "@/lib/api";
import { useAuthGuard } from "@/lib/useAuthGuard";

function FieldInput({
  label,
  value,
  type = "text",
  placeholder,
  icon: Icon,
  onChange,
}: {
  label: string;
  value: string;
  type?: string;
  placeholder?: string;
  icon?: LucideIcon;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-mono font-semibold text-foreground/50 uppercase tracking-widest">
        {label}
      </label>
      <div className="relative flex items-center squircle border border-foreground/15 bg-background focus-within:border-richcerulean transition-all duration-200">
        {Icon && (
          <div className="pl-4 text-foreground/40">
            <Icon size={16} />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent px-3 py-3 text-sm text-foreground outline-none placeholder:text-foreground/25"
          required={label === "Full Name" || label === "Email Address"}
        />
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const ready = useAuthGuard(false); // redirect to /dashboard if already logged in
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [sex, setSex] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [smokingStatus, setSmokingStatus] = useState("never");
  const [conditions, setConditions] = useState("");
  const [medications, setMedications] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!ready) return null;

  const parseNumber = (value: string) => {
    const parsed = Number(value);
    return value.trim() === "" || Number.isNaN(parsed) ? null : parsed;
  };

  const healthProfile: Partial<HealthProfile> = {
    date_of_birth: dateOfBirth,
    biological_sex: sex,
    height_cm: parseNumber(height),
    weight_kg: parseNumber(weight),
    blood_type: bloodType,
    smoking_status: smokingStatus,
    existing_conditions: conditions,
    current_medications: medications,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (step === 1) {
      setStep(2);
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name, email, password, healthProfile);
      const tokens = await login(email, password);
      saveAuth(tokens);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-300 text-foreground p-4">
      <div
        className="w-full max-w-2xl squircle bg-background p-8 sm:p-10 border border-foreground/10 shadow-xl relative overflow-hidden"
        style={{ animation: "fadeUp 0.35s ease-out" }}
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-richcerulean/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-foreground/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <Link
          href="/"
          className="absolute top-6 left-6 z-20 w-10 h-10 squircle bg-background border border-foreground/10 flex items-center justify-center text-foreground/60 shadow-sm cursor-pointer hover:text-richcerulean hover:border-richcerulean/40 transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>

        <div className="relative z-10 flex flex-col gap-8 mt-2">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-14 h-14 squircle bg-richcerulean/10 flex items-center justify-center mb-2">
              <Activity className="text-richcerulean" size={26} />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {step === 1 ? "Create account" : "Health profile"}
            </h1>
            <p className="text-[12px] font-mono text-foreground/50">
              {step === 1 ? "Start managing your health data today" : "Add context for better health insights"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="squircle border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {step === 1 ? (
              <>
                <FieldInput label="Full Name" placeholder="John Doe" icon={User} value={name} onChange={setName} />
                <FieldInput label="Email Address" type="email" placeholder="you@example.com" icon={Mail} value={email} onChange={setEmail} />
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono font-semibold text-foreground/50 uppercase tracking-widest">
                    Password
                  </label>
                  <div className="relative flex items-center squircle border border-foreground/15 bg-background focus-within:border-richcerulean transition-all duration-200">
                    <div className="pl-4 text-foreground/40">
                      <Lock size={16} />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={8}
                      required
                      className="w-full bg-transparent px-3 py-3 text-sm text-foreground outline-none placeholder:text-foreground/25"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono font-semibold text-foreground/50 uppercase tracking-widest">
                      Date of Birth
                    </label>
                    <input 
                      type="date" 
                      value={dateOfBirth} 
                      onChange={(e) => setDateOfBirth(e.target.value)} 
                      className="w-full bg-transparent squircle border border-foreground/15 px-4 py-3 text-sm outline-none focus:border-richcerulean"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono font-semibold text-foreground/50 uppercase tracking-widest">
                      Biological Sex
                    </label>
                    <select value={sex} onChange={(e) => setSex(e.target.value)} className="w-full bg-transparent squircle border border-foreground/15 px-4 py-3 text-sm outline-none focus:border-richcerulean">
                      <option value="">Select...</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FieldInput label="Height (cm)" type="number" placeholder="170" icon={Scale} value={height} onChange={setHeight} />
                  <FieldInput label="Weight (kg)" type="number" placeholder="70" icon={Scale} value={weight} onChange={setWeight} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono font-semibold text-foreground/50 uppercase tracking-widest flex items-center gap-2">
                      <Droplet size={14} /> Blood Type
                    </label>
                    <select value={bloodType} onChange={(e) => setBloodType(e.target.value)} className="w-full bg-transparent squircle border border-foreground/15 px-4 py-3 text-sm outline-none focus:border-richcerulean">
                      <option value="">Select...</option>
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
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono font-semibold text-foreground/50 uppercase tracking-widest">
                      Smoking Status
                    </label>
                    <select value={smokingStatus} onChange={(e) => setSmokingStatus(e.target.value)} className="w-full bg-transparent squircle border border-foreground/15 px-4 py-3 text-sm outline-none focus:border-richcerulean">
                      <option value="never">Never Smoked</option>
                      <option value="former">Former Smoker</option>
                      <option value="current">Current Smoker</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono font-semibold text-foreground/50 uppercase tracking-widest flex items-center gap-2">
                    <ActivitySquare size={14} /> Existing Conditions
                  </label>
                  <textarea value={conditions} onChange={(e) => setConditions(e.target.value)} rows={3} placeholder="e.g. Type 2 Diabetes, Hypertension" className="w-full bg-transparent squircle border border-foreground/15 px-4 py-3 text-sm outline-none focus:border-richcerulean resize-none" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono font-semibold text-foreground/50 uppercase tracking-widest flex items-center gap-2">
                    <Pill size={14} /> Current Medications
                  </label>
                  <textarea value={medications} onChange={(e) => setMedications(e.target.value)} rows={3} placeholder="e.g. Metformin 500mg" className="w-full bg-transparent squircle border border-foreground/15 px-4 py-3 text-sm outline-none focus:border-richcerulean resize-none" />
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                  className="min-h-12 px-5 squircle border border-foreground/15 text-foreground/70 hover:border-richcerulean hover:text-richcerulean transition-colors"
                >
                  Back
                </button>
              )}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3.5 !border-none"
                bgClass="bg-richcerulean text-background"
                hoverClass="hover:bg-foreground hover:text-background disabled:opacity-60 disabled:hover:bg-richcerulean disabled:hover:text-background"
                title={step === 1 ? "Continue" : "Create Account"}
              >
                <div className="flex items-center gap-2 px-2">
                  <span className="font-medium text-[15px]">
                    {step === 1 ? "Continue" : isSubmitting ? "Creating..." : "Sign Up"}
                  </span>
                  <ArrowRight size={18} />
                </div>
              </Button>
            </div>
          </form>

          {step === 1 && (
            <div className="flex flex-col items-center gap-5 mt-2">
              <div className="flex items-center gap-3 w-full">
                <div className="h-px flex-1 bg-foreground/10" />
                <span className="text-[10px] font-mono text-foreground/40 uppercase tracking-widest">OR</span>
                <div className="h-px flex-1 bg-foreground/10" />
              </div>
              <p className="text-[12px] font-mono text-foreground/60">
                Already have an account?{" "}
                <Link href="/login" className="text-richcerulean font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
