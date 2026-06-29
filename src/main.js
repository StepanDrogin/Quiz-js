import "./styles.css";
import seed from "../data/seed.json";
import {
  createAttempt,
  getPlayerName,
  getPublicQuiz,
  savePlayerName
} from "./quiz-store.js";

const app = document.querySelector("#app");
const answerLetters = ["A", "B", "C", "D", "E", "F"];

const state = {
  data: null,
  loading: true,
  error: "",
  notice: "",
  view: "intro",
  currentIndex: 0,
  selectedAnswerId: "",
  answers: {},
  playerName: getPlayerName(window.localStorage),
  submitting: false,
  submitError: "",
  result: null
};

const icons = {
  link: `<svg aria-hidden="true" viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l2-2a5 5 0 0 0-7.07-7.07l-1.15 1.15"/><path d="M14 11a5 5 0 0 0-7.54-.54l-2 2a5 5 0 0 0 7.07 7.07l1.15-1.15"/></svg>`,
  users: `<svg aria-hidden="true" viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  arrow: `<svg aria-hidden="true" viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`,
  restart: `<svg aria-hidden="true" viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 3v6h6"/></svg>`
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(value) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function getQuestions() {
  return state.data?.questions || [];
}

function getStats() {
  return (
    state.data?.stats || {
      participants: 0,
      averageScore: 0,
      bestScore: 0,
      totalScore: 10
    }
  );
}

function getProgress() {
  const questions = getQuestions();

  if (!questions.length || state.view === "intro") {
    return 0;
  }

  if (state.view === "result") {
    return 100;
  }

  return Math.round(((state.currentIndex + 1) / questions.length) * 100);
}

function loadQuiz() {
  state.loading = true;
  state.error = "";
  render();

  try {
    state.data = getPublicQuiz(seed, window.localStorage);
  } catch {
    state.error = "Не удалось загрузить локальные данные квиза.";
  } finally {
    state.loading = false;
    render();
  }
}

function renderLoading() {
  return `
    <div class="app-shell grid place-items-center p-6">
      <section class="panel w-[min(100%,480px)] p-6">
        <h1 class="ui-title text-2xl">Quiz Chat</h1>
        <p class="mt-3 text-sm leading-6 text-ink-muted">Загружаю вопросы и историю прохождений.</p>
      </section>
    </div>
  `;
}

function renderError() {
  return `
    <div class="app-shell grid place-items-center p-6">
      <section class="panel w-[min(100%,520px)] p-6">
        <h1 class="ui-title text-2xl">Quiz Chat</h1>
        <p class="mt-3 text-sm leading-6 text-danger">${escapeHtml(state.error)}</p>
        <button class="ui-button button-primary mt-5" data-action="retry">
          <span class="ui-span">Повторить</span>
        </button>
      </section>
    </div>
  `;
}

function renderTopbar() {
  const stats = getStats();

  return `
    <header class="app-topbar">
      <div class="mx-auto flex w-[min(100%,1440px)] items-center justify-between gap-4 px-4 py-4 md:px-6">
        <div class="flex min-w-0 items-center gap-3">
          <span class="ui-span chat-badge grid h-10 w-10 shrink-0 place-items-center rounded-control text-sm font-bold text-white">QC</span>
          <span class="ui-span truncate text-xl font-semibold text-ink">Quiz Chat</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="ui-span hidden items-center gap-2 text-sm font-medium text-ink-muted sm:inline-flex">
            ${icons.users}
            Участники: ${stats.participants}
          </span>
          <button class="ui-button button-secondary" data-action="copy-link">
            ${icons.link}
            <span class="ui-span hidden sm:inline-flex">Скопировать ссылку</span>
            <span class="ui-span sm:hidden">Ссылка</span>
          </button>
        </div>
      </div>
    </header>
  `;
}

function renderSidebar() {
  const { quiz } = state.data;
  const stats = getStats();
  const questions = getQuestions();
  const progress = getProgress();
  const currentLabel =
    state.view === "result"
      ? `${questions.length} из ${questions.length}`
      : state.view === "intro"
        ? `0 из ${questions.length}`
        : `${state.currentIndex + 1} из ${questions.length}`;
  const scoreLabel = state.result
    ? `${state.result.score} из ${state.result.totalScore}`
    : `${Object.keys(state.answers).length} ответов`;

  return `
    <aside class="order-2 space-y-4 md:order-none">
      <section class="panel carnival-card quiz-identity p-5">
        <h1 class="ui-title text-2xl leading-tight">${escapeHtml(quiz.title)}</h1>
        <p class="mt-3 text-sm leading-6 text-ink-muted">${escapeHtml(quiz.description)}</p>
      </section>

      <section class="metric-card">
        <div class="flex items-center justify-between gap-3">
          <h2 class="ui-title text-base">Прогресс</h2>
          <span class="ui-span text-sm font-semibold text-ink-muted">${progress}%</span>
        </div>
        <div class="progress-track mt-4">
          <div class="progress-bar" style="width: ${progress}%"></div>
        </div>
        <div class="mt-3 flex items-center justify-between text-sm text-ink-muted">
          <span class="ui-span">Вопрос ${currentLabel}</span>
          <span class="ui-span">${escapeHtml(quiz.totalLabel)}</span>
        </div>
      </section>

      <section class="metric-card">
        <h2 class="ui-title text-base">Счёт</h2>
        <div class="mt-4 flex items-end justify-between gap-4">
          <span class="ui-span text-4xl font-semibold text-accent">${escapeHtml(scoreLabel)}</span>
          <span class="ui-span text-sm text-ink-muted">Лучший: ${stats.bestScore} из ${stats.totalScore}</span>
        </div>
      </section>

      <section class="panel carnival-card overflow-hidden">
        <div class="flex items-center justify-between gap-3 px-4 py-4">
          <h2 class="ui-title text-base">История</h2>
          <span class="ui-span text-sm text-ink-muted">Средний ${stats.averageScore}</span>
        </div>
        ${renderHistory()}
      </section>

      <button class="ui-button button-primary w-full" data-action="restart">
        ${icons.restart}
        <span class="ui-span">${state.view === "intro" ? "Начать квиз" : "Начать заново"}</span>
      </button>
    </aside>
  `;
}

function renderHistory() {
  const attempts = (state.data?.attempts || []).slice(0, 3);

  if (!attempts.length) {
    return `
      <div class="history-row">
        <p class="text-sm leading-6 text-ink-muted">История появится после первого прохождения.</p>
      </div>
    `;
  }

  return attempts
    .map(
      (attempt) => `
        <div class="history-row">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-ink">${escapeHtml(attempt.playerName)}</p>
              <p class="mt-1 text-xs text-ink-muted">${escapeHtml(attempt.resultTitle)}</p>
            </div>
            <div class="shrink-0 text-right">
              <span class="ui-span text-sm font-semibold text-success">${attempt.score} из ${attempt.totalScore}</span>
              <p class="mt-1 text-xs text-ink-muted">${formatDate(attempt.createdAt)}</p>
            </div>
          </div>
        </div>
      `
    )
    .join("");
}

function renderMainPanel() {
  const content =
    state.view === "result"
      ? renderResult()
      : state.view === "quiz"
        ? renderQuestion()
        : renderIntro();

  return `
    <main class="panel carnival-stage order-1 overflow-hidden md:order-none md:min-h-[calc(100vh-112px)]">
      <div class="border-b border-line px-5 py-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="ui-title text-lg">Комната квиза</h2>
            <p class="mt-1 text-sm text-ink-muted">Короткая комната для своих.</p>
          </div>
          ${state.notice ? `<span class="ui-span rounded-control bg-success-soft px-3 py-2 text-sm font-medium text-success">${escapeHtml(state.notice)}</span>` : ""}
        </div>
      </div>
      <div class="px-4 py-5 md:px-7 md:py-7">
        ${content}
      </div>
    </main>
  `;
}

function renderIntro() {
  const { quiz } = state.data;

  return `
    <section class="mx-auto max-w-3xl">
      <div class="mb-8 flex items-start gap-4">
        <span class="ui-span chat-badge grid h-12 w-12 shrink-0 place-items-center rounded-control text-sm font-bold text-white">QC</span>
        <div class="subpanel festival-note max-w-xl px-5 py-4">
          <div class="flex items-center gap-3">
            <span class="ui-span text-sm font-semibold text-ink">Quiz Chat</span>
            <span class="ui-span text-sm text-ink-muted">${formatDate(new Date())}</span>
          </div>
          <p class="mt-3 text-base leading-7 text-ink">Привет. Готов проверить, насколько хорошо ты знаешь ${escapeHtml(quiz.ownerName)}?</p>
        </div>
      </div>

      <div class="subpanel festival-note quiz-ticket px-5 py-5 md:px-6">
        <h2 class="ui-title text-2xl leading-tight">${escapeHtml(quiz.title)}</h2>
        <p class="mt-3 max-w-xl text-sm leading-6 text-ink-muted">${getQuestions().length} коротких вопросов и аккуратный финальный счёт.</p>
        <label class="mt-6 block">
          <span class="ui-span mb-2 text-sm font-semibold text-ink">Имя участника</span>
          <input class="input-field" data-field="player-name" value="${escapeHtml(state.playerName)}" placeholder="Гость" maxlength="48" />
        </label>
        <button class="ui-button button-primary mt-5" data-action="start">
          <span class="ui-span">Начать квиз</span>
          ${icons.arrow}
        </button>
      </div>
    </section>
  `;
}

function renderQuestion() {
  const questions = getQuestions();
  const question = questions[state.currentIndex];
  const selectedAnswerId = state.selectedAnswerId;
  const actionLabel =
    state.currentIndex === questions.length - 1 ? "Завершить квиз" : "Следующий вопрос";

  return `
    <section class="mx-auto max-w-4xl">
      <div class="mb-8 flex items-start gap-4">
        <span class="ui-span chat-badge grid h-12 w-12 shrink-0 place-items-center rounded-control text-sm font-bold text-white">QC</span>
        <div class="subpanel festival-note max-w-xl px-5 py-4">
          <div class="flex items-center gap-3">
            <span class="ui-span text-sm font-semibold text-ink">Quiz Chat</span>
            <span class="ui-span text-sm text-ink-muted">${formatDate(new Date())}</span>
          </div>
          <p class="mt-3 text-base leading-7 text-ink">Вопрос ${state.currentIndex + 1} из ${questions.length}</p>
        </div>
      </div>

      <div class="subpanel festival-note quiz-ticket px-5 py-5 md:px-6">
        <span class="ui-span text-sm text-ink-muted">Вопрос ${state.currentIndex + 1}</span>
        <h2 class="ui-title mt-3 text-2xl leading-tight">${escapeHtml(question.text)}</h2>
        <div class="mt-6 grid gap-3">
          ${question.answers
            .map((answer, index) => renderAnswerButton(answer, index, selectedAnswerId))
            .join("")}
        </div>
        ${state.submitError ? `<p class="mt-4 text-sm font-medium text-danger">${escapeHtml(state.submitError)}</p>` : ""}
        <div class="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
          <span class="ui-span text-sm text-ink-muted">${selectedAnswerId ? "Ответ выбран" : "Выбери вариант ответа"}</span>
          <button class="ui-button button-primary" data-action="commit-answer" ${selectedAnswerId && !state.submitting ? "" : "disabled"}>
            <span class="ui-span">${state.submitting ? "Сохраняю" : actionLabel}</span>
            ${icons.arrow}
          </button>
        </div>
      </div>
    </section>
  `;
}

function renderAnswerButton(answer, index, selectedAnswerId) {
  const selected = answer.id === selectedAnswerId;

  return `
    <button class="ui-button answer-button ${selected ? "answer-button-selected" : ""}" data-action="select-answer" data-answer-id="${escapeHtml(answer.id)}">
      <span class="ui-span answer-marker">${answerLetters[index] || index + 1}</span>
      <span class="ui-span flex-1 items-start text-left">${escapeHtml(answer.text)}</span>
    </button>
  `;
}

function renderResult() {
  const result = state.result;

  return `
    <section class="mx-auto max-w-4xl">
      <div class="mb-8 flex items-start gap-4">
        <span class="ui-span chat-badge grid h-12 w-12 shrink-0 place-items-center rounded-control text-sm font-bold text-white">QC</span>
        <div class="subpanel festival-note max-w-xl px-5 py-4">
          <div class="flex items-center gap-3">
            <span class="ui-span text-sm font-semibold text-ink">Quiz Chat</span>
            <span class="ui-span text-sm text-ink-muted">${formatDate(result.createdAt)}</span>
          </div>
          <p class="mt-3 text-base leading-7 text-ink">Результат сохранён в истории.</p>
        </div>
      </div>

      <div class="subpanel festival-note quiz-ticket px-5 py-5 md:px-6">
        <span class="ui-span text-sm text-ink-muted">${escapeHtml(result.playerName)}</span>
        <h2 class="ui-title mt-3 text-3xl leading-tight">${escapeHtml(result.resultTitle)}</h2>
        <p class="mt-4 max-w-2xl text-base leading-7 text-ink-muted">${escapeHtml(result.resultDescription)}</p>
        <div class="mt-6 grid gap-3 sm:grid-cols-3">
          <div class="metric-card">
            <span class="ui-span text-sm text-ink-muted">Счёт</span>
            <p class="mt-2 text-3xl font-semibold text-accent">${result.score} из ${result.totalScore}</p>
          </div>
          <div class="metric-card">
            <span class="ui-span text-sm text-ink-muted">Отвечено</span>
            <p class="mt-2 text-3xl font-semibold text-ink">${Object.keys(state.answers).length}</p>
          </div>
          <div class="metric-card">
            <span class="ui-span text-sm text-ink-muted">История</span>
            <p class="mt-2 text-3xl font-semibold text-ink">${state.data.attempts.length}</p>
          </div>
        </div>
        <div class="mt-6 flex flex-wrap gap-3 border-t border-line pt-5">
          <button class="ui-button button-primary" data-action="restart">
            ${icons.restart}
            <span class="ui-span">Пройти ещё раз</span>
          </button>
          <button class="ui-button button-secondary" data-action="copy-link">
            ${icons.link}
            <span class="ui-span">Скопировать ссылку</span>
          </button>
        </div>
      </div>
    </section>
  `;
}

function render() {
  if (state.loading) {
    app.innerHTML = renderLoading();
    return;
  }

  if (state.error) {
    app.innerHTML = renderError();
    return;
  }

  app.innerHTML = `
    <div class="app-shell">
      ${renderTopbar()}
      <div class="layout-grid">
        ${renderSidebar()}
        ${renderMainPanel()}
      </div>
    </div>
  `;
}

function resetQuiz() {
  state.view = "quiz";
  state.currentIndex = 0;
  state.selectedAnswerId = "";
  state.answers = {};
  state.result = null;
  state.submitError = "";
  render();
}

async function submitAttempt() {
  state.submitting = true;
  state.submitError = "";
  render();

  try {
    const payload = {
      playerName: state.playerName,
      answers: Object.entries(state.answers).map(([questionId, answerId]) => ({
        questionId,
        answerId
      }))
    };
    const response = createAttempt(seed, payload, window.localStorage);

    state.result = response.attempt;
    state.data.attempts = response.attempts;
    state.data.stats = response.stats;
    state.view = "result";
    savePlayerName(window.localStorage, state.playerName);
  } catch {
    state.submitError = "Не удалось сохранить результат. Попробуй ещё раз.";
  } finally {
    state.submitting = false;
    render();
  }
}

async function copyLink() {
  await navigator.clipboard.writeText(window.location.href);
  state.notice = "Ссылка скопирована";
  render();

  window.setTimeout(() => {
    state.notice = "";
    render();
  }, 1800);
}

app.addEventListener("input", (event) => {
  if (event.target.matches('[data-field="player-name"]')) {
    state.playerName = event.target.value;
  }
});

app.addEventListener("click", async (event) => {
  const target = event.target.closest("[data-action]");

  if (!target) {
    return;
  }

  const action = target.dataset.action;

  if (action === "retry") {
    loadQuiz();
    return;
  }

  if (action === "start" || action === "restart") {
    resetQuiz();
    return;
  }

  if (action === "copy-link") {
    await copyLink();
    return;
  }

  if (action === "select-answer" && state.view === "quiz") {
    state.selectedAnswerId = target.dataset.answerId;
    render();
    return;
  }

  if (action === "commit-answer" && state.view === "quiz") {
    const questions = getQuestions();
    const currentQuestion = questions[state.currentIndex];
    state.answers[currentQuestion.id] = state.selectedAnswerId;

    if (state.currentIndex === questions.length - 1) {
      await submitAttempt();
      return;
    }

    state.currentIndex += 1;
    state.selectedAnswerId = state.answers[questions[state.currentIndex].id] || "";
    render();
  }
});

loadQuiz();
