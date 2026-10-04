export interface House {
  id: number;
  name: string;
  english: string;
  signification: string;
}

export interface Rashi {
  id: number;
  name: string;
  lord: string;
  element: string;
  nature: string;
  symbol: string;
}

export interface Planet {
  id: number;
  name: string;
  nature: string;
  signification: string;
}

export interface InterpretationResponse {
  shloka: string;
  shlokaTranslation: string;
  analysis: string;
  positiveEffects: string;
  negativeEffects: string;
  remedies: string;
  relationship: string;
  strength: string;
  source: string;
}
