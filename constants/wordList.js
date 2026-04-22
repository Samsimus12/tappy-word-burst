export const BASE_WORDS = [
  // emotions & mental states
  'happy', 'sad', 'angry', 'afraid', 'tired', 'proud', 'shy', 'calm', 'wild',
  'brave', 'lazy', 'greedy', 'strange', 'funny', 'clever', 'honest', 'cruel',
  'gentle', 'kind',
  'cheerful', 'gloomy', 'nervous', 'anxious', 'eager', 'excited', 'bored',
  'curious', 'lonely', 'jealous', 'hopeful', 'content', 'furious', 'joyful',
  'miserable', 'grateful', 'confused', 'humble', 'sincere', 'wicked',
  'ashamed', 'restless', 'fearless', 'timid', 'bold',

  // physical descriptors
  'big', 'small', 'fast', 'slow', 'cold', 'hot', 'dark', 'bright', 'quiet',
  'loud', 'old', 'young', 'strong', 'weak', 'heavy', 'light', 'deep', 'soft',
  'hard', 'fresh', 'sharp', 'smooth', 'rough', 'sweet', 'empty', 'full',
  'clean', 'dirty', 'safe', 'plain',
  'wet', 'dry', 'thin', 'thick', 'tall', 'short', 'wide', 'flat', 'loose',
  'tight', 'warm', 'cool', 'pale', 'dim', 'raw', 'bare', 'neat', 'messy',
  'stiff', 'steep', 'vivid', 'faint', 'dense', 'dull', 'crooked',

  // character & moral qualities
  'rich', 'poor', 'beautiful', 'ugly',
  'loyal', 'selfish', 'generous', 'modest', 'rude', 'polite', 'stubborn',
  'patient', 'reckless', 'cautious', 'noble', 'fierce', 'clumsy', 'graceful',
  'lively', 'careless', 'diligent', 'cowardly', 'strict',

  // verbs
  'love', 'hate', 'help', 'start', 'stop',
  'grow', 'break', 'hide', 'fight', 'gather', 'teach', 'learn', 'create',
  'destroy', 'protect', 'search', 'follow', 'fix', 'earn', 'save', 'waste',
  'choose', 'change', 'find', 'give', 'take', 'show', 'push', 'pull',
  'shout', 'whisper', 'rush', 'fall', 'rise',
];

export const DISTRACTOR_WORDS = [
  // household objects
  'table', 'chair', 'window', 'door', 'book', 'phone', 'carpet', 'mirror',
  'ladder', 'basket', 'barrel', 'candle', 'lantern', 'anchor', 'compass',
  'blanket', 'curtain', 'cabinet', 'hammer', 'scissors', 'needle', 'bottle',
  'bucket', 'shovel', 'bridge', 'tower', 'castle', 'temple', 'statue',
  'fountain', 'tunnel', 'telescope', 'calendar', 'envelope', 'medal', 'trophy',
  'coin', 'wallet', 'umbrella', 'helmet', 'glove', 'boot', 'belt', 'button',
  'drawer', 'pillow', 'fence', 'gate',

  // nature & places
  'water', 'fire', 'tree', 'road', 'cloud', 'stone', 'river', 'mountain',
  'city', 'house', 'garden', 'ocean', 'forest', 'island',
  'valley', 'canyon', 'desert', 'jungle', 'meadow', 'cliff', 'cave', 'glacier',
  'volcano', 'crater', 'marsh', 'plateau', 'lagoon', 'bay', 'creek', 'pond',
  'dune', 'pebble', 'petal', 'thorn', 'branch', 'seed', 'bloom', 'stem',

  // animals
  'cat', 'dog', 'bird', 'fish', 'rabbit', 'tiger', 'horse', 'elephant',
  'monkey', 'dolphin', 'wolf', 'bear', 'deer', 'snake', 'frog', 'eagle',
  'owl', 'crow', 'swan', 'penguin', 'whale', 'shark', 'turtle', 'lizard',
  'butterfly', 'spider', 'fox', 'lion', 'zebra', 'giraffe', 'camel', 'panda',
  'lobster', 'beetle', 'flamingo',

  // food & drink
  'pizza', 'bread', 'coffee', 'sugar', 'butter', 'pepper', 'lemon', 'apple',
  'mango', 'milk', 'cheese', 'honey', 'rice', 'pasta', 'soup', 'carrot',
  'onion', 'potato', 'tomato', 'banana', 'grape', 'peach', 'cherry', 'walnut',
  'chocolate', 'candy', 'cereal', 'yogurt', 'noodle', 'sushi',

  // people & roles
  'soldier', 'doctor', 'farmer', 'hunter', 'sailor', 'scholar', 'merchant',
  'captain', 'pilot', 'knight', 'stranger', 'neighbor', 'rival', 'champion',
  'veteran', 'traveler',

  // action verbs (clearly not adjective synonyms)
  'jump', 'swim', 'cook', 'drive', 'write', 'paint', 'sing', 'dance',
  'build', 'climb', 'float', 'slide', 'crawl', 'march', 'stumble', 'shuffle',
  'wander', 'drift', 'hover', 'spin', 'bounce', 'melt', 'carve', 'weave',
  'peel', 'slice', 'boil', 'bake', 'pour', 'splash', 'drip', 'erupt',
  'collapse',

  // directions & positions
  'north', 'south', 'east', 'west', 'above', 'below', 'inside', 'outside',

  // abstract nouns
  'science', 'history', 'music', 'poetry', 'language', 'culture', 'nature',
  'freedom', 'justice', 'peace', 'shadow', 'echo', 'flame', 'storm',
  'thunder', 'lightning', 'breeze', 'frost', 'steam', 'smoke', 'spark',
  'ripple', 'wave', 'tide', 'rhythm', 'melody', 'harmony', 'chaos', 'order',
  'mystery', 'legend', 'myth', 'riddle', 'symbol', 'signal', 'border',
  'layer', 'pattern', 'texture',

  // body parts
  'finger', 'shoulder', 'knee', 'ankle', 'stomach', 'brain', 'spine', 'tongue',

  // time
  'summer', 'winter', 'morning', 'evening', 'century', 'decade', 'moment',
  'future', 'memory', 'spring', 'autumn', 'midnight', 'noon', 'dawn', 'dusk',
  'sunrise', 'weekend', 'season', 'holiday',

  // colors & materials
  'silver', 'golden', 'purple', 'orange', 'yellow', 'violet',
  'plastic', 'wooden', 'crystal', 'rubber', 'copper', 'cotton', 'velvet',

  // descriptive (clearly non-synonym adjectives)
  'narrow', 'hollow', 'distant', 'central', 'coastal', 'tropical', 'urban',
  'ancient', 'modern', 'digital', 'natural', 'global', 'local', 'random',
  'primary', 'secondary', 'vertical', 'circular', 'parallel', 'diagonal',
  'magnetic', 'elastic', 'acoustic', 'electric', 'atomic', 'cosmic', 'arctic',
  'volcanic', 'lunar', 'solar', 'marine', 'thermal', 'optical', 'geometric',
];
