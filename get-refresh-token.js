import { google } from 'googleapis'
import readline from 'readline'
import dotenv from 'dotenv'

dotenv.config()

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID, // Ваш Client ID
  process.env.GMAIL_CLIENT_SECRET, // Ваш Client Secret
  'urn:ietf:wg:oauth:2.0:oob' // Redirect URI для desktop
)

const scopes = [
  'https://www.googleapis.com/auth/gmail.send'
]

// Получаем email из переменной окружения или запрашиваем у пользователя
const gmailUser = process.env.GMAIL_USER

const authOptions = {
  access_type: 'offline',
  scope: scopes,
  prompt: 'consent' // Важно: запрашивает refresh token
}

// Если указан GMAIL_USER, добавляем login_hint для выбора нужного аккаунта
if (gmailUser) {
  authOptions.login_hint = gmailUser
  console.log(`📧 Используется аккаунт: ${gmailUser}`)
  console.log('💡 Если в браузере откроется другой аккаунт:')
  console.log('   1. Нажмите "Выбрать аккаунт" внизу окна авторизации')
  console.log('   2. Или выйдите из текущего аккаунта Google и войдите нужным\n')
} else {
  console.log('💡 Подсказка: добавьте GMAIL_USER=ваш-email@gmail.com в .env для автоматического выбора аккаунта\n')
}

const authUrl = oauth2Client.generateAuthUrl(authOptions)

console.log('🌐 Откройте этот URL в браузере:')
console.log(authUrl)
console.log('\n📝 Инструкция:')
console.log('   1. Откройте URL выше в браузере')
if (gmailUser) {
  console.log(`   2. Авторизуйтесь аккаунтом: ${gmailUser}`)
} else {
  console.log('   2. Авторизуйтесь нужным Gmail аккаунтом')
}
console.log('   3. Предоставьте разрешения приложению')
console.log('   4. Скопируйте код авторизации из браузера')
console.log('   5. Вставьте код ниже\n')
console.log('⚠️  Если видите ошибку 403: access_denied, см. OAUTH_403_FIX.md\n')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.question('Введите код: ', async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code)
    console.log('\n✅ Успешно! Добавьте эту переменную в .env файл:\n')
    console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`)
    if (tokens.refresh_token) {
      console.log('\n⚠️  Сохраните этот refresh token в безопасном месте!')
    } else {
      console.log('\n⚠️  Refresh token не получен. Убедитесь, что вы используете prompt: "consent"')
    }
    rl.close()
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Ошибка:', error.message)
    if (error.response) {
      console.error('Детали:', error.response.data)
    }
    rl.close()
    process.exit(1)
  }
})

