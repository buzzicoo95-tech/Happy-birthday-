// =========================================================================
// SOULSYNC BIRTHDAY EXPERIENCE - GOOGLE APPS SCRIPT WEB APP
// =========================================================================
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";
const SHEET_NAME = "Birthday Responses";

const HEADERS = [
  "Submission ID",
  "Timestamp",
  "Name",
  "Birthday",
  "Feeling",
  "Favorite Color",
  "Favorite Food",
  "Favorite Clothes",
  "Favorite Movie",
  "Favorite Song",
  "Favorite Sport",
  "Favorite Place",
  "Tea or Coffee",
  "Morning or Night",
  "Sweet or Spicy",
  "Favorite Hobby",
  "Dream Destination",
  "Similarity Score"
];

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({
        success: false,
        error: "No POST body received."
      });
    }

    const data = JSON.parse(e.postData.contents);

    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
    }

    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    }

    const submissionId = String(data.submissionId || "").trim();

    if (!submissionId) {
      return jsonResponse({
        success: false,
        error: "Missing submissionId."
      });
    }

    // Prevent duplicate submissions
    const lastRow = sheet.getLastRow();
    if (lastRow >= 2) {
      const existingIds = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      for (let i = 0; i < existingIds.length; i++) {
        if (String(existingIds[i][0]).trim() === submissionId) {
          return jsonResponse({
            success: true,
            duplicate: true,
            message: "Submission already saved."
          });
        }
      }
    }

    sheet.appendRow([
      submissionId,
      data.timestamp || new Date().toISOString(),
      data.name || "",
      data.birthday || "",
      data.feeling || "",
      data.favoriteColor || "",
      data.favoriteFood || "",
      data.favoriteClothes || "",
      data.favoriteMovie || "",
      data.favoriteSong || "",
      data.favoriteSport || "",
      data.favoritePlace || "",
      data.drink || "",
      data.timePreference || "",
      data.tastePreference || "",
      data.favoriteHobby || "",
      data.dreamDestination || "",
      Number(data.similarityScore) || 0
    ]);

    return jsonResponse({
      success: true,
      duplicate: false,
      message: "Submission saved successfully."
    });

  } catch (error) {
    return jsonResponse({
      success: false,
      error: error.message || String(error)
    });
  }
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function doGet(e) {
  return jsonResponse({
    status: "online",
    message: "SoulSync Birthday Webhook is running! Use POST to submit data."
  });
}
