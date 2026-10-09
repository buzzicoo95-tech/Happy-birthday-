import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Check, Copy, ExternalLink, Sheet } from 'lucide-react';
import { GOOGLE_APPS_SCRIPT_URL } from '../config';
import { sound } from '../utils/sound';

interface CreatorGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatorGuideModal: React.FC<CreatorGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedCode, setCopiedCode] = useState(false);

  const sampleAppsScriptCode = `// SOULSYNC BIRTHDAY GOOGLE APPS SCRIPT WEB APP
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";
const SHEET_NAME = "Birthday Responses";

const HEADERS = [
  "Submission ID", "Timestamp", "Name", "Birthday", "Feeling",
  "Favorite Color", "Favorite Food", "Favorite Clothes", "Favorite Movie",
  "Favorite Song", "Favorite Sport", "Favorite Place", "Tea or Coffee",
  "Morning or Night", "Sweet or Spicy", "Favorite Hobby", "Dream Destination",
  "Similarity Score"
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Busy" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) { sheet = ss.insertSheet(SHEET_NAME); }

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
    }

    if (data.submissionId && sheet.getLastRow() > 1) {
      const existingIds = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues().flat();
      if (existingIds.includes(data.submissionId)) {
        return ContentService.createTextOutput(JSON.stringify({ status: "success", duplicate: true }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    const row = [
      data.submissionId, data.timestamp, data.name, data.birthday,
      data.feeling, data.favoriteColor, data.favoriteFood, data.favoriteClothes,
      data.favoriteMovie, data.favoriteSong, data.favoriteSport, data.favoritePlace,
      data.drink, data.timePreference, data.tastePreference, data.favoriteHobby,
      data.dreamDestination, data.similarityScore + "%"
    ];

    sheet.appendRow(row);
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}`;

  const handleCopyCode = () => {
    sound.playClick();
    navigator.clipboard?.writeText(sampleAppsScriptCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md overflow-y-auto select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-white border-2 border-[#F8C8DC] rounded-3xl p-6 shadow-2xl flex flex-col my-auto max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-2 rounded-full bg-[#FDE8F1] hover:bg-[#F8C8DC] text-[#5A3D4A] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#FDE8F1] border border-[#F8C8DC] flex items-center justify-center text-[#E889AD]">
            <Sheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#5A3D4A]">
              Google Apps Script Setup Guide
            </h3>
            <p className="text-xs text-[#5A3D4A]/70">
              Save responses directly to your private Google Sheet without exposing credentials
            </p>
          </div>
        </div>

        {/* Current URL Status */}
        <div className="p-3.5 rounded-2xl bg-[#FDE8F1] border border-[#F8C8DC] text-xs mb-5">
          <span className="text-[#5A3D4A]/70 font-semibold">Configured Endpoint: </span>
          <span className="font-mono text-[#E889AD] break-all font-semibold">
            {GOOGLE_APPS_SCRIPT_URL}
          </span>
        </div>

        {/* Step by Step */}
        <div className="space-y-4 text-xs sm:text-sm text-[#5A3D4A]">
          <div className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-[#FDE8F1] text-[#E889AD] border border-[#F8C8DC] font-bold flex items-center justify-center shrink-0 text-xs">
              1
            </span>
            <div>
              <p className="font-semibold text-[#5A3D4A]">Create a Google Spreadsheet</p>
              <p className="text-[#5A3D4A]/70 mt-0.5">
                Go to <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-[#E889AD] underline font-semibold inline-flex items-center gap-0.5">sheets.new <ExternalLink className="w-3 h-3" /></a> and name your sheet (e.g., <em>Birthday Responses</em>).
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-[#FDE8F1] text-[#E889AD] border border-[#F8C8DC] font-bold flex items-center justify-center shrink-0 text-xs">
              2
            </span>
            <div>
              <p className="font-semibold text-[#5A3D4A]">Open Apps Script</p>
              <p className="text-[#5A3D4A]/70 mt-0.5">
                Inside your Google Sheet menu bar, click <strong>Extensions</strong> → <strong>Apps Script</strong>.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-[#FDE8F1] text-[#E889AD] border border-[#F8C8DC] font-bold flex items-center justify-center shrink-0 text-xs">
              3
            </span>
            <div>
              <p className="font-semibold text-[#5A3D4A]">Paste Apps Script Code</p>
              <p className="text-[#5A3D4A]/70 mt-0.5">
                Delete existing template code, then paste the code from <code>/GoogleAppsScript.gs</code>.
              </p>
              <button
                onClick={handleCopyCode}
                className="mt-2 px-4 py-2 rounded-xl bg-[#FDE8F1] hover:bg-[#F8C8DC] text-[#E889AD] border border-[#F8C8DC] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Code Copied!' : 'Copy Apps Script Code'}</span>
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-[#FDE8F1] text-[#E889AD] border border-[#F8C8DC] font-bold flex items-center justify-center shrink-0 text-xs">
              4
            </span>
            <div>
              <p className="font-semibold text-[#5A3D4A]">Enter SPREADSHEET_ID & SHEET_NAME</p>
              <p className="text-[#5A3D4A]/70 mt-0.5">
                Copy the Spreadsheet ID from your browser address bar: <br />
                <code className="text-[#E889AD] font-mono text-[11px] font-semibold">https://docs.google.com/spreadsheets/d/<strong>[SPREADSHEET_ID]</strong>/edit</code>
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-[#FDE8F1] text-[#E889AD] border border-[#F8C8DC] font-bold flex items-center justify-center shrink-0 text-xs">
              5
            </span>
            <div>
              <p className="font-semibold text-[#5A3D4A]">Deploy as Web App</p>
              <ul className="list-disc list-inside text-[#5A3D4A]/70 mt-1 space-y-1">
                <li>Click <strong>Deploy</strong> → <strong>New deployment</strong></li>
                <li>Click the Gear icon ⚙️ → Select <strong>Web app</strong></li>
                <li><strong>Execute as:</strong> Me (your email)</li>
                <li><strong>Who has access:</strong> Anyone (required for secure frontend POST)</li>
                <li>Click <strong>Deploy</strong> and approve permissions</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-[#FDE8F1] text-[#E889AD] border border-[#F8C8DC] font-bold flex items-center justify-center shrink-0 text-xs">
              6
            </span>
            <div>
              <p className="font-semibold text-[#5A3D4A]">Paste Web App URL</p>
              <p className="text-[#5A3D4A]/70 mt-0.5">
                Copy the Web App URL (ends with <code>/exec</code>) and paste it into <br />
                <code>src/config.ts</code>: <code className="text-[#E889AD] font-mono font-semibold">GOOGLE_APPS_SCRIPT_URL</code>.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#F8C8DC] flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-6 py-2.5 rounded-full text-xs font-bold text-white btn-pink-gradient cursor-pointer"
          >
            Got It! Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
