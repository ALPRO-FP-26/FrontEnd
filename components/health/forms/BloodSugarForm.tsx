import React, { useState } from 'react';
import { FormInput } from '../shared/FormInput';
import { Save, X, Activity } from 'lucide-react';
import { createBloodSugarLog } from '../../../lib/api';

interface BloodSugarFormProps {
  onSave?: () => void;
  onCancel?: () => void;
}

export const BloodSugarForm: React.FC<BloodSugarFormProps> = ({ onSave, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState({
    recordedAt: new Date().toISOString().slice(0, 16),
    glucoseValue: '',
    measurementType: 'fasting',
    notes: '',
    mealInfo: '',
    medicationInfo: ''
  });

  const getIndicator = (val: number) => {
    if (!val) return null;
    if (val < 70) return { label: 'LOW', color: 'bg-amber-500', text: 'text-amber-500' };
    if (val > 140) return { label: 'HIGH', color: 'bg-rose-500', text: 'text-rose-500' };
    return { label: 'NORMAL', color: 'bg-emerald-500', text: 'text-emerald-500' };
  };

  const indicator = getIndicator(Number(values.glucoseValue));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      await createBloodSugarLog(token, {
        recorded_at: new Date(values.recordedAt).toISOString(),
        glucose_value: Number(values.glucoseValue),
        measurement_type: values.measurementType,
        notes: values.notes,
        meal_info: values.mealInfo,
        medication_info: values.medicationInfo
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
            Glucose Value
          </label>
          <div className="flex items-center gap-2 px-4 py-3 bg-foreground/[0.03] border border-foreground/10 squircle focus-within:border-richcerulean focus-within:bg-background transition-all">
            <input
              type="number"
              value={values.glucoseValue}
              onChange={(e) => setValues({ ...values, glucoseValue: e.target.value })}
              placeholder="e.g. 105"
              className="w-full bg-transparent text-sm text-foreground outline-none"
            />
            <span className="text-[10px] font-mono text-foreground/40 font-medium">mg/dL</span>
            {indicator && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${indicator.color} text-white`}>
                {indicator.label}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-mono font-semibold text-foreground/50 uppercase tracking-wider px-1">
          Measurement Type
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {['fasting', 'before_meal', 'after_meal', 'bedtime', 'random'].map((type) => (
            <button
              key={type}
              onClick={() => setValues({ ...values, measurementType: type })}
              className={`px-3 py-2 text-[11px] font-mono font-bold uppercase squircle border transition-all ${
                values.measurementType === type
                  ? 'bg-richcerulean text-background border-richcerulean'
                  : 'bg-background text-foreground/40 border-foreground/10 hover:border-foreground/30'
              }`}
            >
              {type.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Meal Info"
          value={values.mealInfo}
          onChange={(v) => setValues({ ...values, mealInfo: v })}
          placeholder="e.g. Breakfast, Oatmeal"
        />
        <FormInput
          label="Medication"
          value={values.medicationInfo}
          onChange={(v) => setValues({ ...values, medicationInfo: v })}
          placeholder="e.g. Metformin 500mg"
        />
      </div>

      <FormInput
        label="Notes"
        value={values.notes}
        onChange={(v) => setValues({ ...values, notes: v })}
        placeholder="How are you feeling?"
      />

      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={handleSubmit}
          disabled={loading || !values.glucoseValue}
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
