# Como colocar seu chatbot no WhatsApp

## 1. Criar a conta na Meta
1. Acesse https://developers.facebook.com e crie uma conta de desenvolvedor.
2. Crie um novo app, escolha o tipo **Business**.
3. Dentro do app, adicione o produto **WhatsApp**.
4. A Meta vai te dar automaticamente um número de teste, um **token de acesso temporário** e um **ID do número de telefone (Phone Number ID)** — anote os dois.

## 2. Hospedar o servidor
Este código precisa rodar em algum lugar acessível pela internet (a Meta precisa conseguir chamar seu webhook). Opções gratuitas fáceis:
- **Render.com** (recomendado para começar)
- **Railway.app**
- **Fly.io**

Passos gerais:
1. Suba a pasta `whatsapp-bot` para um repositório no GitHub.
2. Conecte o repositório na plataforma escolhida.
3. Configure as variáveis de ambiente:
   - `VERIFY_TOKEN` → invente uma palavra secreta (ex: `meu-token-123`)
   - `WHATSAPP_TOKEN` → o token que a Meta te deu
   - `PHONE_NUMBER_ID` → o ID do número que a Meta te deu
4. Depois do deploy, você terá uma URL pública, por exemplo `https://seu-app.onrender.com`.

## 3. Configurar o webhook na Meta
1. No painel do app, vá em **WhatsApp > Configuration**.
2. Em "Webhook", clique em editar e informe:
   - **URL de callback**: `https://seu-app.onrender.com/webhook`
   - **Verify token**: o mesmo valor que você colocou em `VERIFY_TOKEN`
3. Inscreva-se no campo de eventos **messages**.

## 4. Testar
Envie uma mensagem do seu celular para o número de teste fornecido pela Meta. O chatbot deve responder automaticamente com base nas perguntas configuradas em `server.js`.

## 5. Personalizar as respostas
Edite o objeto `CONFIG` dentro de `server.js` — é a mesma estrutura usada no chatbot do site (palavras-chave e respostas).

## 6. Ir para produção (número real)
O número de teste da Meta expira e só envia para números verificados manualmente. Para usar seu número comercial real e sem essas limitações:
1. Verifique seu negócio na Meta Business Suite (leva de 1 a 3 dias úteis).
2. Cadastre seu número comercial de WhatsApp real no app.
3. Gere um token de acesso permanente (em vez do temporário).

Se preferir não lidar com hospedagem e configuração diretamente na Meta, empresas como **Z-API**, **Twilio** e **360dialog** oferecem esse mesmo processo de forma mais simplificada, por uma mensalidade.
