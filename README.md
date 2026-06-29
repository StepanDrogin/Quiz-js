# Quiz Chat

Лёгкий full-stack quiz-chat: Vite + Tailwind на клиенте, Node API и файловая JSON-БД на сервере.

## Локальный запуск

```bash
npm install
npm run dev
```

Frontend откроется на `http://127.0.0.1:5173`, API работает на `http://127.0.0.1:3000`.

## Проверки

```bash
npm test
npm run build
npm start
```

После `npm start` production-сборка доступна на `http://localhost:3000`.

## Данные

Первый запуск создаёт `data/db.json` из `data/seed.json`. В git хранится только seed, runtime-БД игнорируется.

Для деплоя можно задать:

```bash
DATA_DIR=/var/data
```

## Автодеплой

В репозитории есть:

- `render.yaml` для Render Blueprint с persistent disk на `/var/data`.
- `.github/workflows/ci-deploy.yml` для тестов, сборки и опционального Render Deploy Hook.

Чтобы включить deploy hook через GitHub Actions, добавь секрет `RENDER_DEPLOY_HOOK_URL` в настройках GitHub Actions.
