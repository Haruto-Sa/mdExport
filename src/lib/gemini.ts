import { GoogleGenAI } from "@google/genai";
import type { PaperSummarizerConfig, SummaryResult } from '../types';

const DEFAULT_CONFIG: Omit<PaperSummarizerConfig, 'apiKey'> = {
  model: "gemini-2.5-flash-preview-04-17",
  maxChars: 15000
};

export class GeminiSummarizer {
  private ai: GoogleGenAI;
  private config: PaperSummarizerConfig;

  constructor(apiKey: string, config?: Partial<PaperSummarizerConfig>) {
    this.config = { ...DEFAULT_CONFIG, apiKey, ...config };
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateSummary(text: string): Promise<string> {
    if (text.length <= this.config.maxChars) {
      return await this.singleSummary(text);
    }

    const chunks = this.splitTextIntoChunks(text);
    const partialSummaries: string[] = [];
    
    for (const chunk of chunks) {
      partialSummaries.push(await this.singleSummary(chunk));
    }

    return await this.singleSummary(partialSummaries.join('\n'));
  }

  private async singleSummary(input: string): Promise<string> {
    const prompt = `以下のテキストを、主要なポイント、方法論、結果、結論、そして新規性や貢献を含めて要約してください。\n\n---\n${input}\n---\n`;
    const response = await this.ai.models.generateContent({
      model: this.config.model,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    return response.text;
  }

  private splitTextIntoChunks(text: string): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += this.config.maxChars) {
      chunks.push(text.slice(i, i + this.config.maxChars));
    }
    return chunks;
  }
}