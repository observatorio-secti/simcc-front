require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const nodemailer = require('nodemailer');

const app = express();
const port = 3000;

process.env.GOOGLE_APPLICATION_CREDENTIALS = './chave.json';

const analyticsDataClient = new BetaAnalyticsDataClient();

// Middleware
app.use(cors());
app.use(express.json()); // Para receber JSON no corpo da requisição

// Rota para buscar dados do Google Analytics
app.get('/api/analytics', async (req, res) => {
  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${process.env.VITE_GA4_PROPERTY_ID}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [
        { name: 'date' },
        { name: 'eventName' },
        { name: 'country' },
        { name: 'hostName' }, // Adicionando a dimensão de host
      ],
      metrics: [{ name: 'eventCount' }, { name: 'activeUsers' }],
      orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }],
      dimensionFilter: {
        filter: {
          fieldName: 'hostName',
          stringFilter: {
            matchType: 'EXACT',
            value: process.env.VITE_URL_SITE,
          },
        },
      },
    });

    res.json(response);
  } catch (error) {
    console.error('Erro ao buscar dados do GA4:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do Google Analytics' });
  }
});

// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Rota para enviar e-mails
app.post('/api/send-email', async (req, res) => {
  const { to, subject, html } = req.body;

  if (!to || !Array.isArray(to) || to.length === 0) {
    return res
      .status(400)
      .json({ error: 'A lista de e-mails é inválida ou vazia.' });
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: to.join(','), // Converte array em string separada por vírgula
      subject,
      html,
    });

    res.status(200).json({ message: 'E-mails enviados com sucesso!' });
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    res.status(500).json({ error: 'Erro ao enviar e-mail' });
  }
});

// Iniciando o servidor
app.listen(port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});
