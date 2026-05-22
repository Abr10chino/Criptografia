export type Matrix = number[][];

export type StepType = 
  | 'text-to-num'
  | 'blocks'
  | 'determinant'
  | 'inverse'
  | 'matrix-multiply'
  | 'num-to-text'
  | 'final-result';

export interface ProcessStep {
  id: string;
  title: string;
  description: string;
  type: StepType;
  payload: any;
}

export interface EncodingResult {
  encodedText: string;
  steps: ProcessStep[];
}

export interface DecodingResult {
  decodedText: string;
  steps: ProcessStep[];
}
