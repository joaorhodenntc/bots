const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
require('dotenv').config();
const countryFlags = require('./countryFlags');

const token = '6416421723:AAGcrBVbPY9E8-bIdK_4-AeM7t1KCtpn4AA'
const chat_bot = '-1002002661890'
const bot = new TelegramBot(token, { polling: false });
const app = express();

async function enviarMensagemTelegram(chat_id, mensagem) {
    try {
        await bot.sendMessage(chat_id, mensagem, { parse_mode: 'Markdown' });
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

function casaFavoritoPressao(apCasa, placarCasa, placarFora, idPartida, minutos, chutesCasa, partidasNotificadas){
    if((apCasa/minutos>= 1.20) && (placarCasa==placarFora || (placarFora - placarCasa)==1) && chutesCasa>=8 &&!partidasNotificadas.has(idPartida)){
        return true
    }
}

function foraFavoritoPressao(apFora, placarCasa, placarFora, idPartida, minutos, chutesFora, partidasNotificadas){
    if((apFora/minutos>= 1.20) && (placarCasa==placarFora || (placarCasa - placarFora)==1) && chutesFora>=8 &&!partidasNotificadas.has(idPartida)){
        return true
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
            const hasMarket = partidas[i].odds.live.asian_corner;
           if(minutos>=36 && minutos<=41 && hasMarket){
                partidasEmAnalise.add(idPartida);
                const apCasa = partidas[i].teamA.stats.attacks.d;
                const apFora = partidas[i].teamB.stats.attacks.d;
                const placarCasa = partidas[i].teamA.score.f;
                const placarFora = partidas[i].teamB.score.f;
                const chutesCasa = partidas[i].teamA.stats.shoots.t;
                const chutesFora = partidas[i].teamB.stats.shoots.t;
                if(casaFavoritoPressao(apCasa, placarCasa, placarFora, idPartida, minutos, chutesCasa, partidasNotificadas) || foraFavoritoPressao(apFora, placarCasa, placarFora, idPartida, minutos, chutesFora, partidasNotificadas)){
                    const nomeCasa = partidas[i].teamA.name;
                    const nomeFora = partidas[i].teamB.name;
                    const nomeCamp = partidas[i].championship.name;
                    const cantosCasa = partidas[i].teamA.stats.corners.t;
                    const cantosFora = partidas[i].teamB.stats.corners.t;
                    const chutesCasa = partidas[i].teamA.stats.shoots.t;
                    const chutesFora = partidas[i].teamB.stats.shoots.t;
                    const country = partidas[i].championship.country;
                    const flagCasa = countryFlags[country] || ""; 
                    const oddCasa = partidas[i].odds.kickoff['1X2'].bet365['1'];
                    const oddFora = partidas[i].odds.kickoff['1X2'].bet365['2'];
                    mensagemIndicacao = "🤖 Entrar em OVER CANTOS HT";
                    const mensagem = `*${nomeCasa}* vs *${nomeFora} ${flagCasa}*\n\n🏟 Competição: ${nomeCamp}\n⚽ Placar: ${placarCasa} x ${placarFora}\n⚔️ Ataques Perigosos: ${apCasa} x ${apFora}\n🥅 Finalizações: ${chutesCasa} x ${chutesFora}\n📈 Odds Pré: ${oddCasa} x ${oddFora}\n⛳️ Cantos: ${cantosCasa} x ${cantosFora}\n🕛 Tempo: ${minutos}\n\n *${mensagemIndicacao}*`;
                    await enviarMensagemTelegram(chat_bot,mensagem);
                    console.log(mensagem);
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

setInterval(iniciar, 60000);

async function iniciar() {
    try {
        await analisarPartidas();
        console.log("Ao vivo: " + qtdPartidas + "\nAnalisando: " + partidasEmAnalise.size + "\nPartidas Notificadas: ["+ [...partidasNotificadas].join(", ")+"]");
    } catch (error) {
        console.log(error)
    }
}

const port = process.env.PORT || 3002; 

app.get('/cantos-ht', (req, res) => {
    res.send("<b>BOT CANTOS HT</b><br>"+ " 🚨 "+ qtdPartidas + " Jogos ao vivo<br>"+" 🤖 Analisando " + partidasEmAnalise.size + " Partidas<br>" + " 💾 Partidas Notificadas: ["+ [...partidasNotificadas].join(", ")+"]");
});

app.get('/cantos-ht/aovivo', (req, res) => {
    res.send([...partidasEmAnalise]);  
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
