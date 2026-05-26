const express = require("express");
const db = require("../db");
const router = express.Router();

// Add question to survey
router.post("/", async (req, res) => {
  let { survey_id, question_text, question_type, options_json } = req.body;

  // Ensure options_json is proper JSON for MCQ
  if (question_type === "mcq" && options_json) {
    // If it's a string, try to parse it
    if (typeof options_json === "string") {
      try {
        // Check if it's already JSON
        options_json = JSON.parse(options_json);
      } catch (e) {
        // If it's comma-separated string, convert to array
        if (options_json.includes(",")) {
          options_json = options_json.split(",").map((s) => s.trim());
        } else {
          options_json = [options_json];
        }
      }
    }
    // Store as JSON string
    options_json = JSON.stringify(options_json);
  }

  try {
    const [result] = await db.query(
      "INSERT INTO questions (survey_id, question_text, question_type, options_json) VALUES (?, ?, ?, ?)",
      [survey_id, question_text, question_type, options_json || null],
    );

    const [newQuestion] = await db.query(
      "SELECT * FROM questions WHERE id = ?",
      [result.insertId],
    );
    res.status(201).json(newQuestion[0]);
  } catch (error) {
    console.error("Error adding question:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete question
router.delete("/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM questions WHERE id = ?", [req.params.id]);
    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
