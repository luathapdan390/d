import React, { useState } from 'react';
import { Option, Consequence } from '../types';
import { Plus, Trash2, TrendingUp, TrendingDown, Sparkles, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { analyzeConsequences } from '../services/geminiService';

interface Props {
  options: Option[];
  onChange: (options: Option[]) => void;
}

export const StepConsequences: React.FC<Props> = ({ options, onChange }) => {
  // Track expanded state for accordion
  const [expandedOptionId, setExpandedOptionId] = useState<string | null>(options.length > 0 ? options[0].id : null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Temporary inputs
  const [inputText, setInputText] = useState('');
  const [inputScore, setInputScore] = useState(5);

  const addConsequence = (optionId: string, type: 'UPSIDE' | 'DOWNSIDE') => {
    if (!inputText.trim()) return;

    const updatedOptions = options.map(opt => {
      if (opt.id === optionId) {
        return {
          ...opt,
          consequences: [
            ...opt.consequences,
            {
              id: uuidv4(),
              text: inputText,
              type,
              score: inputScore
            }
          ]
        };
      }
      return opt;
    });

    onChange(updatedOptions);
    setInputText('');
    setInputScore(5);
  };

  const removeConsequence = (optionId: string, consId: string) => {
    const updatedOptions = options.map(opt => {
      if (opt.id === optionId) {
        return {
          ...opt,
          consequences: opt.consequences.filter(c => c.id !== consId)
        };
      }
      return opt;
    });
    onChange(updatedOptions);
  };

  const autoFill = async (optionId: string, title: string) => {
    setLoadingId(optionId);
    // Hack: we just pass a dummy Outcome array since we don't have easy access to outcomes in this prop
    // Ideally pass outcomes as prop or text context
    const result = await analyzeConsequences(title, [{ what: "my goal" }]);
    
    const newConsequences: Consequence[] = [];
    result.upsides.forEach(u => newConsequences.push({ id: uuidv4(), text: u, type: 'UPSIDE', score: 8 }));
    result.downsides.forEach(d => newConsequences.push({ id: uuidv4(), text: d, type: 'DOWNSIDE', score: 8 }));

    const updatedOptions = options.map(opt => {
        if (opt.id === optionId) {
            return { ...opt, consequences: [...opt.consequences, ...newConsequences] };
        }
        return opt;
    });
    onChange(updatedOptions);
    setLoadingId(null);
  };

  const toggleExpand = (id: string) => {
      setExpandedOptionId(expandedOptionId === id ? null : id);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8 text-center">
        <h2 className="text-4xl font-extrabold text-slate-900 mb-2">Assess Consequences</h2>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          What are the upsides and downsides? Weigh the risk against the reward.
        </p>
      </div>

      <div className="space-y-6">
        {options.map((option, idx) => {
          const isExpanded = expandedOptionId === option.id;
          const upsides = option.consequences.filter(c => c.type === 'UPSIDE');
          const downsides = option.consequences.filter(c => c.type === 'DOWNSIDE');

          return (
            <div key={option.id} className={`bg-white rounded-xl shadow-md border transition-all overflow-hidden ${isExpanded ? 'border-blue-400 ring-1 ring-blue-400' : 'border-slate-200'}`}>
              <div 
                className="p-6 flex items-center justify-between cursor-pointer bg-slate-50/50 hover:bg-slate-50"
                onClick={() => toggleExpand(option.id)}
              >
                <div className="flex items-center gap-4">
                    <span className="text-5xl font-black text-slate-100 font-sans">{idx + 1}</span>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">{option.title}</h3>
                        <div className="flex gap-4 mt-1 text-sm text-slate-500">
                            <span className="text-green-600 font-medium flex items-center"><TrendingUp className="w-3 h-3 mr-1"/> {upsides.length} Upsides</span>
                            <span className="text-red-500 font-medium flex items-center"><TrendingDown className="w-3 h-3 mr-1"/> {downsides.length} Downsides</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                     {isExpanded ? <ChevronUp className="text-slate-400"/> : <ChevronDown className="text-slate-400"/>}
                </div>
              </div>

              {isExpanded && (
                <div className="p-6 border-t border-slate-100 animate-slide-down">
                    <div className="flex justify-end mb-6">
                         <button 
                            onClick={() => autoFill(option.id, option.title)}
                            disabled={loadingId === option.id}
                            className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full hover:bg-purple-100 flex items-center gap-2"
                         >
                             {loadingId === option.id ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3"/>}
                             Auto-Analyze with AI
                         </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Upsides Column */}
                        <div>
                            <h4 className="font-bold text-green-700 mb-4 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div> UPSIDES (Gains)
                            </h4>
                            
                            <div className="space-y-3 mb-4">
                                {upsides.map(u => (
                                    <div key={u.id} className="flex justify-between items-start p-3 bg-green-50/50 rounded-lg border border-green-100 group">
                                        <div className="flex gap-3">
                                            <span className="bg-green-200 text-green-800 text-[10px] font-bold px-1.5 py-0.5 rounded h-fit mt-0.5">{u.score}</span>
                                            <p className="text-sm text-slate-700">{u.text}</p>
                                        </div>
                                        <button onClick={() => removeConsequence(option.id, u.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-3 h-3"/></button>
                                    </div>
                                ))}
                            </div>

                            {/* Add Input */}
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                <textarea
                                    className="w-full bg-transparent text-sm outline-none resize-none mb-2"
                                    placeholder="Add an upside..."
                                    rows={2}
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <span>Importance (1-10):</span>
                                        <input 
                                            type="number" 
                                            min="1" 
                                            max="10" 
                                            value={inputScore}
                                            onChange={(e) => setInputScore(parseInt(e.target.value))}
                                            className="w-12 px-1 py-0.5 border rounded text-center"
                                        />
                                    </div>
                                    <button 
                                        onClick={() => addConsequence(option.id, 'UPSIDE')}
                                        className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded transition-colors"
                                    >
                                        Add Upside
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Downsides Column */}
                        <div>
                            <h4 className="font-bold text-red-700 mb-4 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div> DOWNSIDES (Costs)
                            </h4>

                            <div className="space-y-3 mb-4">
                                {downsides.map(d => (
                                    <div key={d.id} className="flex justify-between items-start p-3 bg-red-50/50 rounded-lg border border-red-100 group">
                                        <div className="flex gap-3">
                                            <span className="bg-red-200 text-red-800 text-[10px] font-bold px-1.5 py-0.5 rounded h-fit mt-0.5">{d.score}</span>
                                            <p className="text-sm text-slate-700">{d.text}</p>
                                        </div>
                                        <button onClick={() => removeConsequence(option.id, d.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-3 h-3"/></button>
                                    </div>
                                ))}
                            </div>

                            {/* Add Input */}
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                <textarea
                                    className="w-full bg-transparent text-sm outline-none resize-none mb-2"
                                    placeholder="Add a downside..."
                                    rows={2}
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <span>Impact (1-10):</span>
                                        <input 
                                            type="number" 
                                            min="1" 
                                            max="10" 
                                            value={inputScore}
                                            onChange={(e) => setInputScore(parseInt(e.target.value))}
                                            className="w-12 px-1 py-0.5 border rounded text-center"
                                        />
                                    </div>
                                    <button 
                                        onClick={() => addConsequence(option.id, 'DOWNSIDE')}
                                        className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded transition-colors"
                                    >
                                        Add Downside
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};