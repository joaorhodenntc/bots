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
            caption: "Selecione o bot que você ficou interessado:", // Manter a legenda original
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'BOT HT ⚽️', callback_data: 'bot-ht-planos' }],
                    [{ text: 'BOT FT ⚽️', callback_data: 'bot-ft-planos' }],
                    [{ text: 'BOT CANTOS ⛳️', callback_data: 'bot-cantos-planos' }],
                    [{ text: 'COMBO (BOT FT + HT) 🤖', callback_data: 'combo-planos' }],
                    [{ text: 'COMBO TODOS BOTS 🤖', callback_data: 'combo-todos' }],
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
    } else if (query.data === 'bot-ft-planos') {
        bot.sendPhoto(chatId, 'plano-bot-ft.png', {
            caption: "Clicar no link para consultar outros tipos de planos.", // Manter a legenda original
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'ADQUIRIR AGORA ✅', url: 'https://pay.hub.la/w6NMOOYpWW184FvcEHNc'}],
                    [{ text: '👈 Voltar', callback_data: 'planos' }]
                ]
            }
        }).then(sentMessage => {
            // Excluir a mensagem original para evitar duplicatas
            bot.deleteMessage(chatId, messageId);
        }).catch(error => {
            console.error('Erro ao enviar a nova mensagem:', error);
        });
    } else if (query.data === 'bot-ht-planos') {
        bot.sendPhoto(chatId, 'plano-bot-ht.png', {
            caption: "Clicar no link para consultar outros tipos de planos.", // Manter a legenda original
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'ADQUIRIR AGORA ✅', url: 'https://pay.hub.la/oysQzbadaD3Ci4dyIJP6'}],
                    [{ text: '👈 Voltar', callback_data: 'planos' }]
                ]
            }
        }).then(sentMessage => {
            // Excluir a mensagem original para evitar duplicatas
            bot.deleteMessage(chatId, messageId);
        }).catch(error => {
            console.error('Erro ao enviar a nova mensagem:', error);
        });
    } else if (query.data === 'combo-planos') {
        bot.sendPhoto(chatId, 'plano-combo.png', {
            caption: "Clicar no link para consultar outros tipos de planos.", // Manter a legenda original
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'ADQUIRIR AGORA ✅', url: 'https://pay.hub.la/dlz8Qe5QjKr0K5GbkhG3'}],
                    [{ text: '👈 Voltar', callback_data: 'planos' }]
                ]
            }
        }).then(sentMessage => {
            // Excluir a mensagem original para evitar duplicatas
            bot.deleteMessage(chatId, messageId);
        }).catch(error => {
            console.error('Erro ao enviar a nova mensagem:', error);
        });
    } else if (query.data === 'bot-cantos-planos') {
        bot.sendPhoto(chatId, 'plano-bot-canto.png', {
            caption: "Clicar no link para consultar outros tipos de planos.", // Manter a legenda original
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'ADQUIRIR AGORA ✅', url: 'https://hub.la/r/RMlRNYH1AN9MVTTykkbQ'}],
                    [{ text: '👈 Voltar', callback_data: 'planos' }]
                ]
            }
        }).then(sentMessage => {
            // Excluir a mensagem original para evitar duplicatas
            bot.deleteMessage(chatId, messageId);
        }).catch(error => {
            console.error('Erro ao enviar a nova mensagem:', error);
        });
    } else if (query.data === 'combo-todos') {
        bot.sendPhoto(chatId, 'plano-todos.png', {
            caption: "Clicar no link para consultar outros tipos de planos.", // Manter a legenda original
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'ADQUIRIR AGORA ✅', url: 'https://hub.la/r/WrTndhTBnleylvXLm4y2'}],
                    [{ text: '👈 Voltar', callback_data: 'planos' }]
                ]
            }
        }).then(sentMessage => {
            // Excluir a mensagem original para evitar duplicatas
            bot.deleteMessage(chatId, messageId);
        }).catch(error => {
            console.error('Erro ao enviar a nova mensagem:', error);
        });
    }
});

// Restante do seu código...
