// arxiv-mcp server client
const MCP_ENDPOINT =
  process.env.NEXT_PUBLIC_ARXIV_MCP_URL || "http://localhost:8000";

export async function fetchPaperContent(arxivId: string): Promise<string> {
  // 1. Try to read paper directly (may already be downloaded)
  try {
    const readRes = await fetch(
      `${MCP_ENDPOINT}/read_paper?paper_id=${encodeURIComponent(arxivId)}`
    );
    if (readRes.ok) {
      const readJson = await readRes.json();
      if (readJson?.content) return readJson.content as string;
    }
  } catch (_) {}

  // 2. Download then read
  const dlRes = await fetch(`${MCP_ENDPOINT}/download_paper`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paper_id: arxivId }),
  });
  if (!dlRes.ok) {
    throw new Error("論文のダウンロードに失敗しました。");
  }

  const readRes2 = await fetch(
    `${MCP_ENDPOINT}/read_paper?paper_id=${encodeURIComponent(arxivId)}`
  );
  if (!readRes2.ok) {
    throw new Error("論文の読み込みに失敗しました。");
  }
  const readJson2 = await readRes2.json();
  if (!readJson2?.content) {
    throw new Error("論文の内容を取得できませんでした。");
  }
  return readJson2.content as string;
}
