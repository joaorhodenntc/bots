const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
require('dotenv').config();
const countryFlags = require('./countryFlags');

const token = '6323285955:AAFYiFWnG0aLKmhxFD-orRu7KwmXhjJ7gUY'
const chat_bot = '-1002011266973'
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
  url: 'https://soccer-football-info.p.rapidapi.com/matches/day/full/',
  params: {
    d: '20240918',  // Data do dia desejado
    p: '1',  // Página inicial
    l: 'pt_PT'
  },
  headers: {
    'X-RapidAPI-Key': apiKey,
    'x-rapidapi-host': 'soccer-football-info.p.rapidapi.com'
  }
};

let qtdTotalPartidas = 0;
let qtdPartidasFiltradas = 0;
const partidasOver = [];
const partidasUnder = [];
let exibirMensagemOver = false;
let exibirMensagemUnder = false;

async function analisarPartidas() {
    let hasMorePages = true;
    let currentPage = 1;
  
    try {
      while (hasMorePages) {
        // Atualiza o número da página a cada iteração
        options.params.p = currentPage;
  
        // Faz a requisição para a API
        try {
          const response = await axios.request(options);
          const partidas = response.data.result;
  
          qtdTotalPartidas += partidas.length;
  
          for (let i = 0; i < partidas.length; i++) {
            const status = partidas[i].status;
            const ultimas5home = partidas[i].teamA.perf.l_5_matches;
            const ultimas5away = partidas[i].teamB.perf.l_5_matches;
            
            if (status == "NOT_STARTED" && ultimas5home.length >= 5 && ultimas5away.length >= 5){
              const nameTeamA = partidas[i].teamA.name;
              const nameTeamB = partidas[i].teamB.name;
              const percentage_over_teamA = partidas[i].teamA.perf.o_2_5_game;
              const percentage_over_teamB = partidas[i].teamB.perf.o_2_5_game;
              const percentage_btts_teamA = partidas[i].teamA.perf.btts;
              const percentage_btts_teamB = partidas[i].teamB.perf.btts;
  
              const dateStr = partidas[i].date;  
              const [data, horario] = dateStr.split(" ");
              const [horas, minutos] = horario.split(":");
              let dataHora = new Date(`${data}T${horas}:${minutos}:00`);
              dataHora.setHours(dataHora.getHours() - 3);
              const horarioPartida = dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  
              // Classifica as partidas com base nas condições
              if (percentage_over_teamA >= 100 && percentage_over_teamB >= 100) {
                partidasOver.push(`${nameTeamA} x ${nameTeamB} (${horarioPartida})`);
              }
  
              if (percentage_over_teamA < 20 && percentage_over_teamB < 20) {
                partidasUnder.push(`${nameTeamA} x ${nameTeamB} (${horarioPartida})`);
              }
            }
          }
          currentPage++;
  
        } catch (error) {
          console.log("\nFim das páginas");
          hasMorePages = false;
        }
      }

      console.log(`Total de partidas processadas: ${qtdTotalPartidas}`);
      console.log(`Total de partidas encontradas com análise: ${qtdPartidasFiltradas}`);

      if (partidasOver.length > 0) {
        if (!exibirMensagemOver) {
          console.log(`\nPARTIDAS COM 100% DE OVER 2.5: ⚽`);
          exibirMensagemOver = true; 
        }
        partidasOver.forEach(partida => console.log(partida));
        qtdPartidasFiltradas += partidasOver.length;
      }

      if (partidasUnder.length > 0) {
        if (!exibirMensagemUnder) {
          console.log(`\nPARTIDAS COM 100% DE UNDER 2.5:⚽`);
          exibirMensagemUnder = true;
        }
        partidasUnder.forEach(partida => console.log(partida));
        qtdPartidasFiltradas += partidasUnder.length;
      }
    } catch (error) {
      console.error(error);
    }
  }
  
analisarPartidas();


