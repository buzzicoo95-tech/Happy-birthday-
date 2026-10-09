import { UserAnswers, MyPreferences, MatchCategoryResult } from '../types';

/**
 * Normalizes text for comparison (lowercase, trimmed, stripped of punctuation)
 */
function clean(str?: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .trim();
}

/**
 * Computes category match score between friend's answer and my answer
 * Returns score: 1 for exact match, 0.5-0.75 for partial/related, 0 for different.
 */
export function evaluateCategoryMatch(
  category: keyof MyPreferences,
  userVal: string | string[],
  myVal: string | string[]
): { score: number; isMatch: boolean; note?: string } {
  // Handle multi-select array comparison (food, clothes, subjects)
  if (Array.isArray(userVal) || Array.isArray(myVal)) {
    const uArr = (Array.isArray(userVal) ? userVal : [userVal]).map(clean).filter(Boolean);
    const mArr = (Array.isArray(myVal) ? myVal : [myVal]).map(clean).filter(Boolean);

    if (uArr.length === 0 || mArr.length === 0) {
      return { score: 0, isMatch: false };
    }

    // Find shared items (exact or substring match)
    const shared = uArr.filter(u =>
      mArr.some(m => u === m || u.includes(m) || m.includes(u))
    );

    if (shared.length > 0) {
      const matchRatio = shared.length / Math.max(1, Math.min(uArr.length, mArr.length));
      const score = Math.min(1.0, Math.max(0.5, matchRatio));
      const label =
        category === 'favoriteFood'
          ? 'foods'
          : category === 'favoriteClothes'
          ? 'styles'
          : category === 'favoriteSubjects'
          ? 'subjects'
          : 'items';
      return {
        score,
        isMatch: true,
        note: `${shared.length} shared ${label}! 💕`
      };
    }

    return { score: 0, isMatch: false };
  }

  const u = clean(userVal as string);
  const m = clean(myVal as string);

  if (!u || !m) {
    return { score: 0, isMatch: false };
  }

  // Exact or substring match
  if (u === m || u.includes(m) || m.includes(u)) {
    return { score: 1.0, isMatch: true };
  }

  // Drink: Tea, Coffee, Both
  if (category === 'drink') {
    if (u.includes('both') || m.includes('both')) {
      return { score: 0.6, isMatch: true, note: 'Open to both!' };
    }
  }

  // Morning / Night
  if (category === 'timePreference') {
    if ((u.includes('morning') && m.includes('morning')) || (u.includes('night') && m.includes('night'))) {
      return { score: 1.0, isMatch: true };
    }
    if (u.includes('both') || m.includes('both') || u.includes('afternoon')) {
      return { score: 0.5, isMatch: true, note: 'Close enough!' };
    }
  }

  // Sweet / Spicy
  if (category === 'tastePreference') {
    if ((u.includes('sweet') && m.includes('sweet')) || (u.includes('spicy') && m.includes('spicy'))) {
      return { score: 1.0, isMatch: true };
    }
    if (u.includes('both') || m.includes('both')) {
      return { score: 0.6, isMatch: true, note: 'Flavor adventurous!' };
    }
  }

  // Favorite Clothes
  if (category === 'favoriteClothes') {
    if (u.includes(m) || m.includes(u)) return { score: 1.0, isMatch: true };
    if ((u.includes('casual') && m.includes('oversized')) || (u.includes('street') && m.includes('casual'))) {
      return { score: 0.6, isMatch: true, note: 'Similar relaxed vibe' };
    }
  }

  // Favorite Food
  if (category === 'favoriteFood') {
    if (u.includes(m) || m.includes(u)) return { score: 1.0, isMatch: true };
  }

  // Favorite Color
  if (category === 'favoriteColor') {
    if ((u.includes('black') || u.includes('obsidian')) && (m.includes('black') || m.includes('obsidian'))) {
      return { score: 1.0, isMatch: true };
    }
    // Check primary color words
    const colors = ['blue', 'red', 'green', 'purple', 'black', 'white', 'gold', 'yellow', 'pink', 'lavender', 'cyan'];
    for (const c of colors) {
      if (u.includes(c) && m.includes(c)) {
        return { score: 1.0, isMatch: true };
      }
    }
  }

  // Favorite Sport
  if (category === 'favoriteSport') {
    if (
      (u.includes('football') || u.includes('soccer')) &&
      (m.includes('football') || m.includes('soccer'))
    ) {
      return { score: 1.0, isMatch: true };
    }
  }

  // Dream Destination (Sacred Islamic pilgrimages)
  if (category === 'dreamDestination') {
    if (
      (u.includes('hajj') && m.includes('hajj')) ||
      (u.includes('umrah') && m.includes('umrah')) ||
      (u.includes('makkah') && (m.includes('hajj') || m.includes('umrah'))) ||
      (u.includes('madinah') && (m.includes('hajj') || m.includes('umrah')))
    ) {
      return { score: 1.0, isMatch: true, note: 'Sacred journey 🤲' };
    }
  }

  // Word token overlap for free-text answers (movies, sports, places, hobbies, destinations)
  const uWords = u.split(/\s+/).filter(w => w.length > 3);
  const mWords = m.split(/\s+/).filter(w => w.length > 3);
  const shared = uWords.filter(w => mWords.includes(w));
  if (shared.length > 0) {
    return { score: 0.7, isMatch: true, note: 'Common elements' };
  }

  return { score: 0, isMatch: false };
}

export const CATEGORY_METADATA: Record<
  keyof MyPreferences,
  { label: string; icon: string }
> = {
  favoriteColor: { label: 'Favorite Color', icon: '🎨' },
  favoriteFood: { label: 'Favorite Foods', icon: '🍲' },
  favoriteClothes: { label: 'Favorite Clothes', icon: '👗' },
  favoriteMovie: { label: 'Favorite Movie', icon: '🎬' },
  favoriteSubjects: { label: 'Favorite Subjects', icon: '📚' },
  favoriteSport: { label: 'Favorite Sport', icon: '⚽' },
  favoritePlace: { label: 'Favorite Place', icon: '🏔️' },
  drink: { label: 'Tea or Coffee', icon: '☕' },
  timePreference: { label: 'Morning or Night', icon: '🌅' },
  tastePreference: { label: 'Sweet or Spicy', icon: '🍫' },
  favoriteHobby: { label: 'Favorite Hobby', icon: '🎯' },
  dreamDestination: { label: 'Dream Destination', icon: '🕋' }
};

export const CATEGORY_KEYS: (keyof MyPreferences)[] = [
  'favoriteColor',
  'favoriteFood',
  'favoriteClothes',
  'favoriteMovie',
  'favoriteSubjects',
  'favoriteSport',
  'favoritePlace',
  'drink',
  'timePreference',
  'tastePreference',
  'favoriteHobby',
  'dreamDestination'
];

/**
 * Calculates current similarity percentage and detailed breakdown
 */
export function calculateMatchDetails(
  userAnswers: Partial<UserAnswers>,
  myPreferences: MyPreferences
) {
  let totalScore = 0;
  let evaluatedCount = 0;
  const breakdown: MatchCategoryResult[] = [];

  for (const key of CATEGORY_KEYS) {
    const userAns = userAnswers[key];
    const myAns = myPreferences[key];

    const hasUserAns = Array.isArray(userAns)
      ? userAns.length > 0
      : (userAns !== undefined && userAns !== '');

    if (hasUserAns && userAns !== undefined) {
      evaluatedCount++;
      const { score, isMatch, note } = evaluateCategoryMatch(key, userAns, myAns || '');
      totalScore += score;
      breakdown.push({
        category: key,
        icon: CATEGORY_METADATA[key].icon,
        label: CATEGORY_METADATA[key].label,
        userAnswer: userAns,
        myAnswer: myAns || '',
        isMatch,
        score,
        matchNote: note
      });
    }
  }

  // Base percentage calculation on categories that are defined in Farhan's preferences
  const activeEvaluatedCount = breakdown.filter(b => {
    if (Array.isArray(b.myAnswer)) return b.myAnswer.length > 0;
    return (b.myAnswer || '').trim() !== '';
  }).length;
  const maxPossible = activeEvaluatedCount > 0 ? activeEvaluatedCount : 8;
  const percentage = Math.min(100, Math.round((totalScore / maxPossible) * 100));

  return {
    percentage,
    evaluatedCount,
    totalMatches: breakdown.filter(b => b.isMatch).length,
    breakdown
  };
}

/**
 * Message based on score
 */
export function getScoreMessage(score: number): { title: string; subtitle: string; emoji: string } {
  if (score <= 25) {
    return {
      title: "😅 We're pretty different!",
      subtitle: "Opposites attract, and that's exactly why our dynamic is so special & fun!",
      emoji: "😅"
    };
  }
  if (score <= 50) {
    return {
      title: "🙂 Some things match!",
      subtitle: "We have our own unique quirks, but we click where it matters most.",
      emoji: "🙂"
    };
  }
  if (score <= 75) {
    return {
      title: "😊 We're quite similar!",
      subtitle: "We share so many favorite things! It's always effortless hanging out.",
      emoji: "😊"
    };
  }
  if (score <= 90) {
    return {
      title: "❤️ Strong Connection!",
      subtitle: "Our tastes and vibes align like magic. Truly a rare and beautiful bond!",
      emoji: "❤️"
    };
  }
  return {
    title: "🔥 Okay... Are We Secretly Twins?! 😂",
    subtitle: "It's honestly scary how in-sync our minds are! 100% soul connection!",
    emoji: "🔥"
  };
}

/**
 * Toast feedback for each answered category
 */
const MATCH_FEEDBACKS = [
  "Wait... You like that too? 👀❤️",
  "Okay, that's another one! 💕",
  "We're getting suspiciously similar 😂💗",
  "Another match! 💕",
  "Great minds really do think alike! ✨"
];

const DIFFERENCE_FEEDBACKS = [
  "Interesting... we're different here 😄",
  "Maybe that's what makes our friendship fun.",
  "I love how uniquely you see things! ✨",
  "A little variety keeps things exciting! 🌸"
];

export function getRandomFeedback(isMatch: boolean): string {
  const list = isMatch ? MATCH_FEEDBACKS : DIFFERENCE_FEEDBACKS;
  return list[Math.floor(Math.random() * list.length)];
}
