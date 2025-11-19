
import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is not set in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const suggestOptions = async (outcomes: { what: string; why: string }[]): Promise<string[]> => {
  const ai = getAiClient();
  if (!ai) return [];

  const outcomeText = outcomes.map(o => `Goal: ${o.what}. Purpose: ${o.why}`).join('\n');
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `I am using the Tony Robbins OOC/EMR decision making framework.
      Based on these desired outcomes:
      ${outcomeText}
      
      Suggest 3 distinct, creative, and actionable "Options" (paths to achieve these outcomes).
      Return ONLY the titles of the options as a JSON array of strings. Do not include numbering or markdown.`,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
};

export const analyzeConsequences = async (optionTitle: string, outcomes: { what: string }[]): Promise<{ upsides: string[], downsides: string[] }> => {
  const ai = getAiClient();
  if (!ai) return { upsides: [], downsides: [] };

  const outcomeText = outcomes.map(o => o.what).join(', ');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `I am evaluating the option: "${optionTitle}" to achieve: "${outcomeText}".
      List 3 potential Upsides (benefits) and 3 potential Downsides (risks/costs) for this option.
      Return JSON in this format: { "upsides": ["..."], "downsides": ["..."] }`,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) return { upsides: [], downsides: [] };
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return { upsides: [], downsides: [] };
  }
};

export const suggestMitigation = async (optionTitle: string, downsides: string[]): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `For the decision option "${optionTitle}", here are the risks/downsides:
      ${downsides.join('\n')}
      
      Write a concise "Mitigation Plan" (1 paragraph) to address these risks.`,
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "";
  }
};

export const analyzeMitigationPlan = async (mitigationPlan: string): Promise<{ upsides: string[], downsides: string[] }> => {
  const ai = getAiClient();
  if (!ai) return { upsides: [], downsides: [] };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `I have a mitigation plan: "${mitigationPlan}".
      What are the potential UPSIDES (benefits) and DOWNSIDES (costs/new risks) of implementing this specific mitigation plan?
      Return JSON in this format: { "upsides": ["..."], "downsides": ["..."] }`,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) return { upsides: [], downsides: [] };
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return { upsides: [], downsides: [] };
  }
};
