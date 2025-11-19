
import React, { useState } from 'react';
import { Option, MitigationAnalysis } from '../types';
import { ShieldAlert, Loader2, Sparkles, Plus, Trash2 } from 'lucide-react';
import { suggestMitigation, analyzeMitigationPlan } from '../services/geminiService';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  options: Option[];
  candidateIds: string[];
  onChange: (options: Option[]) => void;
}

export const StepMitigate: React.FC<Props> = ({ options, candidateIds, onChange }) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [newAnalysisItem, setNewAnalysisItem] = useState<{ [key: string]: string }>({});

  const candidateOptions = options.filter(o => candidateIds.includes(o.id));

  const updateOption = (updated: Option) => {
    onChange(options.map(o => o.id === updated.id ? updated : o));
  };

  const handleAiMitigate = async (opt: Option) => {
    setLoadingId(opt.id);
    const downsides = opt.consequences.filter(c => c.type === 'DOWNSIDE').map(d => d.text);
    
    // 1. Generate Plan
    const plan = await suggestMitigation(opt.title, downsides);
    
    // 2. Analyze Plan
    const analysis = await analyzeMitigationPlan(plan);

    const upsides = analysis.upsides.map(t => ({ id: uuidv4(), text: t }));
    const analysisDownsides = analysis.downsides.map(t => ({ id: uuidv4(), text: t }));

    updateOption({ 
        ...opt, 
        mitigationPlan: plan,
        mitigationUpsides: upsides,
        mitigationDownsides: analysisDownsides
    });
    
    setLoadingId(null);
  };

  const addAnalysisItem = (opt: Option, type: 'upside' | 'downside') => {
      const key = `${opt.id}-${type}`;
      const text = newAnalysisItem[key];
      if (!text?.trim()) return;

      const newItem: MitigationAnalysis = { id: uuidv4(), text: text };
      const updated = { ...opt };
      
      if (type === 'upside') {
          updated.mitigationUpsides = [...(opt.mitigationUpsides || []), newItem];
      } else {
          updated.mitigationDownsides = [...(opt.mitigationDownsides || []), newItem];
      }

      updateOption(updated);
      setNewAnalysisItem(prev => ({ ...prev, [key]: '' }));
  };

  const removeAnalysisItem = (opt: Option, type: 'upside' | 'downside', itemId: string) => {
      const updated = { ...opt };
      if (type === 'upside') {
          updated.mitigationUpsides = opt.mitigationUpsides?.filter(i => i.id !== itemId) || [];
      } else {
          updated.mitigationDownsides = opt.mitigationDownsides?.filter(i => i.id !== itemId) || [];
      }
      updateOption(updated);
  };

  if (candidateOptions.length === 0) return <div>No options selected. Go back and select options.</div>;

  return (
    <div className="animate-fade-in">
      <div className="mb-8 text-center">
        <h2 className="text-4xl font-extrabold text-slate-900 mb-2">Mitigate & Analyze</h2>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          For your selected candidates, how will you handle the risks? <br/>
          And importantly: <span className="font-bold text-slate-800">What are the consequences of your mitigation plan?</span>
        </p>
      </div>

      <div className={`grid gap-8 ${candidateOptions.length > 1 ? 'xl:grid-cols-2' : 'max-w-3xl mx-auto'}`}>
        {candidateOptions.map(option => {
            const riskList = option.consequences.filter(c => c.type === 'DOWNSIDE');
            const mitUpsides = option.mitigationUpsides || [];
            const mitDownsides = option.mitigationDownsides || [];

            return (
                <div key={option.id} className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col">
                    <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-center">
                        <h3 className="font-black text-xl text-slate-800">{option.title}</h3>
                        <button 
                            onClick={() => handleAiMitigate(option)}
                            disabled={loadingId === option.id}
                            className="text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1.5 rounded-full font-bold flex items-center gap-1 transition-colors"
                        >
                            {loadingId === option.id ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3"/>}
                            AI Draft
                        </button>
                    </div>

                    <div className="p-6 flex-grow space-y-6">
                        {/* Risks */}
                        <div className="bg-red-50 rounded-lg p-4">
                            <h4 className="text-xs font-bold uppercase text-red-800 mb-2 flex items-center">
                                <ShieldAlert className="w-4 h-4 mr-1"/> Original Risks
                            </h4>
                            <ul className="space-y-1">
                                {riskList.length > 0 ? riskList.map(r => (
                                    <li key={r.id} className="text-sm text-slate-700">• {r.text}</li>
                                )) : <li className="text-sm text-slate-400 italic">No major risks listed.</li>}
                            </ul>
                        </div>

                        {/* Mitigation Plan */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">
                                Mitigation Plan
                            </label>
                            <textarea 
                                value={option.mitigationPlan || ''}
                                onChange={(e) => updateOption({...option, mitigationPlan: e.target.value})}
                                placeholder="How will you address the risks?"
                                className="w-full p-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-sm min-h-[120px] resize-y"
                            />
                        </div>

                        <hr className="border-slate-100"/>

                        {/* Mitigation Analysis */}
                        <div>
                            <h4 className="font-bold text-slate-900 mb-3 text-sm">Consequences of Mitigation</h4>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Upsides */}
                                <div>
                                    <h5 className="text-xs font-bold text-green-600 uppercase mb-2">Plan Benefits</h5>
                                    <div className="space-y-2 mb-2">
                                        {mitUpsides.map(u => (
                                            <div key={u.id} className="flex justify-between items-start text-xs bg-green-50 p-2 rounded border border-green-100">
                                                <span>{u.text}</span>
                                                <button onClick={() => removeAnalysisItem(option, 'upside', u.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-3 h-3"/></button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-1">
                                        <input 
                                            type="text" 
                                            className="w-full text-xs border rounded px-2 py-1"
                                            placeholder="Add benefit..."
                                            value={newAnalysisItem[`${option.id}-upside`] || ''}
                                            onChange={(e) => setNewAnalysisItem(prev => ({...prev, [`${option.id}-upside`]: e.target.value}))}
                                            onKeyDown={(e) => e.key === 'Enter' && addAnalysisItem(option, 'upside')}
                                        />
                                        <button onClick={() => addAnalysisItem(option, 'upside')} className="bg-slate-100 hover:bg-slate-200 p-1 rounded"><Plus className="w-3 h-3"/></button>
                                    </div>
                                </div>

                                {/* Downsides */}
                                <div>
                                    <h5 className="text-xs font-bold text-red-500 uppercase mb-2">Plan Costs/Risks</h5>
                                    <div className="space-y-2 mb-2">
                                        {mitDownsides.map(d => (
                                            <div key={d.id} className="flex justify-between items-start text-xs bg-red-50 p-2 rounded border border-red-100">
                                                <span>{d.text}</span>
                                                <button onClick={() => removeAnalysisItem(option, 'downside', d.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-3 h-3"/></button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-1">
                                        <input 
                                            type="text" 
                                            className="w-full text-xs border rounded px-2 py-1"
                                            placeholder="Add cost..."
                                            value={newAnalysisItem[`${option.id}-downside`] || ''}
                                            onChange={(e) => setNewAnalysisItem(prev => ({...prev, [`${option.id}-downside`]: e.target.value}))}
                                            onKeyDown={(e) => e.key === 'Enter' && addAnalysisItem(option, 'downside')}
                                        />
                                        <button onClick={() => addAnalysisItem(option, 'downside')} className="bg-slate-100 hover:bg-slate-200 p-1 rounded"><Plus className="w-3 h-3"/></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};
