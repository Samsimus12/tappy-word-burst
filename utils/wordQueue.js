import { BASE_WORDS } from '../constants/wordList';

let pool = BASE_WORDS;
let queue = [];

function refill() {
  queue = [...pool].sort(() => Math.random() - 0.5);
}

export function initQueue(words) {
  pool = words;
  queue = [...pool].sort(() => Math.random() - 0.5);
}

export function nextWord() {
  if (queue.length === 0) refill();
  return queue.pop();
}
