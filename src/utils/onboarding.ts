/**
 * Duolingo-style icons for onboarding options.
 * Uses exact same emojis & SVG approach as Duolingo.
 */

export function getOptionIcon(fieldName: string, option: string): string {
  const barIcon = (filled: number, total = 5) => {
    const bars = Array.from({ length: total }, (_, i) => {
      const h = 6 + i * 4;
      const lit = i < filled;
      return `<rect x="${i * 7}" y="${28 - h}" width="5" height="${h}" rx="1.5" fill="${lit ? '#58a5f0' : '#374151'}"/>`;
    }).join('');
    return `<svg viewBox="0 0 34 30" width="28" height="28" xmlns="http://www.w3.org/2000/svg">${bars}</svg>`;
  };

  const em = (e: string) => `<span style="font-size:1.55em;line-height:1">${e}</span>`;

  // ── Flag emojis (same as Duolingo) ──
  const flags: Record<string, string> = {
    English: '🇺🇸', Russian: '🇷🇺', Arabic: '🇸🇦', Spanish: '🇪🇸',
    French: '🇫🇷', German: '🇩🇪', Chinese: '🇨🇳', Japanese: '🇯🇵',
    Korean: '🇰🇷', Italian: '🇮🇹', Portuguese: '🇵🇹', Turkish: '🇹🇷',
    Hindi: '🇮🇳', Uzbek: '🇺🇿',
  };

  // ── Purpose / learning goal ──
  const purposeIcons: Record<string, string> = {
    Travel: em('✈️'), 'Business Work': em('💼'), 'Study Abroad': em('🎓'),
    'Personal Interest': em('🧠'), 'Family Friends': em('👨‍👩‍👧‍👦'), Immigration: em('🏠'),
    'Career Change': em('💼'), 'Exam Preparation': em('📝'), 'Cultural Understanding': em('🎭'),
    'Brain Training': em('🧠'), 'Just for fun': em('🧠'), 'Prepare for travel': em('✈️'),
    'Boost my career': em('💼'), 'Connect with people': em('👨‍👩‍👧‍👦'), 'Support my education': em('🎓'),
    'Spend time productively': em('🧠'), Other: em('💬'),
  };

  // ── Interests ──
  const interestIcons: Record<string, string> = {
    Business: em('💼'), 'Business & Work': em('💼'),
    Travel: em('✈️'), 'Travel & Tourism': em('✈️'),
    Food: em('🍕'), 'Food & Cooking': em('🍕'),
    Sports: em('⚽'), 'Sports & Fitness': em('⚽'),
    Technology: em('💻'),
    Health: em('💪'), 'Health & Wellness': em('💪'),
    Education: em('🎓'), 'Education & Learning': em('🎓'),
    Culture: em('🎭'), 'Culture & Arts': em('🎭'),
    Daily: em('☀️'), Entertainment: em('🎬'), Shopping: em('🛍️'),
  };

  // ── Referral source (colored SVG icons) ──
  const referralIcons: Record<string, string> = {
    // Exact API values
    'Social Media': `<svg viewBox="0 0 32 32" width="32" height="32"><rect width="32" height="32" rx="7" fill="#8b5cf6"/><path d="M11 14a3 3 0 100-6 3 3 0 000 6zm10 0a3 3 0 100-6 3 3 0 000 6zm-5 2a3 3 0 100-6 3 3 0 000 6zm-5 8c0-3 2-5 5-5s5 2 5 5" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round"/><path d="M7 22c0-2 1.5-4 4-4m10 4c0-2-1.5-4-4-4" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    Friends: `<svg viewBox="0 0 32 32" width="32" height="32"><circle cx="12" cy="10" r="5" fill="#fbbf24"/><path d="M3 27c0-5 4-9 9-9s9 4 9 9" fill="#fbbf24" opacity="0.8"/><circle cx="22" cy="11" r="4" fill="#f97316"/><path d="M15 27c0-4 3-7 7-7s7 3 7 7" fill="#f97316" opacity="0.8"/></svg>`,
    'Friends/family': `<svg viewBox="0 0 32 32" width="32" height="32"><circle cx="12" cy="10" r="5" fill="#fbbf24"/><path d="M3 27c0-5 4-9 9-9s9 4 9 9" fill="#fbbf24" opacity="0.8"/><circle cx="22" cy="11" r="4" fill="#f97316"/><path d="M15 27c0-4 3-7 7-7s7 3 7 7" fill="#f97316" opacity="0.8"/></svg>`,
    Family: `<svg viewBox="0 0 32 32" width="32" height="32"><circle cx="10" cy="9" r="4" fill="#f472b6"/><circle cx="22" cy="9" r="4" fill="#60a5fa"/><circle cx="16" cy="20" r="3" fill="#fbbf24"/><path d="M4 24c0-3 3-5 6-5s6 2 6 5" fill="#f472b6" opacity="0.7"/><path d="M16 24c0-3 3-5 6-5s6 2 6 5" fill="#60a5fa" opacity="0.7"/></svg>`,
    Tv: `<svg viewBox="0 0 32 32" width="32" height="32"><rect x="3" y="6" width="26" height="17" rx="3" fill="#6b7280"/><rect x="5" y="8" width="22" height="13" rx="1" fill="#374151"/><rect x="10" y="25" width="12" height="2" rx="1" fill="#6b7280"/></svg>`,
    TV: `<svg viewBox="0 0 32 32" width="32" height="32"><rect x="3" y="6" width="26" height="17" rx="3" fill="#6b7280"/><rect x="5" y="8" width="22" height="13" rx="1" fill="#374151"/><rect x="10" y="25" width="12" height="2" rx="1" fill="#6b7280"/></svg>`,
    Internet: `<svg viewBox="0 0 32 32" width="32" height="32"><circle cx="16" cy="16" r="12" fill="none" stroke="#60a5fa" stroke-width="2"/><ellipse cx="16" cy="16" rx="6" ry="12" fill="none" stroke="#60a5fa" stroke-width="1.8"/><line x1="4" y1="16" x2="28" y2="16" stroke="#60a5fa" stroke-width="1.8"/></svg>`,
    Other: `<svg viewBox="0 0 32 32" width="32" height="32"><circle cx="16" cy="16" r="13" fill="#7c3aed"/><circle cx="10" cy="16" r="2" fill="white"/><circle cx="16" cy="16" r="2" fill="white"/><circle cx="22" cy="16" r="2" fill="white"/></svg>`,
    // Legacy names (in case API returns these)
    YouTube: `<svg viewBox="0 0 32 32" width="32" height="32"><rect width="32" height="32" rx="7" fill="#FF0000"/><polygon points="13,10 13,22 23,16" fill="white"/></svg>`,
    TikTok: `<svg viewBox="0 0 32 32" width="32" height="32"><rect width="32" height="32" rx="7" fill="#010101"/><path d="M22.5 10.2c-1.2-.8-2-2.1-2.2-3.5h-3v12.5a2.8 2.8 0 11-1.8-2.6V13.5a5.8 5.8 0 105.8 5.8V14a8 8 0 004.2 1.2V12a5 5 0 01-3-1.8z" fill="white"/></svg>`,
    'Google Search': `<svg viewBox="0 0 32 32" width="32" height="32"><circle cx="16" cy="16" r="14" fill="white"/><text x="8" y="22" font-size="18" font-weight="900" fill="#4285F4" font-family="Arial">G</text></svg>`,
    'Facebook/Instagram': `<svg viewBox="0 0 32 32" width="32" height="32"><circle cx="16" cy="16" r="14" fill="#1877f2"/><path d="M18 26V17h2.5l.5-3H18v-1.5c0-1 .3-1.5 1.5-1.5H21V8h-2.5C15.5 8 14 9.5 14 12v2h-2v3h2v9z" fill="white"/></svg>`,
    'News/article/blog': `<svg viewBox="0 0 32 32" width="32" height="32"><rect x="4" y="4" width="24" height="24" rx="4" fill="#6b7280"/><rect x="7" y="8" width="10" height="7" rx="1" fill="#9ca3af"/><rect x="7" y="18" width="18" height="2" rx="1" fill="#9ca3af"/><rect x="7" y="22" width="14" height="2" rx="1" fill="#9ca3af"/></svg>`,
  };

  // ── CEFR / proficiency bars ──
  const cefrBars: Record<string, string> = {
    'A1 - Beginner': barIcon(1), A1: barIcon(1),
    'A2 - Elementary': barIcon(2), A2: barIcon(2),
    'B1 - Intermediate': barIcon(3), B1: barIcon(3),
    'B2 - Upper Intermediate': barIcon(4), B2: barIcon(4),
    'C1 - Advanced': barIcon(5), C1: barIcon(5),
    'C2 - Proficient': barIcon(5), C2: barIcon(5),
    Beginner: barIcon(1), Elementary: barIcon(2),
    Intermediate: barIcon(3), 'Upper-Intermediate': barIcon(4), Advanced: barIcon(5),
  };

  if (fieldName === 'native_language' || fieldName === 'target_language') {
    return flags[option] || '🌐';
  }
  if (fieldName === 'cefr_level' || fieldName === 'proficiency_level') {
    return cefrBars[option] || barIcon(1);
  }
  if (fieldName === 'referral_source') return referralIcons[option] || referralIcons['Other'];
  if (fieldName === 'purpose' || fieldName === 'learning_goal') return purposeIcons[option] || em('✨');
  if (fieldName === 'interests') return interestIcons[option] || em('✨');
  if (fieldName === 'study_time') return ''; // study_time uses no icon (Duolingo style)
  return referralIcons[option] || purposeIcons[option] || interestIcons[option] || cefrBars[option] || em('✨');
}

/**
 * Subtitle text shown to the right or below option.
 * For proficiency, this IS the display text (Duolingo shows "I'm new to Russian", not "A1").
 * For study_time, this is the right-aligned label like "Casual", "Regular", etc.
 */
export function getOptionSubtitle(fieldName: string, option: string): string {
  const subtitles: Record<string, Record<string, string>> = {
    cefr_level: {
      A1: "I'm new", A2: 'I know some common words',
      B1: 'I can have basic conversations', B2: 'I can talk about various topics',
      C1: 'I can discuss most topics in detail', C2: 'I am highly proficient',
      'A1 - Beginner': "I'm new", 'A2 - Elementary': 'I know some common words',
      'B1 - Intermediate': 'I can have basic conversations', 'B2 - Upper Intermediate': 'I can talk about various topics',
      'C1 - Advanced': 'I can discuss most topics in detail', 'C2 - Proficient': 'I am highly proficient',
    },
    proficiency_level: {
      Beginner: "I'm new to this language", Elementary: 'I know basic words and phrases',
      Intermediate: 'I can have simple conversations', 'Upper-Intermediate': 'I can discuss many topics',
      Advanced: 'I am highly proficient',
    },
    study_time: {
      '10-15 min': 'Casual', '15-30 min': 'Regular', '30-60 min': 'Serious', '1+ hour': 'Intense',
      '5 min': 'Casual', '10 min': 'Regular', '15 min': 'Serious', '20 min': 'Intense',
    },
    learning_goal: {
      Travel: 'Prepare for travel', Career: 'Boost my career',
      Education: 'Support my education', 'Personal Interest': 'Just for fun',
      Family: 'Connect with people', Culture: 'Explore culture and arts',
    },
  };
  return subtitles[fieldName]?.[option] || '';
}

export const LANGUAGE_MAP: Record<string, string> = {
  English: 'en', Russian: 'ru', Arabic: 'ar', Spanish: 'es',
  French: 'fr', German: 'de', Chinese: 'zh', Japanese: 'ja',
  Korean: 'ko', Italian: 'it', Portuguese: 'pt', Turkish: 'tr',
  Hindi: 'hi', Uzbek: 'uz',
};
