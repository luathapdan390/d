
import React from 'react';
import { Option } from '../types';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface Props {
  options: Option[];
  selectedIds: string[];
  onToggle: (ids: string[]) => void;
}

export const StepEvaluate: React.FC<Props> = ({ options, selectedIds, onToggle }) => {
  
  const calculateScore = (option: Option) => {
    const upsideScore = option.consequences
      .filter(c => c.type === 'UPSIDE')
      .reduce((acc, curr) => acc + curr.score, 0);
      
    const downsideScore = option.consequences
      .filter(c => c.type === 'DOWNSIDE')
      .reduce((acc, curr) => acc + curr.score, 0);

    return upsideScore - downsideScore;
  };

  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onToggle(selectedIds.filter(sid => sid !== id));
    } else {
      if (selectedIds.length >= 2) {
        // Ideally show a toast, but we'll just replace the first one or do nothing
        // Let's do nothing to force deselection first, or replace last.
        // Replacing last feels better
        const newIds = [selectedIds[1], id]; 
        // But prompt says "Select 2". Let's strict limit
        if (selectedIds.length === 2) {
           alert("Please select only 2 options to mitigate. Deselect one to choose another.");
           return;
        }
      }
      onToggle([...selectedIds, id]);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8 text-center">
        <h2 className="text-4xl font-extrabold text-slate-900 mb-2">Evaluate & Select Candidates</h2>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          Review the net impact. Select <span className="font-bold text-blue-600">up to 2 options</span> that you want to take forward to the mitigation stage.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2">
        {options.map((option) => {
          const score = calculateScore(option);
          const isSelected = selectedIds.includes(option.id);
          const upsides = option.consequences.filter(c => c.type === 'UPSIDE');
          const downsides = option.consequences.filter(c => c.type === 'DOWNSIDE');

          return (
            <div 
              key={option.id}
              onClick={() => handleToggle(option.id)}
              className={`relative rounded-xl border-2 p-6 cursor-pointer transition-all duration-300 hover:shadow-xl flex flex-col h-full ${
                isSelected 
                  ? 'border-blue-600 bg-blue-50/30 shadow-lg scale-[1.02]' 
                  : 'border-slate-200 bg-white hover:border-blue-200'
              }`}
            >
              {isSelected && (
                <div className="absolute -top-3 -right-3 bg-blue-600 text-white rounded-full p-1.5 shadow-md">
                  <CheckCircle className="w-5 h-5" />
                </div>
              )}

              <h3 className="text-xl font-bold text-slate-900 mb-2">{option.title}</h3>
              
              {/* Score Badge */}
              <div className="mb-6">
                 <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                    score > 0 ? 'bg-green-100 text-green-700' : score < 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                 }`}>
                    Net Score: {score > 0 ? '+' : ''}{score}
                 </div>
              </div>

              <div className="space-y-4 flex-grow">
                <div>
                   <h4 className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">Top Upsides</h4>
                   <ul className="space-y-1">
                      {upsides.slice(0, 2).map(u => (
                          <li key={u.id} className="text-sm text-slate-600 flex items-start">
                            <span className="mr-2 text-green-500">•</span> {u.text}
                          </li>
                      ))}
                      {upsides.length === 0 && <li className="text-sm text-slate-300 italic">No upsides listed</li>}
                   </ul>
                </div>
                
                <div>
                   <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">Top Downsides</h4>
                   <ul className="space-y-1">
                      {downsides.slice(0, 2).map(d => (
                          <li key={d.id} className="text-sm text-slate-600 flex items-start">
                            <span className="mr-2 text-red-500">•</span> {d.text}
                          </li>
                      ))}
                       {downsides.length === 0 && <li className="text-sm text-slate-300 italic">No downsides listed</li>}
                   </ul>
                </div>
              </div>

              <div className={`mt-6 text-center py-2 rounded-lg font-semibold text-sm ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                 {isSelected ? 'Selected for Mitigation' : 'Click to Select'}
              </div>
            </div>
          );
        })}
      </div>
      
      {selectedIds.length === 0 && (
         <div className="mt-8 p-4 bg-yellow-50 text-yellow-800 rounded-lg flex items-center justify-center border border-yellow-200">
             <AlertTriangle className="w-5 h-5 mr-2" />
             Please select at least one option (maximum 2) to proceed.
         </div>
      )}
    </div>
  );
};
