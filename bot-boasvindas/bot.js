const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

const token = '7419975670:AAFInaEmUxOfXR7y_OOCqAoL9IGMAoVISR4';

const bot = new TelegramBot(token, { polling: true });

const userIdsFile = path.join(__dirname, 'userIds.json');

// Função para carregar IDs dos usuários do arquivo
function loadUserIds() {
    if (fs.existsSync(userIdsFile)) {
        const data = fs.readFileSync(userIdsFile, 'utf8');
        return JSON.parse(data);
    }
    return [];
}

function saveUserIds(userIds) {
    fs.writeFileSync(userIdsFile, JSON.stringify(userIds, null, 2));
}

let userIds = loadUserIds();


async function sendWelcomeMessages(userId, userName) {
    await bot.sendMessage(userId, `Bem-vindo a BetSmart, ${userName}! 🤖\n\nEstamos felizes em tê-lo(a) conosco. 👊\n\nPossuímos mais de 1.800 clientes <u><b>lucrando diariamente</b></u> com nossas ferramentas.\n\n<b>Se liga nos nossos últimos resultados 👇</b>`, { parse_mode: "HTML" });

    await new Promise(resolve => setTimeout(resolve, 3000));

    await bot.sendPhoto(userId, path.join(__dirname, 'ultimos-resultados.png'));

    await new Promise(resolve => setTimeout(resolve, 5000));

    await bot.sendMessage(userId, `E adivinha só? Você foi o escolhido para receber acesso ao nosso <u><b>ROBÔ GRATUITAMENTE</b></u> pelo período de 15 dias! 🎁`, { parse_mode: "HTML" });

    await new Promise(resolve => setTimeout(resolve, 5000));

    await bot.sendMessage(userId, `${userName}, <b>preciso de apenas 3 favores seu:</b>`, { parse_mode: "HTML" });

    await new Promise(resolve => setTimeout(resolve, 5000));

    await bot.sendMessage(userId, `➡️ <b>1º PASSO:</b>\n\nPra eu liberar seu acesso, <b><u>crie uma conta</u></b> na plataforma onde faço minhas entradas, que é a <b><u>PlayPix</u></b>`, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: '👉 CRIAR MINHA CONTA',
                        url: 'https://playpix.com/affiliates/?btag=2047977_l319221'
                    }
                ]
            ]
        }
    });

    await new Promise(resolve => setTimeout(resolve, 5000));

    await bot.sendMessage(userId, `➡️ <b>2º PASSO:</b>\n\n<b><u>Deposite qualquer valor</u></b> e me enviar o comprovante do depósito aqui, que eu já libero seu acesso 👇`, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'DEPOSITAR AGORA ✅',
                        url: 'https://www.playpix.com/pb/?account=balance&page=deposit&profile=open&selectedGroup=all&selectedMethod=ZlinPayPIX?btag=2047977_l319221'
                    }
                ]
            ]
        }
    });

    await new Promise(resolve => setTimeout(resolve, 5000));

    await bot.sendMessage(userId, `➡️ <b>3º PASSO:</b>\n\nMe envia o comprovante do depósito tocando no botão abaixo 👇`, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'ENVIAR COMPROVANTE ✅',
                        url: 'https://t.me/SuporteBetSmart'
                    }
                ]
            ]
        }
    });

    await new Promise(resolve => setTimeout(resolve, 5000));

    await bot.sendMessage(userId, `Assim que enviar o comprovante para nosso suporte, iremos fazer a verificação, podendo levar alguns minutos para liberação, e <b><u>BORA LUCRAR!! 🤑</u></b>`, { parse_mode: "HTML" });

    await new Promise(resolve => setTimeout(resolve, 5000));

    await bot.sendMessage(userId, `Envio comprovante🧾: @SuporteBetSmart `, { parse_mode: "HTML" });
}


bot.onText(/\/start/, (msg) => {
    const userId = msg.from.id;
    const userName = msg.from.first_name;

    // Verifique se o ID já está na lista, se não, adicione
    if (!userIds.includes(userId)) {
        userIds.push(userId);
        saveUserIds(userIds); 
    }

    sendWelcomeMessages(userId, userName);
});


bot.on('chat_join_request', (msg) => {
    const userId = msg.from.id;
    const userName = msg.from.first_name;
    const chatId = msg.chat.id;

    if (!userIds.includes(userId)) {
        userIds.push(userId);
        saveUserIds(userIds); 
    }

    // Aceitar a solicitação de adesão
    bot.approveChatJoinRequest(chatId, userId)
        .then(() => {
            console.log(`Solicitação de ${msg.from.username} foi aceita.`);

            sendWelcomeMessages(userId, userName);
        })
        .catch((error) => {
            console.error(`Erro ao aceitar solicitação: ${error}`);
        });
});

console.log("Bot está rodando...");
