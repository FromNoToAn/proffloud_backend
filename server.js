import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { sendFormEmail } from './email.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
const corsOptions = {
  origin: function (origin, callback) {
    // Разрешаем запросы без origin (например, Postman, curl)
    if (!origin) return callback(null, true)
    
    // Разрешенные домены
    const allowedOrigins = [
      'http://localhost:5173', // Vite dev server
      'http://localhost:3000', // Альтернативный dev порт
      'https://proffloud.ru',
      'http://proffloud.ru'
    ]
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

// Form submission endpoint
app.post('/api/submit-form', async (req, res) => {
  try {
    const { name, email } = req.body

    // Validation
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Все поля должны быть заполнены'
      })
    }

    // Email validation (basic)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Некорректный email адрес'
      })
    }

    // Send email
    await sendFormEmail(name, email)

    res.json({
      success: true,
      message: 'Форма успешно отправлена!'
    })
  } catch (error) {
    console.error('Error processing form submission:', error)
    res.status(500).json({
      success: false,
      error: 'Ошибка при отправке формы. Попробуйте еще раз.'
    })
  }
})

// Для Vercel нужно экспортировать app, а не запускать сервер
// При локальной разработке запускаем сервер как обычно
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  })
}

// Экспортируем для Vercel
export default app

