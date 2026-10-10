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
  favoriteSubjects: string;
  favoriteSport: string;
  favoritePlace: string;
  drink: string;
  timePreference: string;
  tastePreference: string;
  favoriteHobby: string;
  dreamDestination: string;
  favoritePersonality: string;
  freeTimeActivities: string;
  oneThingWantMost: string;
  secretMessage: string;
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
    favoriteFood: Array.isArray(answers.favoriteFood) ? answers.favoriteFood.join(', ') : (answers.favoriteFood || ""),
    favoriteClothes: Array.isArray(answers.favoriteClothes) ? answers.favoriteClothes.join(', ') : (answers.favoriteClothes || ""),
    favoriteMovie: answers.favoriteMovie || "",
    favoriteSubjects: Array.isArray(answers.favoriteSubjects) ? answers.favoriteSubjects.join(', ') : (answers.favoriteSubjects || ""),
    favoriteSport: answers.favoriteSport || "",
    favoritePlace: answers.favoritePlace || "",

    drink: answers.drink || "",
    timePreference: answers.timePreference || "",
    tastePreference: answers.tastePreference || "",

    favoriteHobby: answers.favoriteHobby || "",
    dreamDestination: answers.dreamDestination || "",

    favoritePersonality: Array.isArray(answers.favoritePersonality)
      ? answers.favoritePersonality.join(', ')
      : (answers.favoritePersonality || ""),
    freeTimeActivities: Array.isArray(answers.freeTimeActivities)
      ? answers.freeTimeActivities.join(', ')
      : (answers.freeTimeActivities || ""),
    oneThingWantMost: answers.oneThingWantMost || "",
    secretMessage: answers.secretMessage || "",

    similarityScore: Number(finalSimilarityScore) || 0
  };

  const endpointUrl = typeof GOOGLE_APPS_SCRIPT_URL === 'string' ? GOOGLE_APPS_SCRIPT_URL.trim() : '';
  const isMissingUrl = !endpointUrl || !endpointUrl.startsWith("https://script.google.com");

  if (isMissingUrl) {
    submissionStarted = false;
    console.error(
      "[Google Sheets Integration] missing Apps Script URL: GOOGLE_APPS_SCRIPT_URL in src/config.ts is empty or not configured. Please deploy the Apps Script Web App and paste the /exec URL into src/config.ts."
    );
    return {
      success: false,
      error: "missing Apps Script URL: Please provide your deployed Google Apps Script /exec URL in src/config.ts."
    };
  }

  try {
    const response = await fetch(endpointUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(submissionData),
      redirect: "follow"
    });

    let text = "";
    try {
      text = await response.text();
    } catch (readErr: any) {
      submissionStarted = false;
      console.error(
        "[Google Sheets Integration] network/fetch failure: Failed to read response stream from Apps Script.",
        readErr
      );
      return {
        success: false,
        error: "network/fetch failure: Failed to read response stream."
      };
    }

    let result: any = null;
    try {
      result = JSON.parse(text);
    } catch (parseErr) {
      submissionStarted = false;
      console.error(
        "[Google Sheets Integration] invalid Apps Script response: Expected JSON from Google Apps Script, received raw text:",
        text,
        parseErr
      );
      return {
        success: false,
        error: "invalid Apps Script response"
      };
    }

    if (result && result.success === true) {
      SENT_SUBMISSION_IDS.add(submissionId);
      console.log("[Google Sheets Integration] Response saved successfully to spreadsheet:", {
        submissionId,
        duplicate: Boolean(result.duplicate)
      });
      return {
        success: true,
        duplicate: Boolean(result.duplicate),
        submissionId: submissionData.submissionId
      };
    }

    submissionStarted = false;
    console.error(
      "[Google Sheets Integration] Apps Script returned success:false. Error details:",
      result?.error || result
    );
    return {
      success: false,
      error: result?.error || "Apps Script returned success:false"
    };
  } catch (error: any) {
    submissionStarted = false;
    console.error(
      "[Google Sheets Integration] network/fetch failure: Failed to complete POST request to Google Apps Script.",
      error
    );
    return {
      success: false,
      error: error?.message || "network/fetch failure"
    };
  }
}

export function resetSubmissionGuard() {
  submissionStarted = false;
}
