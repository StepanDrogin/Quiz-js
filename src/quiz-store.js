export const ATTEMPTS_KEY = "quiz-chat-attempts";
export const PLAYER_KEY = "quiz-chat-player";

export function publicQuestions(questions) {
  return questions.map((question) => ({
    id: question.id,
    text: question.text,
    answers: question.answers.map((answer) => ({
      id: answer.id,
      text: answer.text
    }))
  }));
}

export function latestAttempts(attempts, limit = 8) {
  return [...attempts]
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
    .slice(0, limit)
    .map(({ id, playerName, score, totalScore, resultTitle, createdAt }) => ({
      id,
      playerName,
      score,
      totalScore,
      resultTitle,
      createdAt
    }));
}

export function totalScore(questions) {
  return questions.reduce((sum, question) => {
    const maxAnswerValue = Math.max(
      ...question.answers.map((answer) => answer.value)
    );
    return sum + maxAnswerValue;
  }, 0);
}

export function calculateStats(attempts, maxScore) {
  if (!attempts.length) {
    return {
      participants: 0,
      averageScore: 0,
      bestScore: 0,
      totalScore: maxScore
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
    totalScore: maxScore
  };
}

export function pickResult(results, score) {
  return results.reduce((picked, result) => {
    if (score >= result.minScore && result.minScore >= picked.minScore) {
      return result;
    }

    return picked;
  }, results[0]);
}

export function normalizeName(playerName) {
  const value = String(playerName || "").trim();
  return value ? value.slice(0, 48) : "Гость";
}

export function scoreAnswers(questions, answers) {
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

function readAttempts(storage) {
  if (!storage) {
    return [];
  }

  try {
    const value = storage.getItem(ATTEMPTS_KEY);
    const attempts = value ? JSON.parse(value) : [];
    return Array.isArray(attempts) ? attempts : [];
  } catch {
    return [];
  }
}

function writeAttempts(storage, attempts) {
  if (!storage) {
    return;
  }

  storage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts.slice(0, 50)));
}

function createId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getPlayerName(storage) {
  return storage?.getItem(PLAYER_KEY) || "";
}

export function savePlayerName(storage, playerName) {
  storage?.setItem(PLAYER_KEY, playerName);
}

export function getPublicQuiz(seed, storage) {
  const maxScore = totalScore(seed.questions);
  const localAttempts = readAttempts(storage);
  const attempts = [...localAttempts, ...seed.attempts];

  return {
    quiz: {
      ...seed.quiz,
      maxScore
    },
    questions: publicQuestions(seed.questions),
    attempts: latestAttempts(attempts),
    stats: calculateStats(attempts, maxScore)
  };
}

export function createAttempt(seed, payload, storage) {
  const answers = Array.isArray(payload?.answers) ? payload.answers : [];
  const score = scoreAnswers(seed.questions, answers);
  const maxScore = totalScore(seed.questions);
  const result = pickResult(seed.results, score);
  const localAttempts = readAttempts(storage);

  const attempt = {
    id: createId(),
    playerName: normalizeName(payload?.playerName),
    score,
    totalScore: maxScore,
    resultTitle: result.title,
    resultDescription: result.description,
    createdAt: new Date().toISOString(),
    answers: answers.map((answer) => ({
      questionId: String(answer.questionId),
      answerId: String(answer.answerId)
    }))
  };

  const nextLocalAttempts = [attempt, ...localAttempts].slice(0, 50);
  writeAttempts(storage, nextLocalAttempts);

  const allAttempts = [...nextLocalAttempts, ...seed.attempts];

  return {
    attempt,
    stats: calculateStats(allAttempts, maxScore),
    attempts: latestAttempts(allAttempts)
  };
}
