const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
require('dotenv').config();
const countryFlags = require('./countryFlags');

const token = '6323285955:AAFYiFWnG0aLKmhxFD-orRu7KwmXhjJ7gUY'
const chat_bot = '-1002011266973'
const bot = new TelegramBot(token, { polling: false });
const app = express();

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

const options2 = {
    method: 'GET',
    url: 'https://bet365-api-inplay.p.rapidapi.com/bet365/get_sport_events/soccer',
    headers: {
      'X-RapidAPI-Key': 'ec9f6be1b4msh3f0cd9c45ea88f7p158ae3jsn75a7db046302',
      'X-RapidAPI-Host': 'bet365-api-inplay.p.rapidapi.com'
    }
  };

function removerAcentuacao(texto) {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
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
            if(minutos>=65 && minutos<=77){
                partidasEmAnalise.add(idPartida);
                const apCasa = partidas[i].teamA.stats.attacks.d;
                const apFora = partidas[i].teamB.stats.attacks.d;
                const oddCasa = partidas[i].odds.kickoff['1X2'].bet365['1'];
                const oddFora = partidas[i].odds.kickoff['1X2'].bet365['2'];
                const nomeCasa = partidas[i].teamA.name;
                const nomeFora = partidas[i].teamB.name;
                const nomeCamp = partidas[i].championship.name;
                const cantosCasa = partidas[i].teamA.stats.corners.t;
                const cantosFora = partidas[i].teamB.stats.corners.t;
                const chutesCasa = partidas[i].teamA.stats.shoots.t;
                const chutesFora = partidas[i].teamB.stats.shoots.t;
                const country = partidas[i].championship.country;
                const flagCasa = countryFlags[country] || ""; 
                const regex = /\b(Women|Feminino)\b/i;
                if((apCasa/minutos>=1 || apFora/minutos>=1) && (oddCasa<=1.40 || oddFora <=1.40) && !partidasNotificadas.has(idPartida) && !regex.test(nomeCasa)){
                    const response = await axios.request(options2);
                    const pegarLink = response.data;
                    var link = '';

                    for(let i = 0;  i < pegarLink.length; i++){
                        try{
                            if(removerAcentuacao(nomeCasa) == removerAcentuacao(pegarLink[i].team1) || removerAcentuacao(nomeFora) == removerAcentuacao(pegarLink[i].team2)){
                                link = pegarLink[i].evLink;
                                break;
                            }
                        } catch (error) {
                            console.log(error);
                            break;
                        }
                    }
                    const placarCasa = parseFloat(partidas[i].teamA.score.f);
                    const placarFora = parseFloat(partidas[i].teamB.score.f);
                    const placar = placarCasa + placarFora + 0.5;
                    const mensagem = `*${nomeCasa}* vs *${nomeFora} ${flagCasa}*\n\n🏟 Competição: ${nomeCamp}\n⚽ Placar: ${placarCasa} x ${placarFora}\n⚔️ Ataques Perigosos: ${apCasa} x ${apFora}\n🥅 Finalizações: ${chutesCasa} x ${chutesFora}\n📈 Odds Pré: ${oddCasa} x ${oddFora}\n⛳️ Cantos: ${cantosCasa} x ${cantosFora}\n🕛 Tempo: ${minutos}\n\n🤖 *Entrar em OVER ${placar} GOLS*${link ? `\n\n[${link}](${link})` : ''}`;
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

const port = process.env.PORT || 3333; 

app.get('/ft', (req, res) => {
    res.send("<b>BOT FT</b><br>"+ " 🚨 "+ qtdPartidas + " Jogos ao vivo<br>"+" 🤖 Analisando " + partidasEmAnalise.size + " Partidas<br>" + " 💾 Partidas Notificadas: ["+ [...partidasNotificadas].join(", ")+"]");
});

app.get('/ft/aovivo', (req, res) => {
    res.send([...partidasEmAnalise]);  
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
