import React from 'react';
import { Step } from '../types';

interface ProgressBarProps {
  currentStep: Step;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep }) => {
  const steps = [
    { id: Step.Outcomes, label: 'Outcomes' },
    { id: Step.Options, label: 'Options' },
    { id: Step.Consequences, label: 'Consequences' },
    { id: Step.Evaluate, label: 'Evaluate' },
    { id: Step.Mitigate, label: 'Mitigate' },
    { id: Step.Resolve, label: 'Resolve' },
  ];

  const currentIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Connecting Line Background */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-200 -z-10 rounded-full"></div>
        
        {/* Active Line Progress */}
        <div 
          className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-blue-600 -z-10 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;

          return (
            <div key={step.id} className="flex flex-col items-center group">
              <div 
                className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-[3px] transition-all duration-300 z-10 box-content ${
                  isActive 
                    ? 'bg-white border-blue-600 scale-125 shadow-[0_0_0_4px_rgba(37,99,235,0.2)]' 
                    : isCompleted 
                      ? 'bg-blue-600 border-blue-600' 
                      : 'bg-slate-200 border-slate-200'
                }`}
              ></div>
              <span 
                className={`absolute mt-8 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${
                  isActive ? 'text-blue-700' : isCompleted ? 'text-slate-600' : 'text-slate-300'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};