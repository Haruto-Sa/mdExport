import Head from 'next/head';
import { GeminiSummarizer } from '@/src/lib/gemini';
import { LocalSummarizer } from '@/src/lib/local';
import { processFile } from '@/src/lib/pdf-utils';
import { fetchPaperContent } from '@/src/lib/arxiv';
import { formatMarkdown } from '@/src/lib/markdownFormatter';
import { downloadFile, displayError, clearMessages } from '@/src/lib/utils';
import { useState, useRef } from 'react';

export default function Home() {
  const [paperContent, setPaperContent] = useState<string | null>(null);
  const [arxivId, setArxivId] = useState<string>('');
  const [provider, setProvider] = useState<'gemini' | 'local'>('gemini');
  const [currentFileName, setCurrentFileName] = useState<string>('summary');
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const summarizer = provider === 'gemini'
    ? (process.env.NEXT_PUBLIC_GEMINI_API_KEY ? new GeminiSummarizer(process.env.NEXT_PUBLIC_GEMINI_API_KEY) : null)
    : new LocalSummarizer();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      try {
        const result = await processFile(file);
        setPaperContent(result.content);
        setCurrentFileName(result.fileName);
        setSummary('');
        setErrorMessage('');
        setLoadingMessage('');
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "ファイルの読み込みに失敗しました。");
        console.error("Error reading file:", error);
        setPaperContent(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } else {
      setPaperContent(null);
    }
  };

  const handleSummarize = async () => {
    if (!paperContent) {
      setErrorMessage("要約するファイルが選択されていません。");
      return;
    }

    if (!summarizer) {
      setErrorMessage('APIキーが設定されていません。');
      return;
    }

    setIsLoading(true);
    setLoadingMessage("要約を生成中です...");
    setErrorMessage('');
    setSummary('');

    try {
      let summaryText = await summarizer.generateSummary(paperContent);
      try {
        summaryText = await formatMarkdown(summaryText);
      } catch (_) {}
      setSummary(summaryText);
    } catch (error) {
      console.error("Error during summarization:", error);
      let message = "要約中にエラーが発生しました。";
      if (error instanceof Error) {
        if (error.message.includes('API key not valid')) {
          message = "APIキーが無効です。正しいAPIキーが設定されているか確認してください。";
        } else if (error.message.includes('quota')) {
          message = "APIの利用制限を超えました。しばらく待ってから再度お試しください。";
        }
      }
      setErrorMessage(message);
      setSummary('');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleDownload = () => {
    if (summary) {
      downloadFile(summary, currentFileName);
    } else {
      setErrorMessage("ダウンロードする要約内容がありません。");
    }
  };

  const handleFetchArxiv = async () => {
    if (!arxivId) return;
    setIsLoading(true);
    setLoadingMessage('arXiv 論文を取得中です...');
    try {
      const content = await fetchPaperContent(arxivId);
      setPaperContent(content);
      setCurrentFileName(`${arxivId}_summary`);
      setSummary('');
    } catch (e) {
      setErrorMessage('arXiv 論文取得に失敗しました。');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  return (
    <>
      <Head>
        <title>論文要約 & MDエクスポート</title>
        <meta name="description" content="論文を要約してMarkdown形式でエクスポート" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">論文要約ツール</h1>
            <p className="text-gray-600">テキストファイルをアップロードして、内容を要約し、Markdown形式で保存します。</p>
          </header>

          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* File Upload Section */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">操作</h2>
              <div className="mb-4">
                <label htmlFor="fileInput" className="block text-sm font-medium text-gray-700 mb-2">
                  論文ファイル (.txt, .pdf):
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="fileInput"
                  accept=".txt,.pdf"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  aria-describedby="fileInputDescription"
                />
                <small id="fileInputDescription" className="text-gray-500 text-sm mt-1 block">
                  テキスト形式またはPDF形式の論文ファイルを選択してください。
                </small>
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">arXiv ID から取得</label>
                  <div className="flex gap-2">
                    <input type="text" value={arxivId} onChange={(e)=>setArxivId(e.target.value)} placeholder="2401.12345" className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none"/>
                    <button onClick={handleFetchArxiv} disabled={!arxivId || isLoading} className="bg-purple-600 text-white px-4 py-2 rounded-md disabled:bg-gray-400">取得</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">要約プロバイダ</label>
                  <select value={provider} onChange={(e)=>setProvider(e.target.value as any)} className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none">
                    <option value="gemini">Gemini (API)</option>
                    <option value="local">ローカルモデル</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleSummarize}
                disabled={!paperContent || isLoading || !summarizer}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                aria-label="論文を要約する"
              >
                論文を要約
              </button>
            </section>

            {/* Status Messages */}
            <section className="mb-8">
              {loadingMessage && (
                <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4" role="status">
                  {loadingMessage}
                </div>
              )}
              {errorMessage && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                  {errorMessage}
                </div>
              )}
            </section>

            {/* Summary Section */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">要約結果</h2>
              <textarea
                value={summary}
                readOnly
                placeholder="ここに要約が表示されます。"
                className="w-full h-64 p-4 border border-gray-300 rounded-md text-sm font-mono resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="要約結果"
              />
              <button
                onClick={handleDownload}
                disabled={!summary}
                className="mt-4 bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                aria-label="要約をMarkdownファイルとしてダウンロードする"
              >
                MDとしてダウンロード
              </button>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}