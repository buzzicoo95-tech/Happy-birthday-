import { UserAnswers } from '../types';
import { GOOGLE_APPS_SCRIPT_URL } from '../config';

export interface SubmissionPayload {
  submissionId: string;
  timestamp: string;
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
  similarityScore: number;
}

export interface SheetResult {
  success: boolean;
  duplicate?: boolean;
  submissionId?: string;
  error?: string;
}

let submissionStarted = false;
const SENT_SUBMISSION_IDS = new Set<string>();

/**
 * Sends a single secure POST request to the deployed Google Apps Script Web App
 */
export async function saveBirthdayResponse(
  answers: UserAnswers,
  finalSimilarityScore: number
): Promise<SheetResult> {
  let submissionId = '';
  try {
    submissionId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'sub_' + Date.now();
  } catch {
    submissionId = 'sub_' + Date.now();
  }

  // Prevent multiple executions
  if (submissionStarted || SENT_SUBMISSION_IDS.has(submissionId)) {
    return { success: true, duplicate: true, submissionId };
  }

  submissionStarted = true;

  const submissionData: SubmissionPayload = {
    submissionId,
    timestamp: new Date().toISOString(),

    name: answers.name || "",
    birthday: answers.birthday || "",
    feeling: answers.feeling || "",

    favoriteColor: answers.favoriteColor || "",
    favoriteFood: answers.favoriteFood || "",
    favoriteClothes: answers.favoriteClothes || "",
    favoriteMovie: answers.favoriteMovie || "",
    favoriteSong: answers.favoriteSong || "",
    favoriteSport: answers.favoriteSport || "",
    favoritePlace: answers.favoritePlace || "",

    drink: answers.drink || "",
    timePreference: answers.timePreference || "",
    tastePreference: answers.tastePreference || "",

    favoriteHobby: answers.favoriteHobby || "",
    dreamDestination: answers.dreamDestination || "",

    similarityScore: Number(finalSimilarityScore) || 0
  };

  const isPlaceholder =
    !GOOGLE_APPS_SCRIPT_URL ||
    GOOGLE_APPS_SCRIPT_URL.includes("PASTE_YOUR_DEPLOYED_APPS_SCRIPT_URL_HERE") ||
    !GOOGLE_APPS_SCRIPT_URL.startsWith("https://script.google.com");

  if (isPlaceholder) {
    submissionStarted = false;
    return {
      success: false,
      error: "Google Apps Script URL has not been configured yet."
    };
  }

  try {
    const response = await fetch(
      GOOGLE_APPS_SCRIPT_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(submissionData),
        redirect: "follow"
      }
    );

    const text = await response.text();
    const result = JSON.parse(text);

    if (result.success === true) {
      SENT_SUBMISSION_IDS.add(submissionId);
      return {
        success: true,
        submissionId: submissionData.submissionId
      };
    }

    submissionStarted = false;
    return {
      success: false,
      error: result.error || "Google Sheets save failed."
    };
  } catch (error: any) {
    submissionStarted = false;
    console.error("Google Sheets POST error:", error);
    return {
      success: false,
      error: error.message || "Network error."
    };
  }
}

export function resetSubmissionGuard() {
  submissionStarted = false;
}
