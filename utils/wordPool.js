import { BASE_WORDS } from '../constants/wordList';
import { fetchRelatedWords } from './datamuse';

export async function buildWordPool() {
  const pool = new Set(BASE_WORDS);

  const results = await Promise.allSettled(
    BASE_WORDS.map(word => fetchRelatedWords(word))
  );

  results.forEach(result => {
    if (result.status === 'fulfilled') {
      result.value
        .filter(w => w.length >= 3)
        .forEach(w => pool.add(w));
    }
  });

  return [...pool];
}
