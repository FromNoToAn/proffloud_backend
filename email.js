import { google } from 'googleapis'
import dotenv from 'dotenv'

dotenv.config()

// Gmail API отправка email
export const sendFormEmail = async (name, email) => {
  // Проверка обязательных переменных окружения
  if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET) {
    throw new Error('GMAIL_CLIENT_ID и GMAIL_CLIENT_SECRET должны быть настроены в .env файле')
  }

  if (!process.env.GMAIL_REFRESH_TOKEN) {
    throw new Error('GMAIL_REFRESH_TOKEN должен быть настроен в .env файле')
  }

  if (!process.env.GMAIL_USER) {
    throw new Error('GMAIL_USER должен быть настроен в .env файле (ваш Gmail адрес)')
  }

  if (!process.env.RECIPIENT_EMAIL) {
    throw new Error('RECIPIENT_EMAIL должно быть настроено в .env файле')
  }

  try {
    // Настройка OAuth2 клиента
    const oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      'urn:ietf:wg:oauth:2.0:oob' // Redirect URI для desktop приложений
    )

    // Устанавливаем refresh token
    oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN
    })

    // Получаем access token
    const accessToken = await oauth2Client.getAccessToken()

    if (!accessToken.token) {
      throw new Error('Не удалось получить access token. Проверьте GMAIL_REFRESH_TOKEN.')
    }

    // Создаем Gmail API клиент
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

    // Подготавливаем HTML содержимое письма
    const htmlBody = `<h2>Новая заявка с сайта ProffLoud</h2>
<p><strong>Имя:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<hr>
<p><em>Дата отправки: ${new Date().toLocaleString('ru-RU')}</em></p>`

    // Кодируем subject в base64 для правильной поддержки кириллицы
    const subject = 'Заявка с сайта ProffLoud'
    const encodedSubject = `=?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`

    // Подготавливаем email сообщение в формате RFC 2822
    const emailContent = [
      `From: ${process.env.GMAIL_USER}`,
      `To: ${process.env.RECIPIENT_EMAIL}`,
      `Subject: ${encodedSubject}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=UTF-8`,
      `Content-Transfer-Encoding: 8bit`,
      ``,
      htmlBody
    ].join('\r\n')

    // Кодируем сообщение в base64url формат (требуется Gmail API)
    const encodedMessage = Buffer.from(emailContent)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

    // Отправляем email через Gmail API
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    })

    console.log('Email sent successfully via Gmail API:', response.data.id)
    return response.data
  } catch (error) {
    console.error('Error sending email via Gmail API:', error.message)
    if (error.response) {
      console.error('Gmail API error response:', error.response.data)
    }
    throw error
  }
}
