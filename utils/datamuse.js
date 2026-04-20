const BASE_URL = 'https://api.datamuse.com';
const TIMEOUT_MS = 6000;

export async function fetchSynonyms(word) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(
      `${BASE_URL}/words?rel_syn=${encodeURIComponent(word)}&max=20`,
      { signal: controller.signal }
    );
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = await res.json();
    return data.map(item => item.word);
  } finally {
    clearTimeout(timer);
  }
}
