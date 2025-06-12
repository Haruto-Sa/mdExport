import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileText, Play, Pause, RotateCcw, Download, ChevronRight, CheckCircle, Circle, AlertCircle } from 'lucide-react';
import type { TranslationSection } from '../../types';
import { cn } from '../../lib/utils';

const PaperTranslatorApp = () => {
  const [file, setFile] = useState<File | null>(null);
  const [sections, setSections] = useState<TranslationSection[]>([]);
  const [currentSection, setCurrentSection] = useState(0);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [translatedSections, setTranslatedSections] = useState<Record<number, TranslationSection>>({});
  const [progress, setProgress] = useState(0);
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('ja');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    
    const demoSections: TranslationSection[] = [
      { id: 1, title: "Abstract", content: "This paper presents a novel approach to machine learning that combines deep neural networks with traditional statistical methods. The proposed method achieves state-of-the-art performance on several benchmark datasets while maintaining computational efficiency.", type: "abstract" },
      { id: 2, title: "1. Introduction", content: "Machine learning has revolutionized many fields in recent years. However, existing approaches often struggle with limited data or require extensive computational resources. This work addresses these challenges by proposing a hybrid methodology.", type: "section" },
      { id: 3, title: "2. Related Work", content: "Previous studies in this area have focused primarily on either deep learning or traditional statistical approaches. Smith et al. (2020) demonstrated the effectiveness of neural networks in image classification tasks. Johnson and Brown (2021) showed that statistical methods can be superior in low-data regimes.", type: "section" },
      { id: 4, title: "3. Methodology", content: "Our approach consists of three main components: (1) a feature extraction module based on convolutional neural networks, (2) a statistical inference engine that leverages Bayesian methods, and (3) a fusion mechanism that combines outputs from both components.", type: "section" },
      { id: 5, title: "4. Experiments", content: "We evaluate our method on three benchmark datasets: CIFAR-10, ImageNet, and a custom dataset collected for this study. The experiments are designed to assess both accuracy and computational efficiency compared to existing approaches.", type: "section" },
      { id: 6, title: "5. Results", content: "Our method achieves 95.2% accuracy on CIFAR-10, 88.7% on ImageNet, and 92.1% on our custom dataset. These results represent improvements of 3.1%, 2.4%, and 5.3% respectively over the previous state-of-the-art methods.", type: "section" },
      { id: 7, title: "6. Discussion", content: "The results demonstrate that our hybrid approach successfully combines the strengths of both deep learning and statistical methods. The performance improvements are particularly notable in scenarios with limited training data.", type: "section" },
      { id: 8, title: "7. Conclusion", content: "We have presented a novel hybrid approach that achieves superior performance while maintaining computational efficiency. Future work will explore applications to other domains and investigate theoretical foundations of the proposed method.", type: "conclusion" }
    ];
    
    setSections(demoSections);
    setCurrentSection(0);
    setTranslatedSections({});
    setProgress(0);
  }, []);

  const translateText = async (text: string): Promise<string> => {
    const translations: Record<string, string> = {
      "This paper presents a novel approach to machine learning that combines deep neural networks with traditional statistical methods. The proposed method achieves state-of-the-art performance on several benchmark datasets while maintaining computational efficiency.": "本論文では、深層ニューラルネットワークと従来の統計手法を組み合わせた機械学習への新しいアプローチを提示する。提案手法は、計算効率を維持しながら、複数のベンチマークデータセットで最先端の性能を達成する。",
      "Machine learning has revolutionized many fields in recent years. However, existing approaches often struggle with limited data or require extensive computational resources. This work addresses these challenges by proposing a hybrid methodology.": "機械学習は近年多くの分野に革命をもたらした。しかし、既存のアプローチは限られたデータで苦戦したり、膨大な計算資源を必要としたりすることが多い。本研究は、ハイブリッド手法を提案することでこれらの課題に取り組む。"
    };
    
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    
    return translations[text] || `[翻訳済み] ${text}`;
  };

  const startTranslation = async () => {
    if (sections.length === 0) return;
    
    setIsTranslating(true);
    setIsPaused(false);
    
    for (let i = currentSection; i < sections.length; i++) {
      if (isPaused) break;
      
      setCurrentSection(i);
      
      if (!translatedSections[i]) {
        try {
          const translatedText = await translateText(sections[i].content);
          setTranslatedSections(prev => ({
            ...prev,
            [i]: {
              ...sections[i],
              translatedContent: translatedText,
              status: 'completed'
            }
          }));
        } catch (error) {
          setTranslatedSections(prev => ({
            ...prev,
            [i]: {
              ...sections[i],
              status: 'error',
              error: error instanceof Error ? error.message : 'Translation error'
            }
          }));
        }
      }
      
      setProgress(((i + 1) / sections.length) * 100);
    }
    
    setIsTranslating(false);
  };

  const pauseTranslation = () => {
    setIsPaused(true);
    setIsTranslating(false);
  };

  const resetTranslation = () => {
    setCurrentSection(0);
    setTranslatedSections({});
    setProgress(0);
    setIsTranslating(false);
    setIsPaused(false);
  };

  const downloadTranslation = () => {
    const translatedText = sections.map((section, index) => {
      const translated = translatedSections[index];
      if (translated && translated.translatedContent) {
        return `${section.title}\n${translated.translatedContent}\n\n`;
      }
      return `${section.title}\n[未翻訳]\n\n`;
    }).join('');
    
    const blob = new Blob([translatedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name || 'paper'}_translated.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSectionIcon = (index: number) => {
    const translated = translatedSections[index];
    if (translated?.status === 'completed') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (translated?.status === 'error') return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (index === currentSection && isTranslating) return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
    return <Circle className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            論文翻訳アプリ
          </h1>
          
          <div className="mb-6">
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                {file ? `選択されたファイル: ${file.name}` : 'PDFファイルをクリックまたはドラッグしてアップロード'}
              </p>
              <p className="text-sm text-gray-500">PDF形式をサポート</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          <div className="flex gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">翻訳元言語</label>
              <select 
                value={sourceLanguage} 
                onChange={(e) => setSourceLanguage(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">英語</option>
                <option value="ja">日本語</option>
                <option value="zh">中国語</option>
                <option value="ko">韓国語</option>
              </select>
            </div>
            <div className="flex items-end">
              <ChevronRight className="w-6 h-6 text-gray-400 mb-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">翻訳先言語</label>
              <select 
                value={targetLanguage} 
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ja">日本語</option>
                <option value="en">英語</option>
                <option value="zh">中国語</option>
                <option value="ko">韓国語</option>
              </select>
            </div>
          </div>

          {sections.length > 0 && (
            <>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">翻訳進捗</span>
                  <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-4 mb-6">
                {!isTranslating ? (
                  <button
                    onClick={startTranslation}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    翻訳開始
                  </button>
                ) : (
                  <button
                    onClick={pauseTranslation}
                    className="flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
                  >
                    <Pause className="w-4 h-4" />
                    一時停止
                  </button>
                )}
                
                <button
                  onClick={resetTranslation}
                  className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  リセット
                </button>
                
                {Object.keys(translatedSections).length > 0 && (
                  <button
                    onClick={downloadTranslation}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    ダウンロード
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {sections.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">セクション一覧</h2>
              <div className="space-y-2">
                {sections.map((section, index) => (
                  <div
                    key={section.id}
                    className={cn(
                      "p-3 rounded-md border cursor-pointer transition-colors",
                      index === currentSection 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                    onClick={() => !isTranslating && setCurrentSection(index)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">{section.title}</span>
                      {getSectionIcon(index)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">翻訳内容</h2>
              {sections[currentSection] && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">原文</h3>
                    <div className="bg-gray-50 p-4 rounded-md border">
                      <h4 className="font-medium mb-2">{sections[currentSection].title}</h4>
                      <p className="text-gray-700 leading-relaxed">{sections[currentSection].content}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">翻訳</h3>
                    <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                      <h4 className="font-medium mb-2">{sections[currentSection].title}</h4>
                      {translatedSections[currentSection]?.translatedContent ? (
                        <p className="text-gray-700 leading-relaxed">
                          {translatedSections[currentSection].translatedContent}
                        </p>
                      ) : translatedSections[currentSection]?.status === 'error' ? (
                        <p className="text-red-600">翻訳エラーが発生しました</p>
                      ) : currentSection === sections.findIndex((_, i) => i === currentSection) && isTranslating ? (
                        <p className="text-blue-600">翻訳中...</p>
                      ) : (
                        <p className="text-gray-500">未翻訳</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaperTranslatorApp;