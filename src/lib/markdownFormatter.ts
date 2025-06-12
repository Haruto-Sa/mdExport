export async function formatMarkdown(markdown: string): Promise<string> {
  const endpoint =
    process.env.NEXT_PUBLIC_MARKDOWN_MCP_URL || "http://localhost:8010";
  try {
    const res = await fetch(`${endpoint}/format_markdown`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markdown }),
    });
    if (res.ok) {
      const data = await res.json();
      return data?.formatted || markdown;
    }
  } catch (_) {}
  // fall back
  return markdown;
}
