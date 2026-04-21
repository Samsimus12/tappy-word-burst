export const THEMES = {
  default:  { id: 'default',  label: 'Cosmic',   bg: '#0f0f2e', header: '#1a1a40', card: '#1e1e4a', bubble: '#3b3b8f', accent: '#6366f1' },
  midnight: { id: 'midnight', label: 'Midnight', bg: '#06060f', header: '#0b0b1a', card: '#0f0f28', bubble: '#1a1a48', accent: '#818cf8' },
  forest:   { id: 'forest',   label: 'Forest',   bg: '#0a1a0e', header: '#0e2214', card: '#122b1a', bubble: '#1a4025', accent: '#22c55e' },
  crimson:  { id: 'crimson',  label: 'Crimson',  bg: '#1a0808', header: '#250c0c', card: '#2d1010', bubble: '#4a1818', accent: '#ef4444' },
  ocean:    { id: 'ocean',    label: 'Ocean',    bg: '#031520', header: '#061e2e', card: '#09263c', bubble: '#0d3558', accent: '#22d3ee' },
  gold:     { id: 'gold',     label: 'Gold',     bg: '#15100a', header: '#1e1708', card: '#271f0a', bubble: '#3d2f08', accent: '#fbbf24' },
  neon:     { id: 'neon',     label: 'Neon',     bg: '#0a0014', header: '#12001e', card: '#18002a', bubble: '#26004a', accent: '#a855f7' },
  rose:     { id: 'rose',     label: 'Rose',     bg: '#180a10', header: '#220e18', card: '#2a1220', bubble: '#421d34', accent: '#f43f5e' },
};

export const ACHIEVEMENTS = [
  { id: 'first_game',  label: 'First Steps',   desc: 'Play your first game',                icon: '🎮', unlocksTheme: null },
  { id: 'clean_sweep', label: 'Clean Sweep',   desc: 'Finish a round with no wrong taps',   icon: '✨', unlocksTheme: 'midnight' },
  { id: 'speed_demon', label: 'Speed Demon',   desc: 'Complete a round with 15+ seconds left', icon: '⚡', unlocksTheme: null },
  { id: 'hard_hero',   label: 'Hard Hero',     desc: 'Complete a Hard difficulty round',     icon: '💎', unlocksTheme: 'crimson' },
  { id: 'explorer',    label: 'Explorer',      desc: 'Play all 3 game modes',                icon: '🗺️', unlocksTheme: 'ocean' },
  { id: 'survival_5',  label: 'Survivor',      desc: 'Solve 5 words in Survival Mode',       icon: '💪', unlocksTheme: 'neon' },
  { id: 'survival_10', label: 'Apex Survivor', desc: 'Solve 10 words in Survival Mode',      icon: '🔥', unlocksTheme: null },
  { id: 'score_500',   label: 'High Scorer',   desc: 'Reach a total score of 500',           icon: '🏆', unlocksTheme: 'forest' },
  { id: 'score_1000',  label: 'Word Master',   desc: 'Reach a total score of 1000',          icon: '👑', unlocksTheme: 'gold' },
  { id: 'round_5',     label: 'On a Roll',     desc: 'Reach round 5 in Normal Mode',         icon: '🌹', unlocksTheme: 'rose' },
];
