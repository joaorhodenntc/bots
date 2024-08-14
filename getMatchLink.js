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
    let browser
    try {
        browser  = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
            ],
        });

        const page = await browser.newPage();

        // Acessa o site
        await page.goto('https://www.playpix.com/pb/sports/live/event-view');

        // Espera o input de busca estar disponível na página
        await page.waitForSelector('input.ss-input-bc', { timeout: 30000 });

        const homeTeamNormalized = extrairNomePrincipal(homeTeam);
        const awayTeamNormalized = extrairNomePrincipal(awayTeam);
        await page.type('input.ss-input-bc', homeTeamNormalized);

        try {
            await page.waitForSelector('li.sport-search-result-item-bc', { timeout: 60000 });
        } catch (error) {
            console.log("Partida não encontrada", extrairNomePrincipal(homeTeam),"x",extrairNomePrincipal(awayTeam));
        }

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
