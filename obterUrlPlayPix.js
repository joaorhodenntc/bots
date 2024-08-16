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

function formatarNome(nome) {
    return nome
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-zA-Z0-9\s&-]/g, '') // Remove caracteres especiais, exceto hífens
        .replace(/\s+/g, '-') // Substitui espaços por "-"
        .replace(/&/g, 'and') // Substitui "&" por "and"
        .replace(/\d+/g, '') // Remove números, exceto "U20" e similares
        .toLowerCase();
}

function formatarAliasRegiao(aliasRegiao) {
    return aliasRegiao.split(' ').join('%20');
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
                    const aliasRegiao = formatarAliasRegiao(regioes[regiaoId].alias); 
                    for (const competicaoId in competicoes) {
                        const nomeCompeticao = formatarNome(competicoes[competicaoId].name);
                        const jogos = competicoes[competicaoId].game;
                        for (const jogoId in jogos) {
                            const jogo = jogos[jogoId];
                            const team1Name = jogo.team1_name || '';
                            const team2Name = jogo.team2_name || '';
                            
                            const team1NameNormalizado = removerAcentos(team1Name);
                            const team2NameNormalizado = removerAcentos(team2Name);

                            if ((team1NameNormalizado.includes(timeCasaNormalizado) || team2NameNormalizado.includes(timeCasaNormalizado)) && (team1NameNormalizado.includes(timeForaNormalizado) || team2NameNormalizado.includes(timeForaNormalizado))) {
                                const team1NameFormatado = formatarNome(team1NameNormalizado);
                                const team2NameFormatado = formatarNome(team2NameNormalizado);

                                const url = `https://playpix.com/pb/sports/live/event-view/Soccer/${aliasRegiao}/${competicaoId}/${nomeCompeticao}/${jogoId}/${team1NameFormatado}-${team2NameFormatado}`;
                                console.log(url);
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

obterUrlPlayPix("Feniks-pro", "Izumrud-pro");

module.exports = obterUrlPlayPix;
