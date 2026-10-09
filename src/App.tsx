/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Cake,
  RotateCcw,
  Smartphone,
  HelpCircle,
  Gift
} from 'lucide-react';

import {
  MY_NAME,
  MY_PREFERENCES,
  PERSONAL_LETTER,
  MEMORIES
} from './config';
import { UserAnswers, StepKey } from './types';
import {
  calculateMatchDetails,
  getScoreMessage,
  getRandomFeedback,
  evaluateCategoryMatch
} from './utils/similarity';
import { saveBirthdayResponse, resetSubmissionGuard } from './utils/sheetService';
import { sound } from './utils/sound';
import { fireCelebrationConfetti, fireFireworksSequence } from './utils/confetti';

import { BackgroundFX } from './components/BackgroundFX';
import { AudioPlayer } from './components/AudioPlayer';
import { AtmosphereSettings } from './components/AtmosphereSettings';
import { GiftBox } from './components/GiftBox';
import { EnvelopeLetter } from './components/EnvelopeLetter';
import { MeVsYou } from './components/MeVsYou';
import { MemoriesSlideshow } from './components/MemoriesSlideshow';
import { StatusCanvasModal } from './components/StatusCanvasModal';
import { CreatorGuideModal } from './components/CreatorGuideModal';

const INITIAL_ANSWERS: UserAnswers = {
  name: '',
  birthday: '',
  feeling: '',
  favoriteColor: '',
  favoriteFood: '',
  favoriteClothes: '',
  favoriteMovie: '',
  favoriteSong: '',
  favoriteSport: '',
  favoritePlace: '',
  drink: '',
  timePreference: '',
  tastePreference: '',
  favoriteHobby: '',
  dreamDestination: ''
};

// Preset lists tailored for mobile-first interactive answering
const COLOR_PRESETS = [
  { name: 'Black', hex: '#171717', bg: 'bg-[#171717] border border-[#5A3D4A]/40' },
  { name: 'Soft Blush Pink', hex: '#F8C8DC', bg: 'bg-[#F8C8DC] border border-[#E889AD]' },
  { name: 'Rose Petal', hex: '#E889AD', bg: 'bg-[#E889AD]' },
  { name: 'Pure Pearl White', hex: '#FFFFFF', bg: 'bg-white border-2 border-[#F8C8DC]' },
  { name: 'Champagne Gold', hex: '#D9A441', bg: 'bg-[#D9A441]' },
  { name: 'Royal Sapphire', hex: '#2563eb', bg: 'bg-blue-600' },
  { name: 'Lavender Amethyst', hex: '#9333ea', bg: 'bg-purple-500' },
  { name: 'Emerald Forest', hex: '#059669', bg: 'bg-emerald-600' }
];

const FOOD_PRESETS = [
  '🍕 Pizza',
  '🍔 Burger',
  '🍛 Biryani',
  '🍝 Pasta',
  '🍗 BBQ',
  '🍣 Sushi',
  '🌮 Tacos',
  '🍰 Dessert',
  'Other'
];

const CLOTHES_PRESETS = [
  'Casual',
  'Formal',
  'Streetwear',
  'Traditional',
  'Sportswear',
  'Oversized',
  'Other'
];

const MOVIE_PRESETS = [
  'Titanic',
  'Interstellar',
  'Inception',
  'The Dark Knight',
  'Avengers: Endgame',
  'La La Land',
  'Spirited Away',
  'Other'
];

const SONG_PRESETS = [
  'Viva La Vida',
  'Blinding Lights',
  'Yellow - Coldplay',
  'Shape of You',
  'Someone Like You',
  'Bohemian Rhapsody',
  'Other'
];

const SPORT_PRESETS = [
  'Football ⚽',
  'Cricket 🏏',
  'Basketball 🏀',
  'Badminton 🏸',
  'Tennis 🎾',
  'Swimming 🏊',
  'Gym & Fitness 🏋️',
  'Other'
];

const PLACE_PRESETS = [
  'Skardu 🏔️',
  'Hunza 🌿',
  'Naran 🌲',
  'Kaghan 🏞️',
  'Swat 🌸',
  'Murree ❄️',
  'Kashmir 🏔️',
  'Gilgit 🌄',
  'Fairy Meadows ⛺',
  'Neelum Valley 🌊',
  'Gwadar 🏖️',
  'Other'
];

const HOBBY_PRESETS = [
  'Photography & Music 📸',
  'Reading & Writing 📚',
  'Gaming & Tech 🎮',
  'Traveling & Nature 🌿',
  'Cooking & Baking 🍳',
  'Fitness & Sports 🏃',
  'Other'
];

const DESTINATION_PRESETS = [
  '🕋 Makkah',
  '🕌 Madinah',
  '🤲 Hajj',
  '🤍 Umrah',
  '🏔️ Skardu',
  '🇹🇷 Turkey',
  '🇦🇪 Dubai',
  'Other'
];

export default function App() {
  const [currentStep, setCurrentStep] = useState<StepKey>('name');
  const [answers, setAnswers] = useState<UserAnswers>(INITIAL_ANSWERS);

  // Custom text input buffer for "Other" or free-text answers
  const [customInput, setCustomInput] = useState('');
  const [customColor, setCustomColor] = useState('#F8C8DC');

  // Match notification toast
  const [matchNotification, setMatchNotification] = useState<string | null>(null);

  // Heart Rain toggle state: default ON as requested
  const [heartRainOverride, setHeartRainOverride] = useState<boolean | null>(true);

  // Determine if Heart Rain is active (defaults to true)
  const isHeartRainActive = useMemo(() => {
    if (typeof heartRainOverride === 'boolean') {
      return heartRainOverride;
    }
    return true;
  }, [heartRainOverride]);

  // Handler to toggle Heart Rain
  const handleToggleHeartRain = () => {
    setHeartRainOverride(prev => {
      const currentlyActive = typeof prev === 'boolean' ? prev : true;
      return !currentlyActive;
    });
  };

  // Handler to reset Heart Rain to default ON
  const handleResetHeartRainAuto = () => {
    setHeartRainOverride(true);
  };

  // Modals state
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  // Submission state & guards
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatusMessage, setSaveStatusMessage] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null);

  // Counter animation for final match score
  const [displayedScore, setDisplayedScore] = useState(0);

  // Calculate similarity match
  const matchDetails = useMemo(() => {
    return calculateMatchDetails(answers, MY_PREFERENCES);
  }, [answers]);

  // Handle live answer selection & trigger match feedback
  const handleSelectAnswer = (
    key: keyof UserAnswers,
    value: string,
    nextStep: StepKey
  ) => {
    sound.playPop();
    const updated = { ...answers, [key]: value };
    setAnswers(updated);
    setCustomInput('');

    // Trigger match feedback if it's one of the 12 comparison categories
    if (key in MY_PREFERENCES) {
      const prefKey = key as keyof typeof MY_PREFERENCES;
      const { isMatch } = evaluateCategoryMatch(prefKey, value, MY_PREFERENCES[prefKey]);
      if (isMatch) {
        sound.playMatchChime();
      }
      const feedback = getRandomFeedback(isMatch);
      setMatchNotification(feedback);
      setTimeout(() => setMatchNotification(null), 2500);
    }

    setCurrentStep(nextStep);
  };

  // Submit response to Google Sheets on final match reveal with submission guard
  useEffect(() => {
    if (currentStep === 'final_match' && !hasSubmitted) {
      setHasSubmitted(true);
      setIsSaving(true);
      setSaveStatusMessage('Saving your answers... ❤️');

      saveBirthdayResponse(answers, matchDetails.percentage)
        .then(res => {
          setIsSaving(false);
          if (res.success) {
            setSaveSuccess(true);
            setSaveStatusMessage('Your answers are safely saved ❤️');
          } else {
            setSaveSuccess(false);
            setSaveStatusMessage("We couldn't save your answers right now, but your birthday surprise can continue. ❤️");
          }
        })
        .catch(() => {
          setIsSaving(false);
          setSaveSuccess(false);
          setSaveStatusMessage("We couldn't save your answers right now, but your birthday surprise can continue. ❤️");
        });
    }
  }, [currentStep, hasSubmitted, answers, matchDetails.percentage]);

  // Smooth counter animation from 0 to actual percentage on final match screen
  useEffect(() => {
    if (currentStep === 'final_match') {
      let start = 0;
      const target = matchDetails.percentage;
      const duration = 1500;
      const stepTime = Math.max(16, Math.floor(duration / (target || 1)));

      const timer = setInterval(() => {
        start += 1;
        if (start >= target) {
          setDisplayedScore(target);
          clearInterval(timer);
          fireCelebrationConfetti();
        } else {
          setDisplayedScore(start);
        }
      }, stepTime);

      return () => clearInterval(timer);
    }
  }, [currentStep, matchDetails.percentage]);

  // Play final celebration sound when reaching the birthday reveal screen
  useEffect(() => {
    if (currentStep === 'birthday_reveal') {
      sound.playCelebrationSound();
    }
  }, [currentStep]);

  // Restart function
  const handleRestart = () => {
    sound.playClick();
    resetSubmissionGuard();
    setAnswers(INITIAL_ANSWERS);
    setHasSubmitted(false);
    setIsSaving(false);
    setSaveSuccess(null);
    setSaveStatusMessage('');
    setCustomInput('');
    setDisplayedScore(0);
    setHeartRainOverride(true);
    setCurrentStep('name');
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden text-[#5A3D4A] select-none">
      {/* Background Ambience with Soft Pink Gradients and Floating Petals */}
      <BackgroundFX feeling={answers.feeling} heartRainOverride={heartRainOverride} />

      {/* ================================================================ */}
      {/* MAIN HEADER WITH LOGO, SETTINGS & AUDIO CONTROLS */}
      {/* ================================================================ */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 border-b border-[#F8C8DC]/60 shadow-xs transition-all">
        <div className="max-w-2xl mx-auto px-3.5 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2">
          {/* Left: App Logo / Title */}
          <div className="flex items-center gap-2 select-none">
            <div className="w-8 h-8 rounded-full bg-[#FDE8F1] border border-[#F8C8DC] flex items-center justify-center text-sm shadow-xs">
              🎁
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-serif font-bold text-[#171717] tracking-tight">
                  Birthday Surprise
                </span>
                <span className="text-[9px] font-extrabold bg-[#FDE8F1] text-[#E889AD] px-1.5 py-0.2 rounded-full border border-[#F8C8DC]">
                  ❤️
                </span>
              </div>
            </div>
          </div>

          {/* Right: Header Controls (Settings & Audio) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Small Settings Icon for Heart Rain Particle Effect */}
            <AtmosphereSettings
              heartRainEnabled={isHeartRainActive}
              onToggleHeartRain={handleToggleHeartRain}
              onResetAuto={handleResetHeartRainAuto}
              isCustomOverride={heartRainOverride === false}
              feeling={answers.feeling}
            />

            {/* Background Music Toggle */}
            <AudioPlayer />
          </div>
        </div>

        {/* Top Live Friendship Match Bar (Visible during questionnaire questions) */}
        {[
          'favoriteColor',
          'favoriteFood',
          'favoriteClothes',
          'favoriteMovie',
          'favoriteSong',
          'favoriteSport',
          'favoritePlace',
          'drink',
          'timePreference',
          'tastePreference',
          'favoriteHobby',
          'dreamDestination'
        ].includes(currentStep) && (
          <div className="border-t border-[#F8C8DC]/50 bg-white/70 backdrop-blur-sm py-2 px-4 shadow-xs">
            <div className="max-w-md mx-auto flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-[#E889AD]">
                <Heart className="w-3.5 h-3.5 fill-[#E889AD] text-[#E889AD] animate-pulse" />
                <span>OUR SIMILARITY ❤️</span>
              </span>
              <span className="text-[#5A3D4A] font-mono font-bold">
                {matchDetails.percentage}%
              </span>
            </div>
            <div className="max-w-md mx-auto mt-1 h-2 rounded-full bg-[#FDE8F1] overflow-hidden border border-[#F8C8DC]">
              <motion.div
                className="h-full bg-gradient-to-r from-[#F7A8C4] via-[#F8C8DC] to-[#E889AD] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${matchDetails.percentage}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        )}
      </header>

      {/* Floating Match Feedback Toast */}
      <AnimatePresence>
        {matchNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-18 inset-x-0 mx-auto w-fit max-w-[90vw] z-50 px-5 py-2.5 rounded-full bg-white border-2 border-[#F8C8DC] text-xs sm:text-sm font-bold text-[#E889AD] shadow-lg shadow-[#E889AD]/20 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#D9A441] animate-spin" />
            <span>{matchNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN EXPERIENCE CONTAINER */}
      <main className="flex-1 flex flex-col items-center justify-center w-full px-4 py-6 sm:py-10 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">

          {/* ================================================================ */}
          {/* 1. OPENING SCREEN */}
          {/* ================================================================ */}
          {currentStep === 'name' && (
            <motion.div
              key="step-name"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5 }}
              className="w-full text-center max-w-md my-auto"
            >
              {/* Premium Gift Illustration & Floating Badges */}
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 rounded-full bg-[#FDE8F1] border-2 border-[#F8C8DC] flex items-center justify-center shadow-lg shadow-[#E889AD]/20 mx-auto">
                  <Gift className="w-9 h-9 text-[#E889AD] animate-float-slow" />
                </div>
                {/* Floating sparkles and hearts */}
                <span className="absolute -top-1 -right-2 text-base animate-bounce">🎀</span>
                <span className="absolute -bottom-1 -left-2 text-base animate-pulse">✨</span>
                <span className="absolute top-1/2 -right-6 text-sm">🌸</span>
              </div>

              <span className="text-xs font-bold tracking-widest uppercase text-[#E889AD] block mb-2 font-luxury">
                A Little Birthday Magic
              </span>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#5A3D4A] font-bold tracking-tight mb-3">
                Someone Special Has a Surprise For You... ❤️
              </h1>

              <p className="text-sm sm:text-base text-[#5A3D4A]/80 mb-7 font-medium">
                What should I call you?
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (answers.name.trim()) {
                    sound.playClick();
                    // Start background music smoothly on first user interaction as requested
                    sound.startBackgroundMusic();
                    setCurrentStep('welcome');
                  }
                }}
                className="space-y-4"
              >
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={answers.name}
                    onChange={(e) => setAnswers({ ...answers, name: e.target.value })}
                    className="w-full py-4 px-6 rounded-2xl glass-input text-[#5A3D4A] placeholder-[#5A3D4A]/40 text-center text-lg font-medium outline-none transition-all shadow-sm"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={!answers.name.trim()}
                  className="w-full py-4 rounded-2xl font-bold text-base text-white btn-pink-gradient shadow-lg shadow-[#E889AD]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span>Start Surprise ❤️</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}

          {/* ================================================================ */}
          {/* 2. WELCOME SCREEN */}
          {/* ================================================================ */}
          {currentStep === 'welcome' && (
            <motion.div
              key="step-welcome"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.5 }}
              className="w-full text-center max-w-md my-auto"
            >
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase text-[#E889AD] bg-[#FDE8F1] border border-[#F8C8DC] mb-4 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#D9A441]" />
                Crafted Just For You
              </div>

              <h1 className="text-3xl sm:text-4xl font-serif text-[#5A3D4A] font-bold tracking-tight mb-4">
                Welcome, {answers.name}! 👋
              </h1>

              <div className="glass-panel rounded-3xl p-6 sm:p-8 my-6 text-[#5A3D4A] leading-relaxed shadow-xl border border-[#F8C8DC]">
                <p className="text-base sm:text-lg font-serif italic text-[#E889AD] font-semibold">
                  "Today isn't just your birthday...
                  <br />
                  I prepared something special for you."
                </p>
                <div className="h-px w-16 bg-[#F8C8DC] mx-auto my-4" />
                <p className="text-xs sm:text-sm text-[#5A3D4A]/70">
                  An interactive digital gift designed to discover how much our tastes align, reveal secret memories, and unlock your birthday surprise.
                </p>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  setCurrentStep('privacy_notice');
                }}
                className="w-full py-4 rounded-2xl font-bold text-base text-white btn-pink-gradient shadow-lg shadow-[#E889AD]/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Let's Begin ✨</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* ================================================================ */}
          {/* IMPORTANT PRIVACY / DATA NOTICE */}
          {/* ================================================================ */}
          {currentStep === 'privacy_notice' && (
            <motion.div
              key="step-privacy"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full text-center max-w-sm my-auto"
            >
              <div className="glass-panel rounded-3xl p-7 border border-[#F8C8DC] shadow-xl text-center">
                <div className="w-12 h-12 rounded-full bg-[#FDE8F1] border border-[#F8C8DC] flex items-center justify-center mx-auto mb-4 text-[#E889AD]">
                  <Heart className="w-6 h-6 fill-[#E889AD]" />
                </div>

                <p className="text-base sm:text-lg font-bold text-[#5A3D4A] mb-2 leading-relaxed">
                  Your answers are saved to create your personalized birthday experience. ❤️
                </p>

                <p className="text-xs text-[#5A3D4A]/70 mb-6">
                  Only the questions in this surprise are saved to celebrate our friendship together.
                </p>

                <button
                  onClick={() => {
                    sound.playClick();
                    setCurrentStep('birthday');
                  }}
                  className="px-8 py-3 rounded-full text-sm font-bold text-white btn-pink-gradient shadow-md cursor-pointer"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* ================================================================ */}
          {/* 3. BIRTHDAY DATE */}
          {/* ================================================================ */}
          {currentStep === 'birthday' && (
            <motion.div
              key="step-birthday"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full text-center max-w-md my-auto"
            >
              <span className="text-xs font-bold tracking-wider uppercase text-[#E889AD] mb-2 block">
                Question 1 of 15
              </span>

              <h2 className="text-2xl sm:text-3xl font-serif text-[#5A3D4A] font-bold mb-6">
                When is your birthday? 🎂
              </h2>

              <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-[#F8C8DC] shadow-xl mb-6">
                <label className="block text-xs uppercase tracking-wider text-[#5A3D4A]/60 mb-3 font-bold">
                  Select your special date
                </label>
                <div className="relative max-w-xs mx-auto">
                  <input
                    type="date"
                    required
                    value={answers.birthday}
                    onChange={(e) => setAnswers({ ...answers, birthday: e.target.value })}
                    className="w-full py-3.5 px-4 rounded-2xl glass-input text-[#5A3D4A] text-center font-mono text-base outline-none cursor-pointer"
                  />
                </div>

                {answers.birthday && (
                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[#E889AD] text-sm font-bold mt-4 flex items-center justify-center gap-1.5"
                  >
                    <span>Perfect! 🎂</span>
                  </motion.p>
                )}
              </div>

              <button
                disabled={!answers.birthday}
                onClick={() => {
                  sound.playClick();
                  setCurrentStep('feeling');
                }}
                className="w-full py-4 rounded-2xl font-bold text-base text-white btn-pink-gradient shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* ================================================================ */}
          {/* 4. HOW ARE YOU FEELING? */}
          {/* ================================================================ */}
          {currentStep === 'feeling' && (
            <motion.div
              key="step-feeling"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full text-center max-w-md my-auto"
            >
              <span className="text-xs font-bold tracking-wider uppercase text-[#E889AD] mb-2 block">
                Question 2 of 15
              </span>

              <h2 className="text-2xl sm:text-3xl font-serif text-[#5A3D4A] font-bold mb-2">
                How are you feeling today?
              </h2>

              <p className="text-xs sm:text-sm text-[#5A3D4A]/70 mb-6">
                Pick what matches your current birthday mood
              </p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Happy', emoji: '😊' },
                  { label: 'Excited', emoji: '😎' },
                  { label: 'Relaxed', emoji: '😌' },
                  { label: 'A Little Sad', emoji: '😔' },
                  { label: 'Amazing', emoji: '🤩' },
                  { label: 'Grateful', emoji: '❤️' }
                ].map((item) => (
                  <motion.button
                    key={item.label}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      if (item.label === 'Happy' || item.label === 'Grateful') {
                        sound.playMatchChime();
                      } else {
                        sound.playPop();
                      }
                      setAnswers({ ...answers, feeling: item.label });
                      setTimeout(() => setCurrentStep('favoriteColor'), 450);
                    }}
                    className={`p-4 rounded-2xl text-left border flex flex-col justify-between transition-all cursor-pointer ${
                      answers.feeling === item.label
                        ? 'bg-[#FDE8F1] border-2 border-[#E889AD] text-[#E889AD] shadow-md'
                        : 'glass-panel border-[#F8C8DC] hover:border-[#E889AD] text-[#5A3D4A]'
                    }`}
                  >
                    <span className="text-3xl mb-2">{item.emoji}</span>
                    <span className="font-bold text-sm">{item.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ================================================================ */}
          {/* 5. FAVORITE COLOR */}
          {/* ================================================================ */}
          {currentStep === 'favoriteColor' && (
            <motion.div
              key="step-color"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full text-center max-w-md my-auto"
            >
              <span className="text-xs font-bold tracking-wider uppercase text-[#E889AD] mb-2 block">
                Question 3 of 15
              </span>

              <h2 className="text-2xl sm:text-3xl font-serif text-[#5A3D4A] font-bold mb-2">
                What's your favorite color? 🎨
              </h2>

              <p className="text-xs sm:text-sm text-[#5A3D4A]/70 mb-6">
                Choose a palette or pick your custom shade
              </p>

              {/* Presets */}
              <div className="grid grid-cols-2 gap-2.5 mb-5">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => handleSelectAnswer('favoriteColor', c.name, 'favoriteFood')}
                    className="p-3 rounded-2xl glass-panel hover:bg-white border border-[#F8C8DC] flex items-center gap-3 text-left transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <span className={`w-6 h-6 rounded-full shrink-0 shadow-xs ${c.bg}`} />
                    <span className="text-xs font-semibold text-[#5A3D4A] line-clamp-1">{c.name}</span>
                  </button>
                ))}
              </div>

              {/* Custom Color Picker */}
              <div className="p-4 rounded-2xl glass-panel border border-[#F8C8DC] flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                  />
                  <div className="text-left">
                    <span className="text-xs text-[#5A3D4A] font-bold block">Custom Shade</span>
                    <span className="text-[10px] text-[#5A3D4A]/60 font-mono">{customColor}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleSelectAnswer('favoriteColor', `Custom (${customColor})`, 'favoriteFood')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white btn-pink-gradient cursor-pointer"
                >
                  Choose Custom
                </button>
              </div>
            </motion.div>
          )}

          {/* ================================================================ */}
          {/* 6. FAVORITE FOOD */}
          {/* ================================================================ */}
          {currentStep === 'favoriteFood' && (
            <motion.div
              key="step-food"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full text-center max-w-md my-auto"
            >
              <span className="text-xs font-bold tracking-wider uppercase text-[#E889AD] mb-2 block">
                Question 4 of 15
              </span>

              <h2 className="text-2xl sm:text-3xl font-serif text-[#5A3D4A] font-bold mb-2">
                What's your favorite food? 🍽️
              </h2>

              <p className="text-xs sm:text-sm text-[#5A3D4A]/70 mb-6">
                Pick your comfort meal of choice
              </p>

              <div className="grid grid-cols-2 gap-2.5 mb-4">
                {FOOD_PRESETS.filter(f => f !== 'Other').map((food) => (
                  <button
                    key={food}
                    onClick={() => handleSelectAnswer('favoriteFood', food.replace(/[^\w\s]/gi, '').trim(), 'favoriteClothes')}
                    className="p-3.5 rounded-2xl glass-panel hover:bg-white border border-[#F8C8DC] flex items-center gap-2.5 text-left text-sm font-semibold text-[#5A3D4A] transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <span>{food}</span>
                  </button>
                ))}
              </div>

              {/* Custom Input for Other */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Or type custom food..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="flex-1 py-3 px-4 rounded-xl glass-input text-xs sm:text-sm text-[#5A3D4A] placeholder-[#5A3D4A]/40 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customInput.trim()) {
                      handleSelectAnswer('favoriteFood', customInput.trim(), 'favoriteClothes');
                    }
                  }}
                />
                <button
                  disabled={!customInput.trim()}
                  onClick={() => handleSelectAnswer('favoriteFood', customInput.trim(), 'favoriteClothes')}
                  className="px-5 py-3 rounded-xl btn-pink-gradient disabled:opacity-50 text-white font-bold text-xs cursor-pointer"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          )}

          {/* ================================================================ */}
          {/* 7. FAVORITE CLOTHES */}
          {/* ================================================================ */}
          {currentStep === 'favoriteClothes' && (
            <motion.div
              key="step-clothes"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full text-center max-w-md my-auto"
            >
              <span className="text-xs font-bold tracking-wider uppercase text-[#E889AD] mb-2 block">
                Question 5 of 15
              </span>

              <h2 className="text-2xl sm:text-3xl font-serif text-[#5A3D4A] font-bold mb-2">
                What kind of clothes do you love wearing? 👕
              </h2>

              <p className="text-xs sm:text-sm text-[#5A3D4A]/70 mb-6">
                Your signature everyday style
              </p>

              <div className="grid grid-cols-2 gap-2.5 mb-4">
                {CLOTHES_PRESETS.filter(c => c !== 'Other').map((style) => (
                  <button
                    key={style}
                    onClick={() => handleSelectAnswer('favoriteClothes', style, 'favoriteMovie')}
                    className="p-3.5 rounded-2xl glass-panel hover:bg-white border border-[#F8C8DC] text-center text-sm font-semibold text-[#5A3D4A] transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <span>{style}</span>
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Or custom outfit style..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="flex-1 py-3 px-4 rounded-xl glass-input text-xs sm:text-sm text-[#5A3D4A] placeholder-[#5A3D4A]/40 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customInput.trim()) {
                      handleSelectAnswer('favoriteClothes', customInput.trim(), 'favoriteMovie');
                    }
                  }}
                />
                <button
                  disabled={!customInput.trim()}
                  onClick={() => handleSelectAnswer('favoriteClothes', customInput.trim(), 'favoriteMovie')}
                  className="px-5 py-3 rounded-xl btn-pink-gradient disabled:opacity-50 text-white font-bold text-xs cursor-pointer"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          )}

          {/* ================================================================ */}
          {/* 8. PERSONAL QUESTIONS (9 questions asked one by one) */}
          {/* ================================================================ */}

          {/* Q1: Favorite Movie */}
          {currentStep === 'favoriteMovie' && (
            <motion.div
              key="step-movie"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full text-center max-w-md my-auto"
            >
              <span className="text-xs font-bold tracking-wider uppercase text-[#E889AD] mb-2 block">
                Question 6 of 15
              </span>

              <h2 className="text-2xl sm:text-3xl font-serif text-[#5A3D4A] font-bold mb-2">
                What's your favorite movie? 🎬
              </h2>

              <p className="text-xs sm:text-sm text-[#5A3D4A]/70 mb-6">
                A film you could rewatch anytime
              </p>

              <div className="grid grid-cols-2 gap-2.5 mb-4">
                {MOVIE_PRESETS.filter(m => m !== 'Other').map((m) => (
                  <button
                    key={m}
                    onClick={() => handleSelectAnswer('favoriteMovie', m, 'favoriteSong')}
                    className="p-3 rounded-2xl glass-panel hover:bg-white border border-[#F8C8DC] text-center text-xs sm:text-sm font-semibold text-[#5A3D4A] transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <span>{m}</span>
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Or type any movie title..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="flex-1 py-3 px-4 rounded-xl glass-input text-xs sm:text-sm text-[#5A3D4A] placeholder-[#5A3D4A]/40 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customInput.trim()) {
                      handleSelectAnswer('favoriteMovie', customInput.trim(), 'favoriteSong');
                    }
                  }}
                />
                <button
                  disabled={!customInput.trim()}
                  onClick={() => handleSelectAnswer('favoriteMovie', customInput.trim(), 'favoriteSong')}
                  className="px-5 py-3 rounded-xl btn-pink-gradient disabled:opacity-50 text-white font-bold text-xs cursor-pointer"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          )}

          {/* Q2: Favorite Song */}
          {currentStep === 'favoriteSong' && (
            <motion.div
              key="step-song"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full text-center max-w-md my-auto"
            >
              <span className="text-xs font-bold tracking-wider uppercase text-[#E889AD] mb-2 block">
                Question 7 of 15
              </span>

              <h2 className="text-2xl sm:text-3xl font-serif text-[#5A3D4A] font-bold mb-2">
                What's your favorite song? 🎵
              </h2>

              <p className="text-xs sm:text-sm text-[#5A3D4A]/70 mb-6">
                Your ultimate anthem on repeat
              </p>

              <div className="grid grid-cols-2 gap-2.5 mb-4">
                {SONG_PRESETS.filter(s => s !== 'Other').map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSelectAnswer('favoriteSong', s, 'favoriteSport')}
                    className="p-3 rounded-2xl glass-panel hover:bg-white border border-[#F8C8DC] text-center text-xs sm:text-sm font-semibold text-[#5A3D4A] transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <span>{s}</span>
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Or type your favorite track..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="flex-1 py-3 px-4 rounded-xl glass-input text-xs sm:text-sm text-[#5A3D4A] placeholder-[#5A3D4A]/40 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customInput.trim()) {
                      handleSelectAnswer('favoriteSong', customInput.trim(), 'favoriteSport');
                    }
                  }}
                />
                <button
                  disabled={!customInput.trim()}
                  onClick={() => handleSelectAnswer('favoriteSong', customInput.trim(), 'favoriteSport')}
                  className="px-5 py-3 rounded-xl btn-pink-gradient disabled:opacity-50 text-white font-bold text-xs cursor-pointer"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          )}

          {/* Q3: Favorite Sport */}
          {currentStep === 'favoriteSport' && (
            <motion.div
              key="step-sport"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full text-center max-w-md my-auto"
            >
              <span className="text-xs font-bold tracking-wider uppercase text-[#E889AD] mb-2 block">
                Question 8 of 15
              </span>

              <h2 className="text-2xl sm:text-3xl font-serif text-[#5A3D4A] font-bold mb-2">
                What's your favorite sport? 🏏
              </h2>

              <p className="text-xs sm:text-sm text-[#5A3D4A]/70 mb-6">
                Playing or cheering from the stands
              </p>

              <div className="grid grid-cols-2 gap-2.5 mb-4">
                {SPORT_PRESETS.filter(s => s !== 'Other').map((sport) => (
                  <button
                    key={sport}
                    onClick={() => handleSelectAnswer('favoriteSport', sport.replace(/[^\w\s/]/gi, '').trim(), 'favoritePlace')}
                    className="p-3.5 rounded-2xl glass-panel hover:bg-white border border-[#F8C8DC] text-center text-xs sm:text-sm font-semibold text-[#5A3D4A] transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <span>{sport}</span>
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Or type another sport..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="flex-1 py-3 px-4 rounded-xl glass-input text-xs sm:text-sm text-[#5A3D4A] placeholder-[#5A3D4A]/40 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customInput.trim()) {
                      handleSelectAnswer('favoriteSport', customInput.trim(), 'favoritePlace');
                    }
                  }}
                />
                <button
                  disabled={!customInput.trim()}
                  onClick={() => handleSelectAnswer('favoriteSport', customInput.trim(), 'favoritePlace')}
                  className="px-5 py-3 rounded-xl btn-pink-gradient disabled:opacity-50 text-white font-bold text-xs cursor-pointer"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          )}

          {/* Q4: Favorite Place */}
          {currentStep === 'favoritePlace' && (
            <motion.div
              key="step-place"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full text-center max-w-md my-auto"
            >
              <span className="text-xs font-bold tracking-wider uppercase text-[#E889AD] mb-2 block">
                Question 9 of 15
              </span>

              <h2 className="text-2xl sm:text-3xl font-serif text-[#5A3D4A] font-bold mb-2">
                What's your favorite place? 📍
              </h2>

              <p className="text-xs sm:text-sm text-[#5A3D4A]/70 mb-6">
                Where your heart feels most at peace
              </p>

              <div className="space-y-2.5 mb-4">
                {PLACE_PRESETS.filter(p => p !== 'Other').map((p) => (
                  <button
                    key={p}
                    onClick={() => handleSelectAnswer('favoritePlace', p.replace(/[^\w\s]/gi, '').trim(), 'drink')}
                    className="w-full p-3.5 rounded-2xl glass-panel hover:bg-white border border-[#F8C8DC] text-left text-xs sm:text-sm font-semibold text-[#5A3D4A] transition-all cursor-pointer shadow-xs active:scale-98"
                  >
                    <span>{p}</span>
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Or describe your sanctuary..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="flex-1 py-3 px-4 rounded-xl glass-input text-xs sm:text-sm text-[#5A3D4A] placeholder-[#5A3D4A]/40 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customInput.trim()) {
                      handleSelectAnswer('favoritePlace', customInput.trim(), 'drink');
                    }
                  }}
                />
                <button
                  disabled={!customInput.trim()}
                  onClick={() => handleSelectAnswer('favoritePlace', customInput.trim(), 'drink')}
                  className="px-5 py-3 rounded-xl btn-pink-gradient disabled:opacity-50 text-white font-bold text-xs cursor-pointer"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          )}

          {/* Q5: Tea or Coffee? */}
          {currentStep === 'drink' && (
            <motion.div
              key="step-drink"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full text-center max-w-md my-auto"
            >
              <span className="text-xs font-bold tracking-wider uppercase text-[#E889AD] mb-2 block">
                Question 10 of 15
              </span>

              <h2 className="text-2xl sm:text-3xl font-serif text-[#5A3D4A] font-bold mb-2">
                Tea or Coffee? ☕
              </h2>

              <p className="text-xs sm:text-sm text-[#5A3D4A]/70 mb-6">
                The eternal beverage dilemma
              </p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Tea', icon: '🍵', desc: 'Serene & soothing' },
                  { label: 'Coffee', icon: '☕', desc: 'Rich & energized' },
                  { label: 'Both', icon: '✨', desc: 'Depends on the mood' },
                  { label: 'Neither', icon: '🥤', desc: 'Juice / Matcha / Water' }
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleSelectAnswer('drink', item.label, 'timePreference')}
                    className="p-5 rounded-2xl glass-panel hover:bg-white border border-[#F8C8DC] text-center transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <span className="text-3xl block mb-2">{item.icon}</span>
                    <span className="font-bold text-sm text-[#5A3D4A] block">{item.label}</span>
                    <span className="text-[11px] text-[#5A3D4A]/60 mt-0.5 block">{item.desc}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Q6: Morning or Night? */}
          {currentStep === 'timePreference' && (
            <motion.div
              key="step-time"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full text-center max-w-md my-auto"
            >
              <span className="text-xs font-bold tracking-wider uppercase text-[#E889AD] mb-2 block">
                Question 11 of 15
              </span>

              <h2 className="text-2xl sm:text-3xl font-serif text-[#5A3D4A] font-bold mb-2">
                Morning or Night? 🌅🌙
              </h2>

              <p className="text-xs sm:text-sm text-[#5A3D4A]/70 mb-6">
                When does your soul feel most alive?
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleSelectAnswer('timePreference', 'Morning', 'tastePreference')}
                  className="p-6 rounded-3xl glass-panel hover:bg-white border-2 border-[#F8C8DC] text-center transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <span className="text-4xl block mb-3">🌅</span>
                  <span className="font-bold text-base text-[#D9A441] block">Morning</span>
                  <span className="text-xs text-[#5A3D4A]/70 mt-1 block font-medium">Early riser & sunrise lover</span>
                </button>

                <button
                  onClick={() => handleSelectAnswer('timePreference', 'Night', 'tastePreference')}
                  className="p-6 rounded-3xl glass-panel hover:bg-white border-2 border-[#F8C8DC] text-center transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <span className="text-4xl block mb-3">🌙</span>
                  <span className="font-bold text-base text-[#E889AD] block">Night</span>
                  <span className="text-xs text-[#5A3D4A]/70 mt-1 block font-medium">Night owl & midnight dreamer</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Q7: Sweet or Spicy? */}
          {currentStep === 'tastePreference' && (
            <motion.div
              key="step-taste"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full text-center max-w-md my-auto"
            >
              <span className="text-xs font-bold tracking-wider uppercase text-[#E889AD] mb-2 block">
                Question 12 of 15
              </span>

              <h2 className="text-2xl sm:text-3xl font-serif text-[#5A3D4A] font-bold mb-2">
                Sweet or Spicy? 🍫🌶️
              </h2>

              <p className="text-xs sm:text-sm text-[#5A3D4A]/70 mb-6">
                Your flavor personality
              </p>

              <div className="grid grid-cols-3 gap-2.5">
                <button
                  onClick={() => handleSelectAnswer('tastePreference', 'Sweet', 'favoriteHobby')}
                  className="p-5 rounded-2xl glass-panel hover:bg-white border border-[#F8C8DC] text-center transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <span className="text-3xl block mb-2">🍫</span>
                  <span className="font-bold text-xs sm:text-sm text-[#E889AD] block">Sweet Tooth</span>
                </button>

                <button
                  onClick={() => handleSelectAnswer('tastePreference', 'Spicy', 'favoriteHobby')}
                  className="p-5 rounded-2xl glass-panel hover:bg-white border border-[#F8C8DC] text-center transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <span className="text-3xl block mb-2">🌶️</span>
                  <span className="font-bold text-xs sm:text-sm text-rose-500 block">Spicy Lover</span>
                </button>

                <button
                  onClick={() => handleSelectAnswer('tastePreference', 'Both', 'favoriteHobby')}
                  className="p-5 rounded-2xl glass-panel hover:bg-white border border-[#F8C8DC] text-center transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <span className="text-3xl block mb-2">😋</span>
                  <span className="font-bold text-xs sm:text-sm text-[#D9A441] block">Both!</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Q8: Favorite Hobby */}
          {currentStep === 'favoriteHobby' && (
            <motion.div
              key="step-hobby"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full text-center max-w-md my-auto"
            >
              <span className="text-xs font-bold tracking-wider uppercase text-[#E889AD] mb-2 block">
                Question 13 of 15
              </span>

              <h2 className="text-2xl sm:text-3xl font-serif text-[#5A3D4A] font-bold mb-2">
                What's your favorite hobby? 🎨
              </h2>

              <p className="text-xs sm:text-sm text-[#5A3D4A]/70 mb-6">
                How you unwind and recharge your energy
              </p>

              <div className="grid grid-cols-2 gap-2.5 mb-4">
                {HOBBY_PRESETS.filter(h => h !== 'Other').map((hobby) => (
                  <button
                    key={hobby}
                    onClick={() => handleSelectAnswer('favoriteHobby', hobby.replace(/[^\w\s&]/gi, '').trim(), 'dreamDestination')}
                    className="p-3.5 rounded-2xl glass-panel hover:bg-white border border-[#F8C8DC] text-center text-xs sm:text-sm font-semibold text-[#5A3D4A] transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <span>{hobby}</span>
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Or custom hobby..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="flex-1 py-3 px-4 rounded-xl glass-input text-xs sm:text-sm text-[#5A3D4A] placeholder-[#5A3D4A]/40 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customInput.trim()) {
                      handleSelectAnswer('favoriteHobby', customInput.trim(), 'dreamDestination');
                    }
                  }}
                />
                <button
                  disabled={!customInput.trim()}
                  onClick={() => handleSelectAnswer('favoriteHobby', customInput.trim(), 'dreamDestination')}
                  className="px-5 py-3 rounded-xl btn-pink-gradient disabled:opacity-50 text-white font-bold text-xs cursor-pointer"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          )}

          {/* Q9: Dream Destination */}
          {currentStep === 'dreamDestination' && (
            <motion.div
              key="step-dest"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full text-center max-w-md my-auto"
            >
              <span className="text-xs font-bold tracking-wider uppercase text-[#E889AD] mb-2 block">
                Question 14 of 15
              </span>

              <h2 className="text-2xl sm:text-3xl font-serif text-[#5A3D4A] font-bold mb-2">
                What's your dream destination? ✈️
              </h2>

              <p className="text-xs sm:text-sm text-[#5A3D4A]/70 mb-6">
                Where would you hop on a flight right now?
              </p>

              <div className="space-y-2.5 mb-4">
                {DESTINATION_PRESETS.filter(d => d !== 'Other').map((dest) => (
                  <button
                    key={dest}
                    onClick={() => handleSelectAnswer('dreamDestination', dest.replace(/[^\w\s()&]/gi, '').trim(), 'final_match')}
                    className="w-full p-3.5 rounded-2xl glass-panel hover:bg-white border border-[#F8C8DC] text-left text-xs sm:text-sm font-semibold text-[#5A3D4A] transition-all cursor-pointer shadow-xs active:scale-98"
                  >
                    <span>{dest}</span>
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Or your dream country..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="flex-1 py-3 px-4 rounded-xl glass-input text-xs sm:text-sm text-[#5A3D4A] placeholder-[#5A3D4A]/40 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customInput.trim()) {
                      handleSelectAnswer('dreamDestination', customInput.trim(), 'final_match');
                    }
                  }}
                />
                <button
                  disabled={!customInput.trim()}
                  onClick={() => handleSelectAnswer('dreamDestination', customInput.trim(), 'final_match')}
                  className="px-5 py-3 rounded-xl btn-pink-gradient disabled:opacity-50 text-white font-bold text-xs cursor-pointer"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          )}

          {/* ================================================================ */}
          {/* 13. FINAL COMPATIBILITY RESULT */}
          {/* ================================================================ */}
          {currentStep === 'final_match' && (
            <motion.div
              key="step-final-match"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="w-full text-center max-w-md my-auto py-4"
            >
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase text-[#E889AD] bg-[#FDE8F1] border border-[#F8C8DC] mb-4 shadow-xs">
                <Heart className="w-3.5 h-3.5 fill-[#E889AD] text-[#E889AD]" />
                The Friendship Equation
              </span>

              <h2 className="text-2xl sm:text-3xl font-serif text-[#5A3D4A] font-bold mb-6">
                OUR SIMILARITY ❤️
              </h2>

              {/* Big Animated Counter with Pink Glow */}
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto flex items-center justify-center my-4">
                <div className="absolute inset-0 rounded-full bg-radial from-[#F8C8DC] via-[#FDE8F1]/60 to-transparent blur-xl" />
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#FDE8F1"
                    strokeWidth="8"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="url(#pinkGlowGrad)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="264"
                    strokeDashoffset={264 - (264 * displayedScore) / 100}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient id="pinkGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#F7A8C4" />
                      <stop offset="60%" stopColor="#E889AD" />
                      <stop offset="100%" stopColor="#D9A441" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-5xl sm:text-6xl font-black text-[#E889AD] font-sans tracking-tight">
                    {displayedScore}%
                  </span>
                  <span className="text-[11px] uppercase tracking-widest text-[#5A3D4A]/70 font-bold mt-1">
                    Similarity Score
                  </span>
                </div>
              </div>

              {/* Score Dynamic Message Card */}
              {(() => {
                const msg = getScoreMessage(matchDetails.percentage);
                return (
                  <div className="glass-panel rounded-3xl p-6 border-2 border-[#F8C8DC] shadow-xl my-6">
                    <h3 className="text-lg sm:text-xl font-bold text-[#E889AD] mb-1.5 font-serif">
                      {msg.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A3D4A]/80 leading-relaxed font-medium">
                      {msg.subtitle}
                    </p>
                  </div>
                );
              })()}

              {/* Save feedback indicator */}
              {saveStatusMessage && (
                <div className={`mb-4 px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 border ${
                  saveSuccess === true
                    ? 'bg-[#FDE8F1] border-[#F8C8DC] text-[#E889AD]'
                    : saveSuccess === false
                    ? 'bg-amber-50 border-amber-200 text-[#5A3D4A]'
                    : 'bg-white border-[#F8C8DC] text-[#5A3D4A]'
                }`}>
                  <Heart className={`w-3.5 h-3.5 ${isSaving ? 'animate-pulse' : ''} ${saveSuccess === true ? 'fill-[#E889AD] text-[#E889AD]' : 'text-[#E889AD]'}`} />
                  <span>{saveStatusMessage}</span>
                </div>
              )}

              {/* Next Button */}
              <button
                disabled={isSaving}
                onClick={() => {
                  sound.playClick();
                  setCurrentStep('open_gift');
                }}
                className="w-full py-4 rounded-2xl font-bold text-base text-white btn-pink-gradient shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span>{isSaving ? "Saving your answers... ❤️" : "Wait... There's One More Surprise 🎁"}</span>
              </button>
            </motion.div>
          )}

          {/* ================================================================ */}
          {/* 14. OPEN GIFT */}
          {/* ================================================================ */}
          {currentStep === 'open_gift' && (
            <motion.div
              key="step-gift"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <GiftBox
                recipientName={answers.name || 'Friend'}
                onOpened={() => setCurrentStep('personal_letter')}
              />
            </motion.div>
          )}

          {/* ================================================================ */}
          {/* 15. PERSONAL LETTER */}
          {/* ================================================================ */}
          {currentStep === 'personal_letter' && (
            <motion.div
              key="step-letter"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <EnvelopeLetter
                letterText={PERSONAL_LETTER}
                senderName={MY_NAME}
                recipientName={answers.name || 'Friend'}
                onContinue={() => setCurrentStep('me_vs_you')}
              />
            </motion.div>
          )}

          {/* ================================================================ */}
          {/* 16. ME VS YOU & 17. FINAL SIMILARITY SUMMARY */}
          {/* ================================================================ */}
          {currentStep === 'me_vs_you' && (
            <motion.div
              key="step-me-vs-you"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <MeVsYou
                senderName={MY_NAME}
                recipientName={answers.name || 'Friend'}
                matchResults={matchDetails.breakdown}
                percentage={matchDetails.percentage}
                totalMatches={matchDetails.totalMatches}
                nextSectionLabel={MEMORIES.length > 0 ? "See Our Memories 📸" : "The Big Birthday Reveal 🎉"}
                onContinue={() => {
                  sound.playClick();
                  if (MEMORIES.length > 0) {
                    setCurrentStep('memories');
                  } else {
                    fireFireworksSequence(3500);
                    setCurrentStep('birthday_reveal');
                  }
                }}
              />
            </motion.div>
          )}

          {/* ================================================================ */}
          {/* 18. MEMORIES / PHOTO SECTION */}
          {/* ================================================================ */}
          {currentStep === 'memories' && (
            <motion.div
              key="step-memories"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <MemoriesSlideshow
                memories={MEMORIES}
                onContinue={() => {
                  sound.playClick();
                  fireFireworksSequence(3500);
                  setCurrentStep('birthday_reveal');
                }}
              />
            </motion.div>
          )}

          {/* ================================================================ */}
          {/* 19. FINAL BIRTHDAY REVEAL */}
          {/* ================================================================ */}
          {currentStep === 'birthday_reveal' && (
            <motion.div
              key="step-reveal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full text-center max-w-lg my-auto py-8 px-2"
            >
              {/* Grand Party Birthday Header with Floating Balloons & Ribbons */}
              <div className="relative mb-3">
                <motion.div
                  animate={{ rotate: [-6, 6, -6], scale: [1, 1.08, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-block text-6xl sm:text-7xl mb-2"
                >
                  🎂
                </motion.div>
                {/* Floating balloons & hearts */}
                <span className="absolute -top-3 left-10 text-2xl animate-float-slow">🎈</span>
                <span className="absolute -top-2 right-10 text-2xl animate-float-gentle">🎈</span>
                <span className="absolute bottom-2 left-6 text-xl">💗</span>
                <span className="absolute bottom-2 right-6 text-xl">🎀</span>
              </div>

              <span className="text-xs sm:text-sm font-luxury font-bold tracking-widest uppercase text-[#D9A441] block mb-2">
                A Rare & Precious Celebration
              </span>

              {/* Main Animated Birthday Heading with Black Accent */}
              <h1 className="text-3xl sm:text-5xl font-serif text-[#171717] font-extrabold tracking-tight mb-2">
                HAPPY BIRTHDAY 🎂❤️
              </h1>

              <h2 className="text-2xl sm:text-4xl font-serif text-[#E889AD] font-bold mb-6">
                Happy Birthday, {answers.name || 'Friend'}! 💗
              </h2>

              {/* Heartfelt Wish Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#F8C8DC] shadow-[0_20px_50px_rgba(232,137,173,0.25)] my-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-36 h-36 bg-radial from-[#FDE8F1] to-transparent pointer-events-none" />
                <p className="text-base sm:text-lg font-serif italic text-[#5A3D4A] leading-relaxed">
                  "May your next chapter be filled with happiness, success, unforgettable memories, and lots of reasons to smile."
                </p>
                <div className="h-px w-20 bg-[#F8C8DC] mx-auto my-4" />
                <p className="text-xs text-[#E889AD] font-bold">
                  {matchDetails.percentage}% Soul Connection • Forever Friends
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mt-8">
                {/* WhatsApp Status Generator */}
                <button
                  onClick={() => {
                    sound.playClick();
                    setIsStatusModalOpen(true);
                  }}
                  className="w-full py-4 px-6 rounded-2xl font-bold text-base text-white btn-pink-gradient shadow-lg flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Smartphone className="w-5 h-5 text-white" />
                  <span>Take This Memory With You 📱❤️</span>
                </button>

                {/* Restart Experience */}
                <button
                  onClick={handleRestart}
                  className="w-full py-3.5 px-6 rounded-2xl font-semibold text-sm text-[#5A3D4A] bg-white hover:bg-[#FDE8F1] transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#F8C8DC] shadow-xs"
                >
                  <RotateCcw className="w-4 h-4 text-[#E889AD]" />
                  <span>Experience Again ↻</span>
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* FOOTER & CREATOR HELPER */}
      <footer className="w-full py-4 px-4 border-t border-[#F8C8DC]/60 text-center text-xs text-[#5A3D4A]/70 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          <Heart className="w-3.5 h-3.5 fill-[#E889AD] text-[#E889AD]" />
          <span>Made with love for WhatsApp surprise delivery</span>
        </div>

        {/* Creator Guide button for configuring Google Sheets */}
        <button
          onClick={() => {
            sound.playClick();
            setIsGuideModalOpen(true);
          }}
          className="text-[11px] text-[#5A3D4A]/60 hover:text-[#E889AD] underline inline-flex items-center gap-1 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-3 h-3" />
          <span>Google Apps Script Setup</span>
        </button>
      </footer>

      {/* WhatsApp Status Generator Modal (1080x1920 9:16 Canvas) */}
      <StatusCanvasModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        recipientName={answers.name || 'Friend'}
        senderName={MY_NAME}
        similarityScore={matchDetails.percentage}
        matchingCategories={matchDetails.breakdown.filter(b => b.isMatch)}
      />

      {/* Creator Setup Guide Modal */}
      <CreatorGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />
    </div>
  );
}
