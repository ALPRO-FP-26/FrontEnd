import React, { useState } from 'react';
import { Activity, Thermometer, Weight, ChevronLeft, Calendar, Clock } from 'lucide-react';
import { BloodSugarForm, BloodPressureForm, WeightForm } from './forms';

type Category = 'none' | 'blood_sugar' | 'blood_pressure' | 'weight';

interface ManualTrackerProps {
  onSave?: () => void;
  onCancel?: () => void;
}

export const ManualTracker: React.FC<ManualTrackerProps> = ({ onSave, onCancel }) => {
  const [category, setCategory] = useState<Category>('none');

  const categories = [
    {
      id: 'blood_sugar',
      title: 'Blood Sugar',
      subtitle: 'Glucose Tracking',
      icon: <Thermometer size={24} />,
      color: 'text-amber-500',
      bg: 'bg-amber-50'
    },
    {
      id: 'blood_pressure',
      title: 'Blood Pressure',
      subtitle: 'Systolic / Diastolic',
      icon: <Activity size={24} />,
      color: 'text-rose-500',
      bg: 'bg-rose-50'
    },
    {
      id: 'weight',
      title: 'Weight',
      subtitle: 'BMI & Body Fat',
      icon: <Weight size={24} />,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50'
    }
  ];

  if (category === 'none') {
    return (
      <div className="flex flex-col gap-6" style={{ animation: 'fadeUp 0.3s ease-out' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id as Category)}
              className="group flex flex-col items-start gap-4 p-6 bg-background border border-foreground/10 squircle hover:border-richcerulean hover:shadow-lg hover:shadow-richcerulean/5 transition-all duration-300 text-left"
            >
              <div className={`w-12 h-12 ${cat.bg} ${cat.color} squircle flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                {cat.icon}
              </div>
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-richcerulean transition-colors">
                  {cat.title}
                </h3>
                <p className="text-[12px] font-mono text-foreground/40 mt-1">
                  {cat.subtitle}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6" style={{ animation: 'fadeLeft 0.3s ease-out' }}>
      <div className="flex items-center justify-between border-b border-foreground/5 pb-4">
        <button
          onClick={() => setCategory('none')}
          className="flex items-center gap-2 text-[13px] font-mono font-medium text-foreground/40 hover:text-richcerulean transition-colors"
        >
          <ChevronLeft size={16} />
          Back to categories
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-foreground/5 rounded-full">
          <span className="text-[11px] font-mono font-bold text-foreground/60 uppercase">
            {category.replace('_', ' ')}
          </span>
        </div>
      </div>

      {category === 'blood_sugar' && <BloodSugarForm onSave={onSave} onCancel={() => setCategory('none')} />}
      {category === 'blood_pressure' && <BloodPressureForm onSave={onSave} onCancel={() => setCategory('none')} />}
      {category === 'weight' && <WeightForm onSave={onSave} onCancel={() => setCategory('none')} />}
    </div>
  );
};
