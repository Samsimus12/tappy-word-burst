const BASE_URL = 'https://api.datamuse.com';
const TIMEOUT_MS = 6000;

const MIN_FREQUENCY = 3.0;

async function datamuse(params) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const query = new URLSearchParams({ ...params, md: 'f' }).toString();
    const res = await fetch(`${BASE_URL}/words?${query}`, { signal: controller.signal });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = await res.json();
    return data
      .filter(item => {
        if (/[\s-]/.test(item.word)) return false;
        const freqTag = item.tags?.find(t => t.startsWith('f:'));
        if (!freqTag) return false;
        return parseFloat(freqTag.slice(2)) >= MIN_FREQUENCY;
      })
      .map(item => item.word);
  } finally {
    clearTimeout(timer);
  }
}

export function fetchSynonyms(word) {
  return datamuse({ rel_syn: word, max: 30 });
}

export function fetchRelatedWords(word) {
  return datamuse({ ml: word, max: 50 });
}
