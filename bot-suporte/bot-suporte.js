const { url } = require('inspector');
const TelegramBot = require('node-telegram-bot-api');

// Substitua 'TOKEN' pelo token de acesso que você recebeu do BotFather
const token = '6992531122:AAG7Lsyaz2h32rU0wYGv6CUHDwOGdWDt60U';

// Cria um novo bot
const bot = new TelegramBot(token, { polling: true });

const consoleId = -1002109325363;

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
    const userName = msg.from.username;
    bot.sendMessage(consoleId, `Nova conversa iniciada por: ${userName}`);
    sendStartMessage(chatId);
});

bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    
    if (query.data === 'como_funciona') {
        // Enviar o vídeo explicativo
        bot.sendVideo(chatId, 'video.MP4', {
            caption: '*COMO FUNCIONA:*\n\nO Robô Over Gols FT, é um robô que alerta partidas com alta probabilidade de sair gols a partir dos 65 minutos do segundo tempo. Dentro de nossos parâmetros, estratégias criadas e pensadas com muito estudo, depois de realizados diversos testes para assim ser validado. \n\nO Robô tem uma assertividade surpreendente de 78%, sendo assim considerado o melhor Robô de Gols do mercado. ⭐️\n\n Possuindo uma odd média de 1.70 🤩',
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
        bot.sendPhoto(chatId, 'planos.png', {
            caption: "Clicar no link para consultar outros tipos de planos.", // Manter a legenda original
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'ADQUIRIR', url: 'https://pay.hub.la/w6NMOOYpWW184FvcEHNc'}],
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
