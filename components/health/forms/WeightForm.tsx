import React, { useState, useEffect } from 'react';
import { FormInput } from '../shared/FormInput';
import { Save, Scale } from 'lucide-react';
import { createWeightLog } from '../../../lib/api';

interface WeightFormProps {
  onSave?: () => void;
  onCancel?: () => void;
}

export const WeightForm: React.FC<WeightFormProps> = ({ onSave, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState({
    recordedAt: new Date().toISOString().slice(0, 16),
    weightKg: '',
    heightCm: '',
    bodyFat: '',
    notes: ''
  });

  const [bmi, setBmi] = useState<{ value: number; label: string; color: string } | null>(null);

  useEffect(() => {
    const w = Number(values.weightKg);
    const h = Number(values.heightCm);
    if (w > 0 && h > 0) {
      const heightM = h / 100;
      const bmiVal = Number((w / (heightM * heightM)).toFixed(1));
      
      let label = 'NORMAL';
      let color = 'text-emerald-500';
      if (bmiVal < 18.5) { label = 'UNDERWEIGHT'; color = 'text-amber-500'; }
      else if (bmiVal >= 30) { label = 'OBESE'; color = 'text-red-500'; }
      else if (bmiVal >= 25) { label = 'OVERWEIGHT'; color = 'text-yellow-500'; }
      
      setBmi({ value: bmiVal, label, color });
    } else {
      setBmi(null);
    }
  }, [values.weightKg, values.heightCm]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      await createWeightLog(token, {
        recorded_at: new Date(values.recordedAt).toISOString(),
        weight_kg: Number(values.weightKg),
        height_cm: Number(values.heightCm),
        body_fat_percentage: Number(values.bodyFat),
        notes: values.notes
      });
      
      onSave?.();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Date & Time"
          type="datetime-local"
          value={values.recordedAt}
          onChange={(v) => setValues({ ...values, recordedAt: v })}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono font-semibold text-foreground/50 uppercase tracking-wider px-1">
            BMI Insight
          </label>
          <div className="flex items-center justify-between h-[46px] px-4 bg-foreground/[0.03] border border-foreground/10 squircle">
             {bmi ? (
               <>
                 <span className="text-sm font-bold text-foreground">{bmi.value}</span>
                 <span className={`text-[10px] font-bold ${bmi.color}`}>{bmi.label}</span>
               </>
             ) : (
               <span className="text-xs font-mono text-foreground/20">Enter weight and height...</span>
             )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormInput
          label="Weight"
          type="number"
          value={values.weightKg}
          onChange={(v) => setValues({ ...values, weightKg: v })}
          placeholder="0.0"
          unit="kg"
        />
        <FormInput
          label="Height"
          type="number"
          value={values.heightCm}
          onChange={(v) => setValues({ ...values, heightCm: v })}
          placeholder="0"
          unit="cm"
        />
        <FormInput
          label="Body Fat %"
          type="number"
          value={values.bodyFat}
          onChange={(v) => setValues({ ...values, bodyFat: v })}
          placeholder="0.0"
          unit="%"
        />
      </div>

      <FormInput
        label="Notes"
        value={values.notes}
        onChange={(v) => setValues({ ...values, notes: v })}
        placeholder="e.g. After workout"
      />

      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={handleSubmit}
          disabled={loading || !values.weightKg}
          className="flex-1 flex items-center justify-center gap-2 bg-richcerulean text-background py-3 squircle font-bold text-sm hover:bg-foreground transition-all disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? 'Saving...' : <><Save size={18} /> Save Log</>}
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-3 squircle border border-foreground/10 text-foreground/40 font-bold text-sm hover:border-foreground/30 transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
