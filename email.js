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
    }
  }
  
  // Для порта 465 (SSL) или если явно указано
  if (isSecure) {
    config.tls = {
      rejectUnauthorized: false // Для некоторых провайдеров нужно отключить проверку сертификата
    }
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
    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', info.messageId)
    return info
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

