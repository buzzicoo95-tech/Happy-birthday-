export interface UserAnswers {
  name: string;
  birthday: string;
  feeling: string;
  favoriteColor: string;
  favoriteFood: string;
  favoriteClothes: string;
  favoriteMovie: string;
  favoriteSong: string;
  favoriteSport: string;
  favoritePlace: string;
  drink: string;
  timePreference: string;
  tastePreference: string;
  favoriteHobby: string;
  dreamDestination: string;
}

export interface MyPreferences {
  favoriteColor: string;
  favoriteFood: string;
  favoriteClothes: string;
  favoriteMovie: string;
  favoriteSong: string;
  favoriteSport: string;
  favoritePlace: string;
  drink: string;
  timePreference: string;
  tastePreference: string;
  favoriteHobby: string;
  dreamDestination: string;
}

export interface MemoryItem {
  image: string;
  caption: string;
  date?: string;
}

export interface MatchCategoryResult {
  category: string;
  icon: string;
  label: string;
  userAnswer: string;
  myAnswer: string;
  isMatch: boolean;
  score: number; // 0 to 1
  matchNote?: string;
}

export type StepKey =
  | 'name'
  | 'welcome'
  | 'privacy_notice'
  | 'birthday'
  | 'feeling'
  | 'favoriteColor'
  | 'favoriteFood'
  | 'favoriteClothes'
  | 'favoriteMovie'
  | 'favoriteSong'
  | 'favoriteSport'
  | 'favoritePlace'
  | 'drink'
  | 'timePreference'
  | 'tastePreference'
  | 'favoriteHobby'
  | 'dreamDestination'
  | 'final_match'
  | 'open_gift'
  | 'personal_letter'
  | 'me_vs_you'
  | 'memories'
  | 'birthday_reveal';

export type StatusStyle = 'luxury' | 'friendship' | 'minimal';
