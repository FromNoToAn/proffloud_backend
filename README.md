# ProffLoud Backend

Backend API для обработки заявок с сайта ProffLoud.

## Установка

```bash
npm install
```

## Настройка

1. Скопируйте `.env.example` в `.env`:
```bash
cp .env.example .env
```

2. Отредактируйте `.env` файл и укажите:
   - `SMTP_USER` - ваш email адрес для отправки писем
   - `SMTP_PASS` - пароль приложения (для Gmail нужно создать App Password)
   - `RECIPIENT_EMAIL` - email адрес, куда будут приходить заявки

### Настройка Gmail для отправки писем

1. Включите двухфакторную аутентификацию в вашем Google аккаунте
2. Создайте пароль приложения: https://myaccount.google.com/apppasswords
3. Используйте этот пароль в `SMTP_PASS`

### Альтернативные SMTP провайдеры

Вы можете использовать другие SMTP провайдеры (Yandex, Mail.ru, SendGrid и т.д.), изменив настройки в `.env`:

- **Yandex**: `SMTP_HOST=smtp.yandex.ru`, `SMTP_PORT=465`, `SMTP_SECURE=true`
- **Mail.ru**: `SMTP_HOST=smtp.mail.ru`, `SMTP_PORT=465`, `SMTP_SECURE=true`

## Запуск

```bash
# Development mode (с автоперезагрузкой)
npm run dev

# Production mode
npm start
```

Сервер будет доступен на `http://localhost:3001`

## CORS

Бекенд настроен для приема запросов со следующих доменов:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (альтернативный dev порт)
- `https://proffloud.ru`
- `http://proffloud.ru`

Если нужно добавить другие домены, отредактируйте `allowedOrigins` в `server.js`.

## Деплой на Vercel

1. Убедитесь, что в корне проекта есть `vercel.json`
2. В настройках проекта Vercel добавьте переменные окружения из `.env`:
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_SECURE`
   - `SMTP_USER`
   - `SMTP_PASS`
   - `RECIPIENT_EMAIL`
3. После деплоя получите URL вашего бекенда (например, `https://proffloud-backend.vercel.app`)
4. Используйте этот URL в `.env.production` файле фронтенда

## API Endpoints

### POST /api/submit-form

Отправляет заявку с сайта на указанный email.

**Request Body:**
```json
{
  "name": "Иван Иванов",
  "email": "ivan@example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Форма успешно отправлена!"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Ошибка при отправке формы. Попробуйте еще раз."
}
```

### GET /health

Проверка работоспособности сервера.

