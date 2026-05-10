'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, ArrowLeft, ArrowRight, Droplet, Lock, Mail, Pill, Scale, User, ActivitySquare } from "lucide-react";
import Button from "@/components/button";
import FieldInput from "@/components/fieldInput";
import SelectInput from "@/components/selectInput";
import { login, register, saveAuth, type HealthProfile } from "@/lib/api";
import { useAuthGuard } from "@/lib/useAuthGuard";

export default function RegisterPage() {
  const ready = useAuthGuard(false);
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "", email: "", password: "",
    dob: "", sex: "", height: "", weight: "",
    bloodType: "", smoking: "never", conditions: "", medications: ""
  });

  if (!ready) return null;

  const updateForm = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) return setStep(2);

    setIsSubmitting(true);
    try {
      const profile: Partial<HealthProfile> = {
        date_of_birth: form.dob,
        biological_sex: form.sex,
        height_cm: form.height ? Number(form.height) : null,
        weight_kg: form.weight ? Number(form.weight) : null,
        blood_type: form.bloodType,
        smoking_status: form.smoking,
        existing_conditions: form.conditions,
        current_medications: form.medications,
      };

      await register(form.name, form.email, form.password, profile);
      const tokens = await login(form.email, form.password);
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
      <div className="w-full max-w-2xl squircle bg-background p-8 sm:p-10 border border-foreground/10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-richcerulean/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <Link href="/" className="absolute top-6 left-6 z-20 w-10 h-10 squircle bg-background border border-foreground/10 flex items-center justify-center text-foreground/60 hover:text-richcerulean transition-colors">
          <ArrowLeft size={18} />
        </Link>

        <div className="relative z-10 flex flex-col gap-8 mt-2 text-center items-center">
          <div className="w-14 h-14 squircle bg-richcerulean/10 flex items-center justify-center">
            <Activity className="text-richcerulean" size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{step === 1 ? "Create account" : "Health profile"}</h1>
            <p className="text-[12px] font-mono text-foreground/50">{step === 1 ? "Start managing your health data today" : "Add context for better health insights"}</p>
          </div>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5 text-left">
            {error && <div className="squircle border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">{error}</div>}

            {step === 1 ? (
              <>
                <FieldInput label="Full Name" placeholder="John Doe" icon={User} value={form.name} onChange={v => updateForm('name', v)} required />
                <FieldInput label="Email Address" placeholder="email@example.com" type="email" icon={Mail} value={form.email} onChange={v => updateForm('email', v)} required />
                <FieldInput label="Password" placeholder="Password" type="password" icon={Lock} value={form.password} onChange={v => updateForm('password', v)} />
              </>
            ) : (
              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FieldInput label="Date of Birth" type="date" value={form.dob} onChange={v => updateForm('dob', v)} />
                  <SelectInput label="Biological Sex" value={form.sex} onChange={v => updateForm('sex', v)} 
                    options={[{label: 'Male', value: 'male'}, {label: 'Female', value: 'female'}]} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FieldInput label="Height (cm)" type="number" icon={Scale} value={form.height} onChange={v => updateForm('height', v)} />
                  <FieldInput label="Weight (kg)" type="number" icon={Scale} value={form.weight} onChange={v => updateForm('weight', v)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <SelectInput label="Blood Type" icon={Droplet} value={form.bloodType} onChange={v => updateForm('bloodType', v)}
                    options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Unknown'].map(t => ({label: t, value: t}))} />
                  <SelectInput label="Smoking Status" value={form.smoking} onChange={v => updateForm('smoking', v)}
                    options={[{label: 'Never Smoked', value: 'never'}, {label: 'Former Smoker', value: 'former'}, {label: 'Current Smoker', value: 'current'}]} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono font-semibold text-foreground/50 uppercase tracking-widest flex items-center gap-2"><ActivitySquare size={14}/> Existing Conditions</label>
                  <textarea value={form.conditions} onChange={e => updateForm('conditions', e.target.value)} rows={3} className="w-full bg-transparent squircle border border-foreground/15 px-4 py-3 text-sm outline-none focus:border-richcerulean resize-none" />
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              {step === 2 && (
                <button type="button" onClick={() => setStep(1)} className="min-h-12 px-5 squircle border border-foreground/15 text-foreground/70 hover:text-richcerulean transition-colors">Back</button>
              )}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3.5 border-none!"
                bgClass="bg-richcerulean text-background"
                hoverClass="hover:bg-foreground hover:text-background disabled:opacity-60"
                title={step === 1 ? "Continue" : "Sign Up"}>
                <div className="flex items-center gap-2 px-2">
                  <span className="font-medium">{step === 1 ? "Continue" : isSubmitting ? "Creating..." : "Sign Up"}</span>
                  <ArrowRight size={18} />
                </div>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}