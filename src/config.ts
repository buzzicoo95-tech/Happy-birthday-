import { MyPreferences, MemoryItem } from './types';

// =========================================================================
// PERSONAL CUSTOMIZATION
// (Edit these values to personalize the experience for your friend)
// =========================================================================

/**
 * Your name (The sender)
 */
export const MY_NAME = "Farhan";

/**
 * Your personal preferences for the 12 compatibility categories.
 * The friend's answers will be compared against these to compute the live match score.
 * (These values will remain SECRET until the "Me vs You" reveal stage).
 */
export const MY_PREFERENCES: MyPreferences = {
  favoriteColor: "Black",
  favoriteFood: "",
  favoriteClothes: "",
  favoriteMovie: "Titanic",
  favoriteSong: "",
  favoriteSport: "Football",
  favoritePlace: "Skardu",
  drink: "Tea",
  timePreference: "Morning",
  tastePreference: "Sweet",
  favoriteHobby: "",
  dreamDestination: "Hajj and Umrah"
};

/**
 * Your personal letter to your friend.
 * Revealed line-by-line after they open their interactive gift box.
 */
export const PERSONAL_LETTER = `Dear Friend,

Happy Birthday! 🎂

Looking back at our friendship, every memory, inside joke, and late-night conversation has meant the world to me. You bring so much energy, kindness, and warmth into every room you walk into.

Thank you for being someone I can always count on, laugh with until our stomachs hurt, and share life's sweetest moments with.

As you begin this new chapter, I hope all your boldest dreams come true. May this year shower you with unforgettable adventures, endless joy, good health, and boundless happiness.

No matter where life takes us, I’ll always have your back.

With all my love and best wishes,
Farhan ❤️`;

/**
 * Memory / Photo section.
 * Add URLs and captions for your favorite memories together.
 * NOTE: If this array is empty ([]), the memories section will automatically hide gracefully.
 */
export const MEMORIES: MemoryItem[] = [
  {
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1000&q=80",
    caption: "That unforgettable road trip adventure under the open sky! 🚗✨",
    date: "Summer Memories"
  },
  {
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1000&q=80",
    caption: "Endless laughter, late-night cafe talks, and good times. ☕🍕",
    date: "Golden Moments"
  },
  {
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80",
    caption: "Celebrating another milestone year of unbreakable friendship! 🎉❤️",
    date: "Unforgettable"
  }
];

/**
 * Google Apps Script Web App Endpoint.
 * Submits the completed survey responses to your personal Google Sheet.
 * Paste your deployed Web App URL here (e.g. "https://script.google.com/macros/s/AKfycb.../exec").
 * If left as default, the app functions normally without breaking or displaying technical errors.
 */
export const GOOGLE_APPS_SCRIPT_URL = "PASTE_YOUR_DEPLOYED_APPS_SCRIPT_URL_HERE";

// =====================================
// AUDIO / SOUND SYSTEM CONFIGURATION
// =====================================

/**
 * Background birthday song file path.
 * If this audio file exists in public/assets/, it will play softly in the background.
 * If absent, synthesized gentle melody chimes are used seamlessly.
 */
export const BIRTHDAY_AUDIO_FILE = "assets/happy-birthday-asghar-khoso.mp3";

/**
 * Birthday celebration sound effect (played once upon the grand birthday reveal).
 */
export const BIRTHDAY_SOUND = "assets/happy-birthday-celebration.mp3";

/**
 * UI sound effects (soft click, soft pop, soft success chime)
 */
export const SOUND_CLICK = "assets/click.mp3";
export const SOUND_POP = "assets/pop.mp3";
export const SOUND_SUCCESS = "assets/success.mp3";
