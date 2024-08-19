const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const countryFlags = require('./countryFlags');
const obterUrlPlayPix = require('./obterUrlPlayPix');

const token = '6416421723:AAGcrBVbPY9E8-bIdK_4-AeM7t1KCtpn4AA';
const chat_bot = '-1001682222531';
const bot = new TelegramBot(token, { polling: false });

async function enviarMensagemTelegram(chat_id, mensagem) {
    try {
        await bot.sendMessage(chat_id, mensagem, { parse_mode: 'Markdown', disable_web_page_preview: true});
    } catch (error) {
        console.error('Erro ao enviar mensagem para o Telegram:', error);
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

function casaFavoritoPressao(apCasa, apFora, oddCasa, placarCasa, placarFora, idPartida, minutos, partidasNotificadas){
    if((oddCasa <= 91.40) && ((apCasa/minutos)>=0.5) && (apCasa>apFora) && placarCasa<=placarFora && !partidasNotificadas.has(idPartida)){
        return true;
    }
}

function foraFavoritoPressao(apCasa, apFora, oddFora, placarCasa, placarFora, idPartida, minutos, partidasNotificadas){
    if((oddFora <= 91.40) && ((apFora/minutos)>=0.5) && (apFora>apCasa) && placarCasa>=placarFora && !partidasNotificadas.has(idPartida)){
        return true;
    }
}

const partidasEmAnalise = new Set();
const partidasNotificadas = new Set();
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

                    const link = await obterUrlPlayPix(nomeCasa, nomeFora);

                    if (!link) {
                        continue;
                    }

                    const nomeCamp = partidas[i].championship.name;
                    const cantosCasa = partidas[i].teamA.stats.corners.t;
                    const cantosFora = partidas[i].teamB.stats.corners.t;
                    const chutesCasa = partidas[i].teamA.stats.shoots.t;
                    const chutesFora = partidas[i].teamB.stats.shoots.t;
                    const country = partidas[i].championship.country;
                    const flagCasa = countryFlags[country] || ""; 
                    const mensagem = `*${nomeCasa}* vs *${nomeFora} ${flagCasa}*\n\n🏟 Competição: ${nomeCamp}\n⚽ Placar: ${placarCasa} x ${placarFora}\n⚔️ Ataques Perigosos: ${apCasa} x ${apFora}\n🥅 Finalizações: ${chutesCasa} x ${chutesFora}\n📈 Odds Pré: ${oddCasa} x ${oddFora}\n⛳️ Cantos: ${cantosCasa} x ${cantosFora}\n🕛 Tempo: ${minutos}\n\n🤖 *Entrar em OVER ${placar} GOLS HT*${link ? `\n\n[👉 Acessar Partida (PlayPix)](${link})` : ''}`;
                    await enviarMensagemTelegram(chat_bot,mensagem);
                    partidasNotificadas.add(idPartida);
                }
            } else {
                partidasEmAnalise.delete(idPartida);
            }
        }
    } catch (error) {
        console.error(error);
    }
}

async function iniciar() {
    try {
        await analisarPartidas();
        console.log("Ao vivo: " + qtdPartidas + "\nAnalisando: " + partidasEmAnalise.size + "\nPartidas Notificadas: ["+ [...partidasNotificadas].join(", ")+"]");
    } catch (error) {
        console.log(error)
    }
}

setInterval(iniciar, 60000);



