import React, { useState } from 'react';
import { Option, Outcome } from '../types';
import { Plus, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { suggestOptions } from '../services/geminiService';

interface Props {
  options: Option[];
  outcomes: Outcome[];
  onChange: (options: Option[]) => void;
}

export const StepOptions: React.FC<Props> = ({ options, outcomes, onChange }) => {
  const [newOption, setNewOption] = useState('');
  const [isBrainstorming, setIsBrainstorming] = useState(false);

  const addOption = (title: string) => {
    if (!title.trim()) return;
    const option: Option = {
      id: uuidv4(),
      title: title,
      consequences: []
    };
    onChange([...options, option]);
  };

  const handleAdd = () => {
    addOption(newOption);
    setNewOption('');
  };

  const removeOption = (id: string) => {
    onChange(options.filter(o => o.id !== id));
  };

  const handleBrainstorm = async () => {
    setIsBrainstorming(true);
    const suggestions = await suggestOptions(outcomes);
    suggestions.forEach(title => addOption(title));
    setIsBrainstorming(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8 text-center">
        <h2 className="text-4xl font-extrabold text-slate-900 mb-2">Know Your Options</h2>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          One option is no choice. Two options is a dilemma. <br/>
          <span className="text-blue-600 font-semibold">Three options represents true choice.</span>
        </p>
      </div>

      {/* Add Input */}
      <div className="flex gap-3 mb-8">
        <input
          type="text"
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Enter an option..."
          className="flex-1 px-4 py-3 rounded-lg border border-slate-200 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-lg"
        />
        <button
          onClick={handleAdd}
          disabled={!newOption.trim()}
          className="bg-slate-900 hover:bg-black text-white px-6 rounded-lg font-semibold transition-colors disabled:opacity-50"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* AI Assist */}
      <div className="flex justify-center mb-10">
        <button
          onClick={handleBrainstorm}
          disabled={isBrainstorming || outcomes.length === 0}
          className="flex items-center space-x-2 text-sm font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-full transition-colors border border-purple-200"
        >
          {isBrainstorming ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>{isBrainstorming ? 'Thinking...' : 'Ask AI to Brainstorm Options'}</span>
        </button>
      </div>

      {/* Option Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {options.map((option, idx) => (
          <div key={option.id} className="bg-white p-6 rounded-xl shadow-md border border-slate-100 flex items-center justify-between group hover:border-blue-300 transition-all">
            <div className="flex items-center space-x-4">
               <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                 {idx + 1}
               </div>
               <span className="text-lg font-semibold text-slate-800">{option.title}</span>
            </div>
            <button
              onClick={() => removeOption(option.id)}
              className="text-slate-300 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};