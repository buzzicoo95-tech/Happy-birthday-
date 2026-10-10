import { supabase } from '../lib/supabase';
import { UserAnswers } from '../types';

export interface BirthdayResponseRecord {
  submission_id: string;
  name: string;
  birthday: string;
  feeling: string;
  favorite_color: string;
  favorite_food: string;
  favorite_clothes: string;
  favorite_movie: string;
  favorite_sport: string;
  favorite_place: string;
  drink: string;
  time_preference: string;
  taste_preference: string;
  favorite_hobby: string;
  dream_destination: string;
  favorite_subjects: string;
  favorite_personality: string;
  free_time_activities: string;
  one_thing_want_most: string;
  secret_message: string;
  similarity_score: number;
  created_at: string;
}

export interface SaveResponseResult {
  success: boolean;
  duplicate?: boolean;
  submissionId?: string;
  error?: string;
}

let submissionInProgress = false;
const SAVED_SUBMISSION_IDS = new Set<string>();

/**
 * Saves completed questionnaire response directly to Supabase public.birthday_responses
 */
export async function saveBirthdayResponseToSupabase(
  answers: UserAnswers,
  finalSimilarityScore: number
): Promise<SaveResponseResult> {
  let submissionId = '';
  try {
    submissionId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'sub_' + Date.now();
  } catch {
    submissionId = 'sub_' + Date.now();
  }

  // Prevent multiple executions / double-click while request is running
  if (submissionInProgress) {
    return { success: false, error: 'Submission already in progress.' };
  }
  if (SAVED_SUBMISSION_IDS.has(submissionId)) {
    return { success: true, duplicate: true, submissionId };
  }

  submissionInProgress = true;

  const submissionData: BirthdayResponseRecord = {
    submission_id: submissionId,
    name: answers.name || "",
    birthday: answers.birthday || "",
    feeling: answers.feeling || "",
    favorite_color: answers.favoriteColor || "",
    favorite_food: Array.isArray(answers.favoriteFood)
      ? answers.favoriteFood.join(", ")
      : (answers.favoriteFood || ""),
    favorite_clothes: Array.isArray(answers.favoriteClothes)
      ? answers.favoriteClothes.join(", ")
      : (answers.favoriteClothes || ""),
    favorite_movie: answers.favoriteMovie || "",
    favorite_sport: answers.favoriteSport || "",
    favorite_place: answers.favoritePlace || "",
    drink: answers.drink || "",
    time_preference: answers.timePreference || "",
    taste_preference: answers.tastePreference || "",
    favorite_hobby: answers.favoriteHobby || "",
    dream_destination: answers.dreamDestination || "",
    favorite_subjects: Array.isArray(answers.favoriteSubjects)
      ? answers.favoriteSubjects.join(", ")
      : (answers.favoriteSubjects || ""),
    favorite_personality: Array.isArray(answers.favoritePersonality)
      ? answers.favoritePersonality.join(", ")
      : (answers.favoritePersonality || ""),
    free_time_activities: Array.isArray(answers.freeTimeActivities)
      ? answers.freeTimeActivities.join(", ")
      : (answers.freeTimeActivities || ""),
    one_thing_want_most: answers.oneThingWantMost || "",
    secret_message: answers.secretMessage || "",
    similarity_score: Number(finalSimilarityScore) || 0,
    created_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from("birthday_responses")
      .insert([submissionData]);

    if (error) {
      console.error("Supabase save error:", error);
      submissionInProgress = false;
      return {
        success: false,
        error: error.message || 'Supabase save error'
      };
    }

    SAVED_SUBMISSION_IDS.add(submissionId);
    submissionInProgress = false;
    return {
      success: true,
      submissionId
    };
  } catch (err: any) {
    console.error("Supabase save error:", err);
    submissionInProgress = false;
    return {
      success: false,
      error: err?.message || 'Unexpected error'
    };
  }
}

export function resetSupabaseSubmissionGuard() {
  submissionInProgress = false;
}
