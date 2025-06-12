// @ts-ignore
import pdfjsLib from "https://esm.sh/pdfjs-dist@4.9.155";
import type { FileProcessingResult } from '../types';

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
    let fullText = '';
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('PDF処理エラー:', error);
    throw new Error('PDFファイルの読み込みに失敗しました。');
  }
}

export async function processFile(file: File): Promise<FileProcessingResult> {
  const isText = file.type === "text/plain";
  const isPDF = file.type === "application/pdf" || file.name.toLowerCase().endsWith('.pdf');
  
  if (!isText && !isPDF) {
    throw new Error('テキストファイル (.txt) またはPDFファイル (.pdf) を選択してください。');
  }

  let content: string;
  if (isText) {
    content = await file.text();
  } else {
    content = await extractTextFromPDF(file);
  }

  const fileName = file.name.replace(/\.[^/.]+$/, "") + "_summary";
  
  return { content, fileName };
}