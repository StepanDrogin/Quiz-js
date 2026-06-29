import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";

const ROOT_DIR = process.cwd();
const SEED_FILE = path.join(ROOT_DIR, "data", "seed.json");

function getDataDir() {
  return process.env.DATA_DIR || path.join(ROOT_DIR, "data");
}

function getDbFile() {
  return process.env.DB_FILE || path.join(getDataDir(), "db.json");
}

async function ensureDb() {
  const dbFile = getDbFile();

  if (existsSync(dbFile)) {
    return;
  }

  await fs.mkdir(path.dirname(dbFile), { recursive: true });
  const seed = await fs.readFile(SEED_FILE, "utf8");
  await fs.writeFile(dbFile, seed, "utf8");
}

async function readDb() {
  await ensureDb();
  const raw = await fs.readFile(getDbFile(), "utf8");
  return JSON.parse(raw);
}

async function writeDb(db) {
  const dbFile = getDbFile();
  const tempFile = `${dbFile}.${process.pid}.tmp`;
  await fs.writeFile(tempFile, `${JSON.stringify(db, null, 2)}\n`, "utf8");
  await fs.rename(tempFile, dbFile);
}

function publicQuestions(questions) {
  return questions.map((question) => ({
    id: question.id,
    text: question.text,
    answers: question.answers.map((answer) => ({
      id: answer.id,
      text: answer.text
    }))
  }));
}

function latestAttempts(attempts) {
  return [...attempts]
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
    .slice(0, 8)
    .map(({ id, playerName, score, totalScore, resultTitle, createdAt }) => ({
      id,
      playerName,
      score,
      totalScore,
      resultTitle,
      createdAt
    }));
}

function calculateStats(attempts, totalScore) {
  if (!attempts.length) {
    return {
      participants: 0,
      averageScore: 0,
      bestScore: 0,
      totalScore
    };
  }

  const scoreSum = attempts.reduce((sum, attempt) => sum + attempt.score, 0);
  const bestScore = attempts.reduce(
    (best, attempt) => Math.max(best, attempt.score),
    0
  );

  return {
    participants: attempts.length,
    averageScore: Math.round((scoreSum / attempts.length) * 10) / 10,
    bestScore,
    totalScore
  };
}

function totalScore(questions) {
  return questions.reduce((sum, question) => {
    const maxAnswerValue = Math.max(
      ...question.answers.map((answer) => answer.value)
    );
    return sum + maxAnswerValue;
  }, 0);
}

function pickResult(results, score) {
  return results.reduce((picked, result) => {
    if (score >= result.minScore && result.minScore >= picked.minScore) {
      return result;
    }

    return picked;
  }, results[0]);
}

function normalizeName(playerName) {
  const value = String(playerName || "").trim();

  if (!value) {
    return "Гость";
  }

  return value.slice(0, 48);
}

function scoreAnswers(questions, answers) {
  const answerMap = new Map(
    answers.map((answer) => [answer.questionId, answer.answerId])
  );

  return questions.reduce((score, question) => {
    const selectedAnswerId = answerMap.get(question.id);
    const selectedAnswer = question.answers.find(
      (answer) => answer.id === selectedAnswerId
    );

    return score + (selectedAnswer?.value || 0);
  }, 0);
}

export async function getPublicQuiz() {
  const db = await readDb();
  const maxScore = totalScore(db.questions);

  return {
    quiz: {
      ...db.quiz,
      maxScore
    },
    questions: publicQuestions(db.questions),
    attempts: latestAttempts(db.attempts),
    stats: calculateStats(db.attempts, maxScore)
  };
}

export async function createAttempt(payload) {
  const db = await readDb();
  const answers = Array.isArray(payload?.answers) ? payload.answers : [];
  const score = scoreAnswers(db.questions, answers);
  const maxScore = totalScore(db.questions);
  const result = pickResult(db.results, score);
  const createdAt = new Date().toISOString();

  const attempt = {
    id: randomUUID(),
    playerName: normalizeName(payload?.playerName),
    score,
    totalScore: maxScore,
    resultTitle: result.title,
    resultDescription: result.description,
    createdAt,
    answers: answers.map((answer) => ({
      questionId: String(answer.questionId),
      answerId: String(answer.answerId)
    }))
  };

  db.attempts = [attempt, ...db.attempts].slice(0, 50);
  await writeDb(db);

  return {
    attempt,
    stats: calculateStats(db.attempts, maxScore),
    attempts: latestAttempts(db.attempts)
  };
}

export function __private__scoreAnswers(questions, answers) {
  return scoreAnswers(questions, answers);
}
