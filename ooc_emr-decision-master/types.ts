
export enum Step {
  Outcomes = 'OUTCOMES',
  Options = 'OPTIONS',
  Consequences = 'CONSEQUENCES',
  Evaluate = 'EVALUATE',
  Mitigate = 'MITIGATE',
  Resolve = 'RESOLVE'
}

export interface Outcome {
  id: string;
  what: string;
  why: string;
}

export interface Consequence {
  id: string;
  text: string;
  type: 'UPSIDE' | 'DOWNSIDE';
  score: number; // 1-10 weight of importance
}

export interface MitigationAnalysis {
  id: string;
  text: string;
}

export interface Option {
  id: string;
  title: string;
  description?: string;
  consequences: Consequence[];
  mitigationPlan?: string;
  // New fields for analyzing the mitigation itself
  mitigationUpsides?: MitigationAnalysis[];
  mitigationDownsides?: MitigationAnalysis[];
}

export interface DecisionState {
  outcomes: Outcome[];
  options: Option[];
  candidateOptionIds: string[]; // Changed from single selectedOptionId to array
  finalDecisionId: string | null; // The ultimate choice
  commitmentReason: string; // Why the user committed
}

export const initialDecisionState: DecisionState = {
  outcomes: [],
  options: [],
  candidateOptionIds: [],
  finalDecisionId: null,
  commitmentReason: ''
};
