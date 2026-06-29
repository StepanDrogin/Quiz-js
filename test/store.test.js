import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createAttempt, getPublicQuiz, __private__scoreAnswers } from "../server/store.js";

async function useTempDb() {
  const dataDir = await fs.mkdtemp(path.join(os.tmpdir(), "quiz-chat-"));
  process.env.DATA_DIR = dataDir;
  process.env.DB_FILE = path.join(dataDir, "db.json");
}

test("public quiz does not expose answer values", async () => {
  await useTempDb();
  const payload = await getPublicQuiz();
  const [question] = payload.questions;

  assert.equal(typeof question.text, "string");
  assert.equal(question.answers.some((answer) => "value" in answer), false);
  assert.equal(payload.stats.totalScore, 10);
});

test("server calculates attempt score and appends history", async () => {
  await useTempDb();
  const quiz = await getPublicQuiz();
  const answers = quiz.questions.map((question) => ({
    questionId: question.id,
    answerId: question.answers[0].id
  }));

  const response = await createAttempt({
    playerName: "Тестовый участник",
    answers
  });

  assert.equal(response.attempt.playerName, "Тестовый участник");
  assert.equal(typeof response.attempt.score, "number");
  assert.equal(response.attempt.totalScore, 10);
  assert.equal(response.attempts[0].id, response.attempt.id);
});

test("score helper counts known selected answers", () => {
  const questions = [
    {
      id: "one",
      answers: [
        { id: "wrong", value: 0 },
        { id: "right", value: 1 }
      ]
    }
  ];

  assert.equal(
    __private__scoreAnswers(questions, [{ questionId: "one", answerId: "right" }]),
    1
  );
});
