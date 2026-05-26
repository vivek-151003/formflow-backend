const express = require("express");
const db = require("../db");
const router = express.Router();

// Submit response
router.post("/", async (req, res) => {
  const { survey_id, answers } = req.body; // answers: [{question_id, answer_text, rating_value, mcq_answer}]

  try {
    // Check if survey is active
    const [survey] = await db.query(
      "SELECT is_active FROM surveys WHERE id = ?",
      [survey_id],
    );
    if (survey[0].is_active === 0) {
      return res.status(403).json({ error: "Survey is closed" });
    }

    // Insert each answer
    for (const answer of answers) {
      await db.query(
        `INSERT INTO responses (survey_id, question_id, answer_text, rating_value, mcq_answer) 
                 VALUES (?, ?, ?, ?, ?)`,
        [
          survey_id,
          answer.question_id,
          answer.answer_text,
          answer.rating_value,
          answer.mcq_answer,
        ],
      );
    }

    res.status(201).json({ message: "Response submitted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all responses for a survey (with analytics)
router.get("/survey/:surveyId", async (req, res) => {
  const { surveyId } = req.params;
  const { start_date, end_date } = req.query;

  try {
    let query = `
            SELECT r.*, q.question_text, q.question_type 
            FROM responses r
            JOIN questions q ON r.question_id = q.id
            WHERE r.survey_id = ?
        `;
    let params = [surveyId];

    if (start_date && end_date) {
      query += " AND DATE(r.created_at) BETWEEN ? AND ?";
      params.push(start_date, end_date);
    }

    query += " ORDER BY r.created_at DESC";

    const [responses] = await db.query(query, params);
    res.json(responses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// In routes/responses.js - Update the analytics endpoint
router.get("/analytics/:surveyId", async (req, res) => {
  const { surveyId } = req.params;

  try {
    // Get all questions for this survey
    const [questions] = await db.query(
      "SELECT id, question_text, question_type FROM questions WHERE survey_id = ?",
      [surveyId],
    );

    const analytics = [];

    for (const question of questions) {
      if (question.question_type === "rating") {
        const [ratings] = await db.query(
          `SELECT AVG(rating_value) as average, COUNT(*) as total 
                     FROM responses WHERE question_id = ? AND rating_value IS NOT NULL`,
          [question.id],
        );
        analytics.push({
          question_id: question.id,
          question_text: question.question_text,
          type: "rating",
          average: ratings[0].average ? parseFloat(ratings[0].average) : null,
          total_responses: ratings[0].total || 0,
        });
      } else if (question.question_type === "mcq") {
        const [mcqResults] = await db.query(
          `SELECT mcq_answer, COUNT(*) as count 
                     FROM responses WHERE question_id = ? AND mcq_answer IS NOT NULL
                     GROUP BY mcq_answer`,
          [question.id],
        );
        analytics.push({
          question_id: question.id,
          question_text: question.question_text,
          type: "mcq",
          results: mcqResults || [], // Always return array, never undefined
        });
      } else {
        // Text responses
        const [texts] = await db.query(
          `SELECT answer_text FROM responses WHERE question_id = ? AND answer_text IS NOT NULL`,
          [question.id],
        );
        analytics.push({
          question_id: question.id,
          question_text: question.question_text,
          type: "text",
          responses: texts || [], // Always return array
        });
      }
    }

    // Always send JSON response
    res.json(analytics);
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({
      error: "Failed to fetch analytics",
      details: error.message,
    });
  }
});

// Delete a response
router.delete("/:responseId", async (req, res) => {
  try {
    await db.query("DELETE FROM responses WHERE id = ?", [
      req.params.responseId,
    ]);
    res.json({ message: "Response deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
