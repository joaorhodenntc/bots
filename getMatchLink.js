const puppeteer = require('puppeteer');

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

async function getMatchLink(homeTeam, awayTeam) {
    let browser;
    try {
        // Configurações para rodar o Puppeteer em ambientes com poucos recursos
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
                '--single-process',
            ],
            timeout: 120000 // Aumenta o timeout para lidar com possíveis atrasos na VM
        });

        const page = await browser.newPage();

        // Acessa o site
        await page.goto('https://www.playpix.com/pb/sports/live/event-view', {
            waitUntil: 'networkidle2', // Aguarda até que não haja mais de 2 requisições de rede
            timeout: 120000
        });

        // Espera o input de busca estar disponível na página
        await page.waitForSelector('input.ss-input-bc', { timeout: 30000 });

        const homeTeamNormalized = extrairNomePrincipal(homeTeam);
        const awayTeamNormalized = extrairNomePrincipal(awayTeam);
        await page.type('input.ss-input-bc', homeTeamNormalized);

        // Espera até que os resultados estejam visíveis na página
        await page.waitForSelector('li.sport-search-result-item-bc', { timeout: 60000 });

        // Busca o resultado correspondente ao nome do time
        const link = await page.evaluate((homeTeamNormalized, awayTeamNormalized) => {
            function removerAcentos(texto) {
                return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            }

            const results = document.querySelectorAll('li.sport-search-result-item-bc');
            for (const result of results) {
                const textContent = result.textContent || "";
                const textContentNormalized = removerAcentos(textContent);
                if (textContentNormalized.includes(removerAcentos(homeTeamNormalized)) && textContentNormalized.includes(removerAcentos(awayTeamNormalized))) {
                    result.click();
                    return document.location.href;
                }
            }
            return null;
        }, homeTeamNormalized, awayTeamNormalized);

        if (!link) {
            console.log('Partida não encontrada.');
            return null;
        }

        await page.waitForNavigation();

        const currentUrl = page.url();
        return currentUrl;

    } catch (error) {
        console.error('Erro ao obter o link da partida:', error);
        return null;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

module.exports = getMatchLink;
