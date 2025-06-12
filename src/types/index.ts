export interface PaperSummarizerConfig {
  apiKey: string;
  model: string;
  maxChars: number;
}

export interface FileProcessingResult {
  content: string;
  fileName: string;
}

export interface SummaryResult {
  text: string;
  error?: string;
}

export interface TranslationSection {
  id: number;
  title: string;
  content: string;
  type: string;
  translatedContent?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'error';
  error?: string;
}