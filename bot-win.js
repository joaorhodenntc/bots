const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
require('dotenv').config();
const countryFlags = require('./countryFlags');

const token = '6416421723:AAGcrBVbPY9E8-bIdK_4-AeM7t1KCtpn4AA'
const chat_bot = '-1002055941207'
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

function casaFavoritoPressao(apCasa, apFora, oddCasa, placarCasa, placarFora, idPartida, partidasNotificadas, oddCasaAtual){
    if((oddCasa <= 1.45) && (apCasa>=45) && ((apFora + apFora)<=apCasa) && placarCasa==placarFora && !partidasNotificadas.has(idPartida) && oddCasaAtual>=1.50){
        return true;
    }
}

function foraFavoritoPressao(apCasa, apFora, oddFora, placarCasa, placarFora, idPartida, partidasNotificadas, oddForaAtual){
    if((oddFora <= 1.45) && (apFora>=45) && ((apCasa + apCasa)<=apFora) && placarCasa==placarFora && !partidasNotificadas.has(idPartida) && oddForaAtual>=1.50){
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
            if(minutos>=45 && minutos<=47){
                partidasEmAnalise.add(idPartida);
                const apCasa = partidas[i].teamA.stats.attacks.d;
                const apFora = partidas[i].teamB.stats.attacks.d;
                const oddCasa = partidas[i].odds.kickoff['1X2'].bet365['1'];
                const oddFora = partidas[i].odds.kickoff['1X2'].bet365['2'];
                const oddCasaAtual = partidas[i].odds.live['1X2'].bet365['1'];
                const oddForaAtual = partidas[i].odds.live['1X2'].bet365['2'];
                const placarCasa = partidas[i].teamA.score.f;
                const placarFora = partidas[i].teamB.score.f;
                if(casaFavoritoPressao(apCasa,apFora,oddCasa,placarCasa,placarFora,idPartida,partidasNotificadas,oddCasaAtual) || foraFavoritoPressao(apCasa, apFora, oddFora, placarCasa, placarFora, idPartida, partidasNotificadas, oddForaAtual)){
                    if(oddCasa < oddFora){
                        mensagemIndicacao = "🏆Entrar em Win casa (" + oddCasaAtual + ")";
                    } 
                    if(oddCasa > oddFora){
                        mensagemIndicacao = "🏆Entrar em Win fora (" + oddForaAtual + ")";
                    }
                    const nomeCasa = partidas[i].teamA.name;
                    const nomeFora = partidas[i].teamB.name;
                    const nomeCamp = partidas[i].championship.name;
                    const cantosCasa = partidas[i].teamA.stats.corners.t;
                    const cantosFora = partidas[i].teamB.stats.corners.t;
                    const chutesCasa = partidas[i].teamA.stats.shoots.t;
                    const chutesFora = partidas[i].teamB.stats.shoots.t;
                    const country = partidas[i].championship.country;
                    const flagCasa = countryFlags[country] || ""; 
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

const port = process.env.PORT || 3001; 

app.get('/win', (req, res) => {
    res.send("<b>BOT WIN</b><br>"+ " 🚨 "+ qtdPartidas + " Jogos ao vivo<br>"+" 🤖 Analisando " + partidasEmAnalise.size + " Partidas<br>" + " 💾 Partidas Notificadas: ["+ [...partidasNotificadas].join(", ")+"]");
});

app.get('/win/aovivo', (req, res) => {
    res.send([...partidasEmAnalise]);  
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
