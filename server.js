const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuração do Nodemailer (Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Endpoint para enviar formulário
app.post('/api/send-suggestion', async (req, res) => {
  try {
    const { name, email, type, message } = req.body;

    // Validação
    if (!email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Email e mensagem são obrigatórios'
      });
    }

    // Criar conteúdo do email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'familia.souzadomiciano@gmail.com',
      subject: `[Formulário] ${type.charAt(0).toUpperCase() + type.slice(1)} - ${name || 'Usuário Anônimo'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Nova Mensagem do Formulário</h2>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Nome:</strong> ${name || 'Não informado'}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Assunto:</strong> ${type}</p>
            <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
          </div>
          
          <div style="background: #e9ecef; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Mensagem:</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">Enviado pelo formulário do site</p>
        </div>
      `
    };

    // Enviar email
    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Email enviado com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao enviar email:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao enviar email: ' + error.message
    });
  }
});

// Endpoint de teste
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Backend funcionando!'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📧 API: http://localhost:${PORT}/api/send-suggestion`);
});
