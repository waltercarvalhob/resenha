/* ============================================================
   CHATBOT DE ATENDIMENTO PARA WHATSAPP
   Usa a WhatsApp Cloud API oficial da Meta (gratuita para
   volumes normais de atendimento).

   COMO FUNCIONA:
   1. Você cria um app no Meta for Developers e conecta um
      número de WhatsApp Business.
   2. A Meta envia as mensagens recebidas para este servidor
      (webhook).
   3. Este código lê a mensagem, procura uma resposta na base
      de conhecimento abaixo, e responde automaticamente pelo
      WhatsApp.
   ============================================================ */

const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

/* ============================================================
   1. CONFIGURAÇÃO — preencha com os dados da sua conta Meta
   ============================================================ */
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'minha-palavra-secreta';
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN; // token de acesso do Meta
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID; // ID do número de WhatsApp

/* ============================================================
   2. BASE DE CONHECIMENTO — mesma lógica do chatbot do site,
   edite livremente para o seu negócio
   ============================================================ */
const CONFIG = {
  mensagemBoasVindas: "Olá! 👋 Sou o assistente virtual. Como posso te ajudar hoje?",
  baseDeConhecimento: [
    {
      palavrasChave: ["horario", "horário", "funcionamento", "abre", "fecha", "atende"],
      resposta: "Funcionamos de segunda a sexta, das 8h às 18h, e aos sábados das 9h às 13h."
    },
    {
      palavrasChave: ["entrega", "prazo", "frete", "envio", "chegar"],
      resposta: "O prazo de entrega é de 3 a 7 dias úteis, dependendo da sua região."
    },
    {
      palavrasChave: ["pagamento", "pagar", "cartao", "cartão", "pix", "boleto", "parcelar"],
      resposta: "Aceitamos Pix, cartão de crédito (em até 12x) e boleto bancário."
    },
    {
      palavrasChave: ["troca", "devolucao", "devolução", "cancelar", "reembolso"],
      resposta: "Você tem até 7 dias após o recebimento para solicitar troca ou devolução, sem custo."
    },
    {
      palavrasChave: ["humano", "atendente", "pessoa", "vendedor"],
      resposta: "Certo, já vou avisar um atendente humano para continuar por aqui. Só um momento!"
    }
  ],
  respostaPadrao: "Não tenho certeza sobre isso ainda. Já vou chamar um atendente humano para te ajudar melhor."
};

function removerAcentos(txt) {
  return txt.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function gerarResposta(perguntaUsuario) {
  const perguntaNormalizada = removerAcentos(perguntaUsuario.toLowerCase());
  for (const item of CONFIG.baseDeConhecimento) {
    const encontrou = item.palavrasChave.some(palavra =>
      perguntaNormalizada.includes(removerAcentos(palavra.toLowerCase()))
    );
    if (encontrou) return item.resposta;
  }
  return CONFIG.respostaPadrao;
}

/* ============================================================
   3. VERIFICAÇÃO DO WEBHOOK
   A Meta chama essa rota uma vez, para confirmar que o
   servidor é seu, antes de começar a enviar mensagens.
   ============================================================ */
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verificado com sucesso.');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

/* ============================================================
   4. RECEBIMENTO DE MENSAGENS
   ============================================================ */
app.post('/webhook', async (req, res) => {
  res.sendStatus(200); // responde rápido para a Meta, processa depois

  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const mensagem = change?.value?.messages?.[0];

    if (!mensagem) return; // pode ser um evento de status, não uma mensagem nova

    const numeroCliente = mensagem.from;
    const textoRecebido = mensagem.text?.body || '';

    console.log(`Mensagem de ${numeroCliente}: ${textoRecebido}`);

    const resposta = gerarResposta(textoRecebido);
    await enviarMensagemWhatsapp(numeroCliente, resposta);
  } catch (erro) {
    console.error('Erro ao processar mensagem:', erro.message);
  }
});

/* ============================================================
   5. ENVIO DE MENSAGENS PELA API DO WHATSAPP
   ============================================================ */
async function enviarMensagemWhatsapp(numeroDestino, texto) {
  await axios.post(
    `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: 'whatsapp',
      to: numeroDestino,
      text: { body: texto }
    },
    {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  );
}

const PORTA = process.env.PORT || 3000;
app.listen(PORTA, () => {
  console.log(`Servidor do chatbot rodando na porta ${PORTA}`);
});
