
import React from 'react';
import { DecisionState } from '../types';
import { Check, Target, Shield, ArrowRight, AlertCircle, HeartHandshake } from 'lucide-react';

interface Props {
  decisionData: DecisionState;
  onUpdateDecision: (id: string | null, reason: string) => void;
}

export const StepResolve: React.FC<Props> = ({ decisionData, onUpdateDecision }) => {
  const candidates = decisionData.options.filter(o => decisionData.candidateOptionIds.includes(o.id));
  const finalOption = decisionData.options.find(o => o.id === decisionData.finalDecisionId);

  // Phase 1: Selection
  if (!finalOption) {
    return (
      <div className="animate-fade-in max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-2">Final Decision</h2>
          <p className="text-slate-500 text-lg">You have analyzed your options and their mitigations. Now, <span className="font-bold text-blue-600">select the winner.</span></p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {candidates.map(option => (
             <div key={option.id} className="bg-white rounded-2xl shadow-xl border-2 border-transparent hover:border-blue-400 transition-all overflow-hidden flex flex-col">
                <div className="p-6 bg-slate-50 border-b border-slate-100">
                  <h3 className="text-2xl font-black text-slate-800 mb-2">{option.title}</h3>
                  <p className="text-slate-500 text-sm italic">
                    {(option.mitigationPlan || "No mitigation plan").substring(0, 100)}...
                  </p>
                </div>
                <div className="p-6 space-y-4 flex-grow">
                    <div>
                        <h4 className="text-xs font-bold text-green-600 uppercase">Mitigation Upsides</h4>
                        <ul className="text-sm list-disc pl-4 text-slate-700">
                            {option.mitigationUpsides?.slice(0,3).map(u => <li key={u.id}>{u.text}</li>)}
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-red-500 uppercase">Mitigation Downsides</h4>
                        <ul className="text-sm list-disc pl-4 text-slate-700">
                            {option.mitigationDownsides?.slice(0,3).map(d => <li key={d.id}>{d.text}</li>)}
                        </ul>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100">
                    <button 
                      onClick={() => onUpdateDecision(option.id, "")}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-lg flex items-center justify-center transition-all shadow-lg shadow-blue-600/20"
                    >
                      Select This Option
                    </button>
                </div>
             </div>
          ))}
        </div>
      </div>
    );
  }

  // Phase 2: Commitment
  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
       <button 
         onClick={() => onUpdateDecision(null, "")}
         className="mb-6 text-sm text-slate-400 hover:text-blue-600 flex items-center"
       >
         <ArrowRight className="w-4 h-4 mr-1 rotate-180" /> Change Selection
       </button>

      <div className="bg-gradient-to-br from-blue-600 to-blue-900 rounded-2xl p-1 text-white shadow-2xl mb-8">
        <div className="bg-white text-slate-800 rounded-xl p-8 sm:p-12">
          
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-subtle">
                <Check className="w-10 h-10 stroke-[3]" />
            </div>
            <h2 className="text-xl font-bold text-slate-400 mb-2 uppercase tracking-widest">I have decided to</h2>
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
                {finalOption.title}
            </h1>
          </div>

          <div className="space-y-8">
            {/* Why I Commit Section - NEW */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
               <h3 className="flex items-center text-blue-800 font-bold mb-3 uppercase text-sm tracking-wide">
                 <HeartHandshake className="w-5 h-5 mr-2" /> Why I am committed to this decision
               </h3>
               <textarea 
                  value={decisionData.commitmentReason}
                  onChange={(e) => onUpdateDecision(finalOption.id, e.target.value)}
                  placeholder="I am committed to this path because..."
                  className="w-full bg-white p-4 rounded-lg border border-blue-200 focus:border-blue-500 outline-none min-h-[100px] text-lg text-slate-800 resize-none placeholder:text-slate-400"
               />
            </div>

            <div className="grid md:grid-cols-2 gap-8 text-left">
                <div className="bg-slate-50 p-6 rounded-xl">
                <h3 className="flex items-center text-slate-600 font-bold mb-3 uppercase text-sm tracking-wide">
                    <Target className="w-4 h-4 mr-2" /> Purpose Served
                </h3>
                <ul className="list-disc pl-4 space-y-2 text-slate-700 text-sm">
                    {decisionData.outcomes.map(o => (
                    <li key={o.id}><span className="font-semibold">{o.what}</span></li>
                    ))}
                </ul>
                </div>

                <div className="bg-slate-50 p-6 rounded-xl">
                <h3 className="flex items-center text-orange-600 font-bold mb-3 uppercase text-sm tracking-wide">
                    <Shield className="w-4 h-4 mr-2" /> Risk Mitigation
                </h3>
                <p className="text-slate-700 text-sm whitespace-pre-wrap mb-4">
                    {finalOption.mitigationPlan || "No specific mitigation plan added."}
                </p>
                {finalOption.mitigationDownsides && finalOption.mitigationDownsides.length > 0 && (
                    <div className="text-xs bg-orange-100 p-2 rounded border border-orange-200 text-orange-800 flex items-start">
                        <AlertCircle className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0"/> 
                        <span>Accepted Cost: {finalOption.mitigationDownsides.map(d => d.text).join(", ")}</span>
                    </div>
                )}
                </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-slate-400 text-sm">
        <p>Your decision is clear. Action creates clarity. <br/>Click "Save & Print" below to make it official.</p>
      </div>
    </div>
  );
};
