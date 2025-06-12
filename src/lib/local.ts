export class LocalSummarizer {
  private endpoint: string;
  constructor(endpoint?: string) {
    this.endpoint =
      endpoint ||
      (process.env.NEXT_PUBLIC_LOCAL_SUMMARIZER_URL ??
        "http://localhost:5001/summarize");
  }

  async generateSummary(text: string): Promise<string> {
    const res = await fetch(this.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      throw new Error("ローカル要約サーバーでエラーが発生しました。");
    }

    const data = await res.json();
    return data.summary || data.text || "";
  }
}
