# Quiz Chat

Статический quiz-chat на Vite + Tailwind. Проект деплоится только через GitHub Pages и не требует Render, backend, карты, внешней базы или секретов.

## Что важно

GitHub Pages отдаёт только статические файлы. Поэтому общая серверная история прохождений между разными пользователями недоступна без внешнего backend.

В этой версии:

- вопросы лежат в `data/seed.json`;
- приложение собирается в статический `dist`;
- результаты и имя участника сохраняются локально в браузере через `localStorage`;
- демо-история из seed показывается всем, а новые попытки видит только текущий браузер.

## Локальный запуск

```bash
npm install
npm run dev
```

Локальный URL:

```text
http://127.0.0.1:5173
```

## Проверки

```bash
npm test
npm run build
npm run preview
```

## Деплой на GitHub Pages

Деплой описан в `.github/workflows/pages.yml`.

После каждого push в `main` GitHub Actions:

1. устанавливает зависимости;
2. запускает тесты;
3. собирает проект;
4. публикует `dist` в GitHub Pages.

В настройках репозитория нужно один раз включить Pages через GitHub Actions:

```text
Settings -> Pages -> Build and deployment -> Source -> GitHub Actions
```

После успешного workflow сайт будет доступен по адресу:

```text
https://StepanDrogin.github.io/Quiz-js/
```
