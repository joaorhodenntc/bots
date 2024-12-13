const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const countryFlags = require('./countryFlags');

const token = '6416421723:AAGcrBVbPY9E8-bIdK_4-AeM7t1KCtpn4AA';
const chat_bot =  '-1002263290488';

const bot = new TelegramBot(token, { polling: false });

async function enviarMensagemTelegram(chat_id, mensagem) {
    try {
        const sentMessage = await bot.sendMessage(chat_id, mensagem, { parse_mode: 'Markdown', disable_web_page_preview: true});
        return sentMessage.message_id;
    } catch (error) {
        console.error('Erro ao enviar mensagem para o Telegram:', error);
    }
}

async function editarMensagemTelegram(chat_id, message_id, novaMensagem) {
    try {
        await bot.editMessageText(novaMensagem, { chat_id, message_id, parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Erro ao editar mensagem no Telegram:', error);
    }
}

const apiKey = process.env.RAPIDAPI_KEY;

const options = {
  method: 'GET',
  url: 'https://soccer-football-info.p.rapidapi.com/live/full/',
  params: {
    l: 'en_US',
    f: 'json',
    e: 'no'
  },
  headers: {
    'X-RapidAPI-Key': apiKey,
    'X-RapidAPI-Host': 'soccer-football-info.p.rapidapi.com'
  }
};

const options2 = {
    method: 'GET',
    url: 'https://bet365-api-inplay.p.rapidapi.com/bet365/get_sport_events/soccer',
    headers: {
      'X-RapidAPI-Key': 'ec9f6be1b4msh3f0cd9c45ea88f7p158ae3jsn75a7db046302',
      'X-RapidAPI-Host': 'bet365-api-inplay.p.rapidapi.com'
    }
  };

  function getMatchDetails(matchId) {
    const results = {
      method: 'GET',
      url: 'https://soccer-football-info.p.rapidapi.com/matches/view/full/',
      params: {
        i: matchId,
        l: 'en_US'
      },
      headers: {
        'x-rapidapi-key': '4a87053b30mshad9163ef45410adp17c4dbjsn0d469d135af5',
        'x-rapidapi-host': 'soccer-football-info.p.rapidapi.com'
      }
    };
  
    return axios.request(results);
  }

function removerAcentuacao(texto) {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function casaFavoritoPressao(apCasa, apFora, oddCasa, placarCasa, placarFora, idPartida, minutos, partidasNotificadas){
    if((oddCasa <= 1.40) && ((apCasa/minutos)>=1.20) && (apCasa>apFora) && placarCasa<=placarFora && !partidasNotificadas.has(idPartida)){
        return true;
    }
}

function foraFavoritoPressao(apCasa, apFora, oddFora, placarCasa, placarFora, idPartida, minutos, partidasNotificadas){
    if((oddFora <= 1.40) && ((apFora/minutos)>=1.20) && (apFora>apCasa) && placarCasa>=placarFora && !partidasNotificadas.has(idPartida)){
        return true;
    }
}

const partidasEmAnalise = new Set();
const partidasNotificadas = new Map();
var qtdPartidas = 0;

async function analisarPartidas(){
    try {
        const response = await axios.request(options);
        const partidas = response.data.result;
        qtdPartidas = partidas.length;
        for(let i=0; i<qtdPartidas; i++){
            const minutos = parseInt( partidas[i].timer.split(':')[0]);
            const idPartida = partidas[i].id;
            if(minutos>=20 && minutos<=25){
                partidasEmAnalise.add(idPartida);
                const apCasa = partidas[i].teamA.stats.attacks.d;
                const apFora = partidas[i].teamB.stats.attacks.d;
                const oddCasa = partidas[i].odds.kickoff['1X2'].bet365['1'];
                const oddFora = partidas[i].odds.kickoff['1X2'].bet365['2'];
                const placarCasa = parseFloat(partidas[i].teamA.score.f);
                const placarFora = parseFloat(partidas[i].teamB.score.f);
                const placar = placarCasa + placarFora + 0.5;
                const nomeCasa = partidas[i].teamA.name;
                const nomeFora = partidas[i].teamB.name;

                if(casaFavoritoPressao(apCasa,apFora,oddCasa,placarCasa,placarCasa,idPartida,minutos,partidasNotificadas) || foraFavoritoPressao(apCasa, apFora, oddFora, placarCasa, placarFora, idPartida, minutos, partidasNotificadas)){
                    const nomeCasaSemEspacos = nomeCasa.replace(/\s+/g, '%20');
                    link = `https://www.bet365.com/#/AX/K%5E${nomeCasaSemEspacos}%20`;

                    try{
                        const response = await axios.request(options2);
                        const pegarLink = response.data;
                        
                        for(let i = 0;  i < pegarLink.length; i++){
                            if(removerAcentuacao(nomeCasa) == removerAcentuacao(pegarLink[i].team1) || removerAcentuacao(nomeFora) == removerAcentuacao(pegarLink[i].team2)){
                                link = pegarLink[i].evLink;
                                break;
                            } 
                    }
                    } catch (error) {
                        console.log(error);
                    }
                    

                    const nomeCamp = partidas[i].championship.name;
                    const cantosCasa = partidas[i].teamA.stats.corners.t;
                    const cantosFora = partidas[i].teamB.stats.corners.t;
                    const chutesCasa = partidas[i].teamA.stats.shoots.t;
                    const chutesFora = partidas[i].teamB.stats.shoots.t;
                    const country = partidas[i].championship.country;
                    const flagCasa = countryFlags[country] || ""; 
                    const mensagem = `*🤖 BETSMART*\n\n*${nomeCasa}* vs *${nomeFora} ${flagCasa}*\n\n🏟 Competição: ${nomeCamp}\n⚽ Placar: ${placarCasa} x ${placarFora}\n⚔️ Ataques Perigosos: ${apCasa} x ${apFora}\n🥅 Finalizações: ${chutesCasa} x ${chutesFora}\n📈 Odds Pré: ${oddCasa} x ${oddFora}\n⛳️ Cantos: ${cantosCasa} x ${cantosFora}\n🕛 Tempo: ${minutos}\n\n🤖 *Entrar em OVER ${placar} GOLS HT*${link ? `\n\n[${link}](${link})` : ''}`;
                    const messageId =await enviarMensagemTelegram(chat_bot,mensagem);
                    partidasNotificadas.set(idPartida, {messageId,nomeCasa, nomeFora, flagCasa, nomeCamp, placarCasa, placarFora, apCasa, apFora, oddCasa, oddFora, cantosCasa, cantosFora, chutesCasa, chutesFora, minutos, placar});
                }
            } else {
                partidasEmAnalise.delete(idPartida);
            }
        }
    } catch (error) {
        console.error(error);
    }
}

async function verificarResultado(){
    for (const [idPartida, value] of partidasNotificadas.entries()) {
        try {
            const response = await getMatchDetails(idPartida); 
            const resultado = response.data.result[0];
            const placarCasa = parseFloat(resultado.teamA.score.f); 
            const placarFora = parseFloat(resultado.teamB.score.f); 
            const placarFinal = placarCasa + placarFora;
            
            if(resultado.status == 'BREAK'){
                if(placarFinal>value.placar){
                    await editarMensagemTelegram(chat_bot, value.messageId, `*🤖 BETSMART*\n\n*${value.nomeCasa}* vs *${value.nomeFora} ${value.flagCasa}*\n\n🏟 Competição: ${value.nomeCamp}\n⚽ Placar: ${value.placarCasa} x ${value.placarFora}\n⚔️ Ataques Perigosos: ${value.apCasa} x ${value.apFora}\n🥅 Finalizações: ${value.chutesCasa} x ${value.chutesFora}\n📈 Odds Pré: ${value.oddCasa} x ${value.oddFora}\n⛳️ Cantos: ${value.cantosCasa} x ${value.cantosFora}\n🕛 Tempo: ${value.minutos}\n\n🤖 *Entrar em OVER ${value.placar} GOLS HT*\n\n✅`);
                    partidasNotificadasOver.delete(idPartida);
                } else {
                    await editarMensagemTelegram(chat_bot, value.messageId, `*🤖 BETSMART*\n\n*${value.nomeCasa}* vs *${value.nomeFora} ${value.flagCasa}*\n\n🏟 Competição: ${value.nomeCamp}\n⚽ Placar: ${value.placarCasa} x ${value.placarFora}\n⚔️ Ataques Perigosos: ${value.apCasa} x ${value.apFora}\n🥅 Finalizações: ${value.chutesCasa} x ${value.chutesFora}\n📈 Odds Pré: ${value.oddCasa} x ${value.oddFora}\n⛳️ Cantos: ${value.cantosCasa} x ${value.cantosFora}\n🕛 Tempo: ${value.minutos}\n\n🤖 *Entrar em OVER ${value.placar} GOLS HT*\n\n❌`);
                    partidasNotificadasOver.delete(idPartida);
                }
            }

        } catch (error) {
            console.error(error);
        }
    }
}

async function iniciar() {
    try {
        await analisarPartidas();
        await verificarResultado();
        console.log("Ao vivo: " + qtdPartidas + ", Analisando: " + partidasEmAnalise.size);
    } catch (error) {
        console.log(error)
    }
}

iniciar();

setInterval(iniciar, 60000);

