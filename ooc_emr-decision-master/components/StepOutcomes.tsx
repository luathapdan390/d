import React, { useState } from 'react';
import { Outcome } from '../types';
import { Plus, Trash2, Lightbulb, Info } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  outcomes: Outcome[];
  onChange: (outcomes: Outcome[]) => void;
}

export const StepOutcomes: React.FC<Props> = ({ outcomes, onChange }) => {
  const [newWhat, setNewWhat] = useState('');
  const [newWhy, setNewWhy] = useState('');

  const addOutcome = () => {
    if (!newWhat.trim()) return;
    const outcome: Outcome = {
      id: uuidv4(),
      what: newWhat,
      why: newWhy
    };
    onChange([...outcomes, outcome]);
    setNewWhat('');
    setNewWhy('');
  };

  const removeOutcome = (id: string) => {
    onChange(outcomes.filter(o => o.id !== id));
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8 text-center">
        <h2 className="text-4xl font-extrabold text-slate-900 mb-2">Know Your Outcome</h2>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          Clarity is power. What is the specific result you want? And more importantly, <span className="italic font-semibold text-blue-600">why</span> do you want it?
        </p>
      </div>

      {/* Input Card */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6 sm:p-8 mb-8">
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
              Desired Outcome (What?)
            </label>
            <input
              type="text"
              value={newWhat}
              onChange={(e) => setNewWhat(e.target.value)}
              placeholder="e.g., Double my passive income within 12 months"
              className="w-full text-lg px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
              Purpose (Why?)
            </label>
            <textarea
              value={newWhy}
              onChange={(e) => setNewWhy(e.target.value)}
              placeholder="e.g., To have financial freedom and spend more time with my family..."
              rows={3}
              className="w-full text-base px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={addOutcome}
              disabled={!newWhat.trim()}
              className="bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-lg font-semibold flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Outcome
            </button>
          </div>
        </div>
      </div>

      {/* List of Outcomes */}
      {outcomes.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">Your Drivers</h3>
          {outcomes.map((outcome, idx) => (
            <div key={outcome.id} className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg shadow-sm flex justify-between items-start group">
              <div className="flex-1">
                <div className="flex items-baseline space-x-3 mb-1">
                  <span className="text-blue-200 font-black text-2xl">0{idx + 1}</span>
                  <h4 className="text-xl font-bold text-slate-900">{outcome.what}</h4>
                </div>
                {outcome.why && (
                  <p className="text-slate-600 mt-2 ml-9 italic border-l-2 border-blue-200 pl-4">
                    "{outcome.why}"
                  </p>
                )}
              </div>
              <button
                onClick={() => removeOutcome(outcome.id)}
                className="text-slate-400 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
          <Lightbulb className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Add at least one outcome to begin your journey.</p>
        </div>
      )}
    </div>
  );
};