const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const countryFlags = require('./countryFlags');

const token = '6323285955:AAFYiFWnG0aLKmhxFD-orRu7KwmXhjJ7gUY'
const chat_bot = '-1002011266973'
const chat_testeGratis = '-1002348807186';
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
      l: 'pt_PT'
    },
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': 'soccer-football-info.p.rapidapi.com'
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
        const partidas = response.data.data;
        qtdPartidas = partidas.length;
       
        for(let i=0; i < qtdPartidas; i++){
            const idPartida = partidas[i].id;
            const minutos = partidas[i].status;
            
            if(minutos>= 65 && minutos<=77){
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

                

                if((apCasa/minutos>=1 || apFora/minutos>=1) && (oddCasa<=1.40 || oddFora <=1.40) && !partidasNotificadas.has(idPartida) && !regex.test(nomeCasa) && linhaAtual <= somaPlacar && oddOver>=1.800){

                    let link = '';

                    try {
                        const response = await axios.request(options2);
                        const pegarLink = response.data;
                        
                        for (let i = 0; i < pegarLink.length; i++) {
                            if (removerAcentuacao(nomeCasa) == removerAcentuacao(pegarLink[i].team1) || removerAcentuacao(nomeFora) == removerAcentuacao(pegarLink[i].team2)) {
                                link = pegarLink[i].evLink;
                                break;
                            }
                        }
                    } catch (error) {
                        console.log(error);
                    }
                    
                    const placar = placarCasa + placarFora + 0.5;
                    const mensagem = `*🤖 BETSMART*\n\n*${nomeCasa}* vs *${nomeFora} ${flag}*\n\n🏟 Competição: ${nomeCamp}\n⚽ Placar: ${placarCasa} x ${placarFora}\n⚔️ Ataques Perigosos: ${apCasa} x ${apFora}\n🥅 Finalizações: ${chutesCasa} x ${chutesFora}\n📈 Odds Pré: ${oddCasa} x ${oddFora}\n⛳️ Cantos: ${cantosCasa} x ${cantosFora}\n🕛 Tempo: ${minutos}\n\n🤖 *Entrar em OVER ${placar} GOLS*${link ? `\n\n[${link}](${link})` : ''}`;
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
