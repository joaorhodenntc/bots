const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

// Substitua pelo seu token do Bot
const token = '5706100184:AAGChtU3i2FBNnHAB_mx9wL0TNRIODrdILo';

// Crie um bot que usa 'polling' para buscar atualizações
const bot = new TelegramBot(token, { polling: true });

// Caminho para o arquivo que armazena os IDs dos usuários
const userIdsFile = path.join(__dirname, 'userIds.json');

// Função para carregar IDs dos usuários do arquivo
function loadUserIds() {
    if (fs.existsSync(userIdsFile)) {
        const data = fs.readFileSync(userIdsFile, 'utf8');
        return JSON.parse(data);
    }
    return [];
}

// Carregar os IDs dos usuários
const userIds = loadUserIds();

// Mensagem que você deseja enviar
const message = "Promoção relâmpago! Não perca essa oportunidade!";
const imagePath = path.join(__dirname, 'promocao.png');

// Enviar a mensagem para todos os usuários
// userIds.forEach(userId => {
//     bot.sendMessage(userId, message).catch((error) => {
//         console.error(`Erro ao enviar mensagem para ${userId}: ${error}`);
//     });
// });

userIds.forEach(userId => {
    bot.sendPhoto(userId, imagePath, { caption: message }).catch((error) => {
        console.error(`Erro ao enviar imagem para ${userId}: ${error}`);
    });
});

console.log("Mensagem enviada para todos os usuários.");
