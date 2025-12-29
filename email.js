import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

// Create transporter for email sending
const createTransporter = () => {
  const port = parseInt(process.env.SMTP_PORT || '587')
  const isSecure = process.env.SMTP_SECURE === 'true' || port === 465
  
  const config = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: port,
    secure: isSecure, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER, // Email адрес для отправки
      pass: process.env.SMTP_PASS  // Пароль приложения
    },
    // Увеличенные таймауты для Render и других облачных платформ
    connectionTimeout: 60000, // 60 секунд для установки соединения
    greetingTimeout: 30000, // 30 секунд для получения приветствия
    socketTimeout: 60000, // 60 секунд для операций сокета
    // Для порта 587 (STARTTLS)
    requireTLS: port === 587
  }
  
  // TLS настройки
  config.tls = {
    rejectUnauthorized: false, // Для некоторых провайдеров нужно отключить проверку сертификата
    minVersion: 'TLSv1.2'
  }
  
  return nodemailer.createTransport(config)
}

// Send form submission email
export const sendFormEmail = async (name, email) => {
  const transporter = createTransporter()

  // Validate required environment variables
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP credentials are not configured. Please check your .env file.')
  }

  if (!process.env.RECIPIENT_EMAIL) {
    throw new Error('RECIPIENT_EMAIL is not configured. Please check your .env file.')
  }

  // Email content
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: process.env.RECIPIENT_EMAIL,
    subject: 'Заявка с сайта',
    html: `
      <h2>Новая заявка с сайта ProffLoud</h2>
      <p><strong>Имя:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <hr>
      <p><em>Дата отправки: ${new Date().toLocaleString('ru-RU')}</em></p>
    `,
    text: `
Новая заявка с сайта ProffLoud

Имя: ${name}
Email: ${email}

Дата отправки: ${new Date().toLocaleString('ru-RU')}
    `
  }

  try {
    // Проверяем соединение перед отправкой (опционально, для отладки)
    if (process.env.NODE_ENV === 'development') {
      await transporter.verify()
      console.log('SMTP server connection verified')
    }
    
    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', info.messageId)
    return info
  } catch (error) {
    console.error('Error sending email:', error.message)
    if (error.code) {
      console.error('Error code:', error.code)
    }
    if (error.command) {
      console.error('Failed command:', error.command)
    }
    
    // Более понятное сообщение об ошибке
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      throw new Error(`Не удалось подключиться к SMTP серверу ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}. Проверьте настройки SMTP и доступность порта на Render.`)
    }
    
    throw error
  }
}

