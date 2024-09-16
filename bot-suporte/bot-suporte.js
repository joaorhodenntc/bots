const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

// Substitua 'TOKEN' pelo token de acesso que você recebeu do BotFather
const token = '6992531122:AAG7Lsyaz2h32rU0wYGv6CUHDwOGdWDt60U';

// Cria um novo bot
const bot = new TelegramBot(token, { polling: true });

// Caminho para o arquivo que armazenará os IDs dos usuários
const userIdsFile = path.join(__dirname, 'userIds.json');

// Função para carregar IDs dos usuários do arquivo
function loadUserIds() {
    if (fs.existsSync(userIdsFile)) {
        const data = fs.readFileSync(userIdsFile, 'utf8');
        return JSON.parse(data);
    }
    return [];
}

// Função para salvar IDs dos usuários no arquivo
function saveUserIds(userIds) {
    fs.writeFileSync(userIdsFile, JSON.stringify(userIds, null, 2));
}

// Carregar IDs ao iniciar o bot
let userIds = loadUserIds();

const consoleId = -1002109325363;

bot.on('chat_join_request', (msg) => {
    const userId = msg.from.id;
    const chatId = msg.chat.id;

    if (!userIds.includes(userId)) {
        userIds.push(userId);
        saveUserIds(userIds); 
    }

    // Aceitar a solicitação de adesão
    bot.approveChatJoinRequest(chatId, userId)
        .then(() => {
            console.log(`Solicitação de ${msg.from.username} foi aceita.`);
            bot.sendMessage(consoleId, `Nova conversa iniciada por: ${msg.from.username}`);
            sendStartMessage(userId);
        })
        .catch((error) => {
            console.error(`Erro ao aceitar solicitação: ${error}`);
        });
});

function sendStartMessage(chatId) {
    bot.sendPhoto(chatId, 'main-image.png', {
        caption: `Jogador, aqui você terá acesso às melhores oportunidades e estratégias para te garantir maior lucro nas apostas esportivas!\n\n*VENHA COM A GENTE E VAMOS LUCRAR 👇*`,
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: 'COMO FUNCIONA', callback_data: 'como_funciona' }],
                [{ text: 'PLANOS/VALORES', callback_data: 'planos' }],
                [{ text: 'FALAR COM SUPORTE', url: 'https://t.me/SuporteBetSmart' }]
                
            ]
        }
    });
}

// Função para lidar com o comando /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userName = msg.from.username;
    bot.sendMessage(consoleId, `Nova conversa iniciada por: ${userName}`);
    sendStartMessage(chatId);

    // Verifique se o ID já está na lista, se não, adicione
    if (!userIds.includes(userId)) {
        userIds.push(userId);
        saveUserIds(userIds); // Salvar IDs no arquivo
    }
});

bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    
    if (query.data === 'como_funciona') {
        // Enviar o vídeo explicativo
        bot.sendVideo(chatId, 'como-funciona.mp4', {
            caption: '*BOT OVER FT ⚽️:*\n\nO Robô Over Gols FT, é um robô que alerta partidas com alta probabilidade de sair gols a partir dos 65 minutos do segundo tempo.\n\nO Robô tem uma assertividade surpreendente de 78%, sendo assim considerado o melhor Robô de Gols do mercado.⭐️\n\nPossuindo uma odd média de 1.70 📊\n\n*BOT OVER HT ⚽️:*\n\nO Robô Over Gols HT, é um robô que alerta partidas com alta probabilidade de sair gols no primeiro tempo.\n\nO Robô tem uma assertividade surpreendente de 75%.\n\nPossuindo uma odd média de 1.80 📊\n\n*BOT CANTOS ⛳️:*\n\nO Robô de Escanteios, é um robô programado com os melhores critérios para sair escanteios ao final da partida.\n\nO robô tem uma assertividade absurda de 80%.\n\nPossuindo uma odd média 1.80 📊',
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: '👈 Voltar', callback_data: 'start_message' }]
                ]
            }
        }).then(sentMessage => {
            // Excluir a mensagem original para evitar duplicatas
            bot.deleteMessage(chatId, messageId);
        }).catch(error => {
            console.error('Erro ao enviar a nova mensagem:', error);
        });
    } else if (query.data === 'planos') {
        // Enviar os planos e valores
        bot.sendPhoto(chatId, 'planos.jpg', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Verificar Planos/Valores ✅', url: 'https://hub.la/betsmart'}],
                    [{ text: '👈 Voltar', callback_data: 'start_message' }]
                ]
            }
        }).then(sentMessage => {
            // Excluir a mensagem original para evitar duplicatas
            bot.deleteMessage(chatId, messageId);
        }).catch(error => {
            console.error('Erro ao enviar a nova mensagem:', error);
        });
    } else if (query.data === 'start_message') {
        sendStartMessage(chatId);
        // Excluir a mensagem atual para evitar duplicatas
        bot.deleteMessage(chatId, messageId);
    } 
});

// Restante do seu código...
