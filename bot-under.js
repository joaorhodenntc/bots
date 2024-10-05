const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const countryFlags = require('./countryFlags');

const token = '6323285955:AAFYiFWnG0aLKmhxFD-orRu7KwmXhjJ7gUY'
const chat_bot = '-1002291511447'
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
    l: 'pt_PT',
    f: 'json',
    e: 'no'
  },
  headers: {
    'X-RapidAPI-Key': apiKey,
    'X-RapidAPI-Host': 'soccer-football-info.p.rapidapi.com'
  }
};

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
            if(minutos>=82 && minutos<=86){
                partidasEmAnalise.add(idPartida);
                const apCasa = partidas[i].teamA.stats.attacks.d;
                const apFora = partidas[i].teamB.stats.attacks.d;
                const oddCasa = partidas[i].odds.kickoff['1X2'].bet365['1'];
                const oddFora = partidas[i].odds.kickoff['1X2'].bet365['2'];
                const nomeCasa = partidas[i].teamA.name;
                const nomeFora = partidas[i].teamB.name;
                const nomeCamp = partidas[i].championship.name;
                const cantosCasa = Number(partidas[i].teamA.stats.corners.t);
                const cantosFora = Number(partidas[i].teamB.stats.corners.t);
                const cartoesVermelhoCasa = Number(partidas[i].teamA.stats.fouls.r_c);
                const cartoesVermelhoFora = Number(partidas[i].teamB.stats.fouls.r_c);
                const cantosTotal = cantosCasa + cantosFora;
                const chutesCasa = Number(partidas[i].teamA.stats.shoots.t);
                const chutesFora = Number(partidas[i].teamA.stats.shoots.t);
                const chutesTotal = parseInt(chutesCasa+chutesFora);
                const placarCasa = parseFloat(partidas[i].teamA.score.f);
                const placarFora = parseFloat(partidas[i].teamB.score.f);
                const placarTotal =placarCasa+placarFora;
                const country = partidas[i].championship.country;
                const flagCasa = countryFlags[country] || ""; 
                const regex = /\b(Women|Feminino)\b/i;

                if((apCasa<50 && apFora<50) && (cantosTotal<=6) && (placarTotal<4) && (chutesTotal<=12) &&!partidasNotificadas.has(idPartida) && !regex.test(nomeCasa) && cartoesVermelhoCasa==0 && cartoesVermelhoFora==0){
                    const nomeCasaSemEspacos = nomeCasa.replace(/\s+/g, '%20');
                    const link = `https://www.bet365.com/#/AX/K%5E${nomeCasaSemEspacos}%20`;
                    const placar = placarCasa + placarFora + 0.5;
                    const mensagem = `*${nomeCasa}* vs *${nomeFora} ${flagCasa}*\n\n🏟 Competição: ${nomeCamp}\n⚽ Placar: ${placarCasa} x ${placarFora}\n⚔️ Ataques Perigosos: ${apCasa} x ${apFora}\n🥅 Finalizações: ${chutesCasa} x ${chutesFora}\n📈 Odds Pré: ${oddCasa} x ${oddFora}\n⛳️ Cantos: ${cantosCasa} x ${cantosFora}\n🕛 Tempo: ${minutos}\n\n🤖 *Entrar em UNDER ${placar} GOLS*\n\n${link}`;
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

iniciar();

setInterval(iniciar, 60000);

