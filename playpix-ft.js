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
    url: 'https://soccer-football-info.p.rapidapi.com/emulation/totalcorner/match/today/',
    params: {
      o: 'no',
      l: 'en_US',
    },
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': 'soccer-football-info.p.rapidapi.com'
    }
  };

const partidasEmAnalise = new Set();
const partidasNotificadas = new Set();
var qtdPartidas = 0;

async function analisarPartidas(){
    try {
        const response = await axios.request(options);
        const partidas = response.data.data;
        qtdPartidas = partidas.length;
       
        for(let i=0; i < qtdPartidas; i++){
            const idPartida = partidas[i].id;
            const minutos = partidas[i].status;
            
            if(minutos>=65 && minutos<=77){
                partidasEmAnalise.add(idPartida);
                const nomeCasa = partidas[i].h;
                const nomeFora = partidas[i].a;
                const placarCasa = parseInt(partidas[i].hg);
                const placarFora = parseInt(partidas[i].ag);
                const apCasa = partidas[i].dang_attacks[0];
                const apFora = partidas[i].dang_attacks[1];
                const nomeCamp = partidas[i].l;
                const cantosCasa = partidas[i].hc;
                const cantosFora = partidas[i].ac;
                const chutesOnCasa = parseInt(partidas[i].shot_on[0]);
                const chutesOnFora = parseInt(partidas[i].shot_on[1]);
                const chutesOffCasa = parseInt(partidas[i].shot_off[0]);
                const chutesOffFora = parseInt(partidas[i].shot_off[1]);
                const chutesCasa = chutesOnCasa + chutesOffCasa;
                const chutesFora = chutesOnFora + chutesOffFora;
                const oddCasa = partidas[i].p_odds[0];
                const oddFora = partidas[i].p_odds[2];
                const regex = /\b(Women|Feminino)\b/i;
                const country = partidas[i].l_c;
                const flag = countryFlags[country] || "";

                //Odss live gols
                const somaPlacar = placarCasa + placarFora + 0.75;
                const linhaAtual = partidas[i].ou_odds[2];
                const oddOver = partidas[i].ou_odds[0];

                if((apCasa/minutos>=0.5 || apFora/minutos>=0.5) && (oddCasa<=91.40 || oddFora <=91.40) && !partidasNotificadas.has(idPartida) && !regex.test(nomeCasa) && linhaAtual <= somaPlacar && oddOver>=1.800){

                    const link = await obterUrlPlayPix(nomeCasa, nomeFora);

                    
                    if (!link) {
                        continue;
                    }
                    
                    const placar = placarCasa + placarFora + 0.5;
                    const mensagem = `*${nomeCasa}* vs *${nomeFora} ${flag}*\n\n🏟 Competição: ${nomeCamp}\n⚽ Placar: ${placarCasa} x ${placarFora}\n⚔️ Ataques Perigosos: ${apCasa} x ${apFora}\n🥅 Finalizações: ${chutesCasa} x ${chutesFora}\n📈 Odds Pré: ${oddCasa} x ${oddFora}\n⛳️ Cantos: ${cantosCasa} x ${cantosFora}\n🕛 Tempo: ${minutos}\n\n🤖 *Entrar em OVER ${placar} GOLS*${link ? `\n\n[👉 Acessar Partida (PlayPix)](${link})` : ''}`;
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



