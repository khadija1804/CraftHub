export async function translateText(text, target, source) {
  const res = await fetch("http://localhost:5010/ai/translate", { // Option A (Flask)
    // ou "http://localhost:5000/ai/translate" si Option B (Node)
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ text, target, source })
  });
  if (!res.ok) throw new Error("Échec de la traduction");
  return res.json(); // { translation, source, target }
}

export async function generateRAG({ keywords, contexteProduitMinimal }) {
  const res = await fetch("http://localhost:5010/ai/generate-rag", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ keywords, contexteProduitMinimal })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Échec de la génération SEO");
  }
  return res.json(); // { descriptionHtml }
}