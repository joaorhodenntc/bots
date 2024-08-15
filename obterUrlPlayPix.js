const axios = require('axios');

function extrairNomePrincipal(nomeTime) {
    const partes = nomeTime.trim().split(' ');
    let maiorPalavra = partes[0];

    for (let i = 1; i < partes.length; i++) {
        if (partes[i].length > maiorPalavra.length) {
            maiorPalavra = partes[i];
        }
    }
    return maiorPalavra;
}

function removerAcentos(texto) {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

async function obterUrlPlayPix(timeCasa, timeFora) {
    try {
        const response = await axios.get('https://feedodds.com/feed/json?language=por_2&timeZone=UTC&brandId=18750115&key=1db03acbd60a7d01134e3116f07fde2f');
        const dados = response.data;

        const timeCasaNormalizado = removerAcentos(extrairNomePrincipal(timeCasa));
        const timeForaNormalizado = removerAcentos(extrairNomePrincipal(timeFora));

        // Itera sobre as competições e jogos para encontrar o time
        const esportes = dados.sport;
        for (const esporteId in esportes) {
            if (esporteId === '1') { 
                const regioes = esportes[esporteId].region;
                for (const regiaoId in regioes) {
                    const competicoes = regioes[regiaoId].competition;
                    const aliasRegiao = regioes[regiaoId].alias; 
                    for (const competicaoId in competicoes) {
                        const jogos = competicoes[competicaoId].game;
                        for (const jogoId in jogos) {
                            const jogo = jogos[jogoId];
                            const team1Name = jogo.team1_name || '';
                            const team2Name = jogo.team2_name || '';
                            
                            const team1NameNormalizado = removerAcentos(team1Name);
                            const team2NameNormalizado = removerAcentos(team2Name);

                            if ((team1NameNormalizado.includes(timeCasaNormalizado) || team2NameNormalizado.includes(timeCasaNormalizado)) && (team1NameNormalizado.includes(timeForaNormalizado) || team2NameNormalizado.includes(timeForaNormalizado))) {
                                return `https://www.playpix.com/pb/sports/live/event-view/Soccer/${aliasRegiao}/${competicaoId}/${jogoId}`;
                            }
                        }
                    }
                }
            }
        }
        return null;
    } catch (error) {
        console.error('Erro ao obter dados:', error);
        return null;
    }
}

module.exports = obterUrlPlayPix;
