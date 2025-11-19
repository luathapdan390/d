
import React, { useState, useEffect } from 'react';
import { 
  Step, 
  DecisionState, 
  initialDecisionState, 
  Outcome, 
  Option
} from './types';
import { ProgressBar } from './components/ProgressBar';
import { StepOutcomes } from './components/StepOutcomes';
import { StepOptions } from './components/StepOptions';
import { StepConsequences } from './components/StepConsequences';
import { StepEvaluate } from './components/StepEvaluate';
import { StepMitigate } from './components/StepMitigate';
import { StepResolve } from './components/StepResolve';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';

export default function App() {
  const [currentStep, setCurrentStep] = useState<Step>(Step.Outcomes);
  const [decisionData, setDecisionData] = useState<DecisionState>(initialDecisionState);

  // Local storage persistence
  useEffect(() => {
    const saved = localStorage.getItem('decision_master_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with initial state to ensure new array fields exist
        setDecisionData({
            ...initialDecisionState,
            ...parsed,
            candidateOptionIds: parsed.candidateOptionIds || (parsed.selectedOptionId ? [parsed.selectedOptionId] : []),
            finalDecisionId: parsed.finalDecisionId || null,
            commitmentReason: parsed.commitmentReason || ''
        });
      } catch (e) {
        console.error("Failed to parse saved data");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('decision_master_data', JSON.stringify(decisionData));
  }, [decisionData]);

  const nextStep = () => {
    const steps = [
      Step.Outcomes,
      Step.Options,
      Step.Consequences,
      Step.Evaluate,
      Step.Mitigate,
      Step.Resolve
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    const steps = [
      Step.Outcomes,
      Step.Options,
      Step.Consequences,
      Step.Evaluate,
      Step.Mitigate,
      Step.Resolve
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
      window.scrollTo(0, 0);
    }
  };

  // Helper to update state deeply
  const updateOutcomes = (outcomes: Outcome[]) => setDecisionData(prev => ({ ...prev, outcomes }));
  const updateOptions = (options: Option[]) => setDecisionData(prev => ({ ...prev, options }));
  const updateCandidateIds = (ids: string[]) => setDecisionData(prev => ({ ...prev, candidateOptionIds: ids }));
  const updateFinalDecision = (id: string | null, reason: string) => setDecisionData(prev => ({ ...prev, finalDecisionId: id, commitmentReason: reason }));

  const canProceed = () => {
    switch (currentStep) {
      case Step.Outcomes:
        return decisionData.outcomes.length > 0 && decisionData.outcomes[0].what.length > 3;
      case Step.Options:
        return decisionData.options.length >= 2; // Need at least 2 options to make a decision
      case Step.Consequences:
        return true; 
      case Step.Evaluate:
        // Require at least 1 candidate, ideally 2 as per prompt request
        return decisionData.candidateOptionIds.length > 0;
      case Step.Mitigate:
        return true;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-24">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              RM
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900">Robbins Method</span>
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem('decision_master_data');
              setDecisionData(initialDecisionState);
              setCurrentStep(Step.Outcomes);
              window.location.reload();
            }}
            className="text-xs text-slate-400 hover:text-red-500 transition-colors"
          >
            Reset
          </button>
        </div>
      </header>

      <main className="flex-grow w-full max-w-5xl mx-auto px-4 py-8">
        <ProgressBar currentStep={currentStep} />

        <div className="mt-8">
          {currentStep === Step.Outcomes && (
            <StepOutcomes outcomes={decisionData.outcomes} onChange={updateOutcomes} />
          )}
          {currentStep === Step.Options && (
            <StepOptions 
              options={decisionData.options} 
              outcomes={decisionData.outcomes}
              onChange={updateOptions} 
            />
          )}
          {currentStep === Step.Consequences && (
            <StepConsequences 
              options={decisionData.options} 
              onChange={updateOptions} 
            />
          )}
          {currentStep === Step.Evaluate && (
            <StepEvaluate 
              options={decisionData.options} 
              selectedIds={decisionData.candidateOptionIds}
              onToggle={updateCandidateIds}
            />
          )}
          {currentStep === Step.Mitigate && (
            <StepMitigate 
              options={decisionData.options} 
              candidateIds={decisionData.candidateOptionIds}
              onChange={updateOptions}
            />
          )}
          {currentStep === Step.Resolve && (
            <StepResolve 
              decisionData={decisionData}
              onUpdateDecision={updateFinalDecision}
            />
          )}
        </div>
      </main>

      {/* Sticky Footer Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === Step.Outcomes}
            className={`flex items-center px-6 py-3 rounded-full font-medium transition-colors ${
              currentStep === Step.Outcomes
                ? 'text-slate-300 cursor-not-allowed'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>

          <div className="text-sm font-medium text-slate-400 hidden sm:block">
            {canProceed() ? 'Ready to continue' : 'Complete the step to continue'}
          </div>

          {currentStep !== Step.Resolve ? (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className={`flex items-center px-8 py-3 rounded-full font-bold text-white transition-all shadow-lg ${
                !canProceed()
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-600/30'
              }`}
            >
              Next Step
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          ) : (
             decisionData.finalDecisionId && (
                <button
                onClick={() => window.print()}
                className="flex items-center px-8 py-3 rounded-full font-bold text-white bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-green-600/30 transition-all"
                >
                <Save className="w-5 h-5 mr-2" />
                Save & Print
                </button>
             )
          )}
        </div>
      </footer>
    </div>
  );
}
