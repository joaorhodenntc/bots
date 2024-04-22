const { url } = require('inspector');
const TelegramBot = require('node-telegram-bot-api');

// Substitua 'TOKEN' pelo token de acesso que você recebeu do BotFather
const token = '6992531122:AAG7Lsyaz2h32rU0wYGv6CUHDwOGdWDt60U';

// Cria um novo bot
const bot = new TelegramBot(token, { polling: true});

  function sendStartMessage(chatId) {
    bot.sendPhoto(chatId, 'main-image.png', {
      caption: `Jogador, aqui você terá acesso às melhores oportunidades e estratégias para te garantir maior lucro nas apostas esportivas!\n\nE o melhor... tudo de forma *gratuita!*😅\n\nVENHA COM A GENTE E VAMOS LUCRAR 👇`,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: 'ACESSAR CANAL GRATUITO 🟢', url: 'https://t.me/betsmart_free' }],
          [{ text: 'INSTAGRAM', url: 'https://www.instagram.com/robobetsmart/ '}],
          [{ text: 'Mais Opções', callback_data: 'mais_opcoes' }]
        ]
      }
    });
  }

  bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    
    if (query.data === 'mais_opcoes') {
      // Enviar uma nova mensagem com a imagem atualizada
      bot.sendPhoto(chatId, 'mais-opcoes.png', {
        caption: "Mais algumas opcões da nossa MÁQUINA 🤖", // Manter a legenda original
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Como Funciona', callback_data: 'como_funciona' }],
            [{ text: 'Planos / Valores', callback_data: 'planos' }],
            [{ text: 'Falar com o Suporte', url: 'https://t.me/SuporteBetSmart' }],
            [{ text: '👈 Voltar ao MENU PRINCIPAL', callback_data: 'voltar_menu' }],
          ]
        }
      }).then(sentMessage => {
        // Excluir a mensagem original para evitar duplicatas
        bot.deleteMessage(chatId, messageId);
      }).catch(error => {
        console.error('Erro ao enviar a nova mensagem:', error);
      });
    } else if (query.data === 'como_funciona') {
      // Enviar o vídeo explicativo
      bot.sendVideo(chatId, 'video.MP4', {
        caption: '*COMO FUNCIONA:*\n\nO Robô Over Gols FT, é um robô que alerta partidas com alta probabilidade de sair gols a partir dos 65 minutos do segundo tempo. Dentro de nossos parâmetros, estratégias criadas e pensadas com muito estudo, depois de realizados diversos testes para assim ser validado. \n\nO Robô tem uma assertividade surpreendente de 78%, sendo assim considerado o melhor Robô de Gols do mercado. ⭐️\n\n Possuindo uma odd média de 1.70 🤩',
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '👈 Voltar', callback_data: 'mais_opcoes' }]
          ]
        }
      }).then(sentMessage => {
        // Excluir a mensagem original para evitar duplicatas
        bot.deleteMessage(chatId, messageId);
      }).catch(error => {
        console.error('Erro ao enviar a nova mensagem:', error);
      });
    } else if (query.data === 'voltar_menu') {
      // Editar a mensagem original com a primeira mensagem do bot
      sendStartMessage(chatId);
      // Excluir a mensagem atual para evitar duplicatas
      bot.deleteMessage(chatId, messageId);
    } else if (query.data === 'planos'){
        // Enviar o vídeo explicativo
        bot.sendPhoto(chatId, 'planos.png', {
            caption: "Clicar no link para consultar outros tipos de planos.", // Manter a legenda original
            reply_markup: {
              inline_keyboard: [
                [{ text: 'ADQUIRIR', url: 'https://pay.hub.la/w6NMOOYpWW184FvcEHNc'}],
                [{ text: '👈 Voltar', callback_data: 'mais_opcoes' }]
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
  



// Função para lidar com o comando /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    sendStartMessage(chatId);
  });

