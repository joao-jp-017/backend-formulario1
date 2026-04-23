const nodemailer = require('nodemailer');

// Configuração do Nodemailer (Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.handler = async (event, context) => {
  // Configurar CORS para todas as requisições
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Responder imediatamente para requisições OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers
    };
  }

  // Apenas permitir método POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: 'Método não permitido' })
    };
  }

  try {
    const { name, email, type, message } = JSON.parse(event.body);

    // Validação
    if (!email || !message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Email e mensagem são obrigatórios'
        })
      };
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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Email enviado com sucesso!'
      })
    };

  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Erro ao enviar email: ' + error.message
      })
    };
  }
};
