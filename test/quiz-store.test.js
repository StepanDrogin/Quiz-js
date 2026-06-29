import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";
import {
  ATTEMPTS_KEY,
  createAttempt,
  getPublicQuiz,
  scoreAnswers
} from "../src/quiz-store.js";

async function readSeed() {
  const raw = await fs.readFile(new URL("../data/seed.json", import.meta.url), "utf8");
  return JSON.parse(raw);
}

function createStorage() {
  const values = new Map();

  return {
    getItem(key) {
      return values.get(key) || null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    }
  };
}

test("public quiz does not expose answer values", async () => {
  const seed = await readSeed();
  const payload = getPublicQuiz(seed, createStorage());
  const [question] = payload.questions;

  assert.equal(typeof question.text, "string");
  assert.equal(question.answers.some((answer) => "value" in answer), false);
  assert.equal(payload.stats.totalScore, 10);
});

test("local attempt is scored and stored", async () => {
  const seed = await readSeed();
  const storage = createStorage();
  const quiz = getPublicQuiz(seed, storage);
  const answers = quiz.questions.map((question) => ({
    questionId: question.id,
    answerId: question.answers[0].id
  }));

  const response = createAttempt(
    seed,
    {
      playerName: "Тестовый участник",
      answers
    },
    storage
  );
  const storedAttempts = JSON.parse(storage.getItem(ATTEMPTS_KEY));

  assert.equal(response.attempt.playerName, "Тестовый участник");
  assert.equal(typeof response.attempt.score, "number");
  assert.equal(response.attempt.totalScore, 10);
  assert.equal(storedAttempts[0].id, response.attempt.id);
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
    scoreAnswers(questions, [{ questionId: "one", answerId: "right" }]),
    1
  );
});
