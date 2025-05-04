export type EnglishLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type QuestionType = 
  | "multiple-choice" 
  | "single-choice" 
  | "short-answer" 
  | "fill-in-the-blank" 
  | "sentence-correction";

export type QuestionTopic = 
  | "Vocabulary" 
  | "Grammar" 
  | "Reading Comprehension" 
  | "Listening" 
  | "Writing" 
  | "Speaking";

export interface Question {
  id: string;
  type: QuestionType;
  topic: QuestionTopic;
  content: string;
  options?: string[];
  correctAnswer?: string | string[];
  difficulty: EnglishLevel;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  options?: string[];
  onOptionClick?: (option: string) => void;
}

export interface Assessment {
  level: EnglishLevel;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
} 