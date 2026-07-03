const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const username = 'sonrojado'; 
    const url = `https://es.namemc.com/profile/${username}`;

    console.log(`🚀 Iniciando navegador (Modo Recorte Perfecto) para: ${username}...`);

    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: null 
    });
    
    const page = await browser.browserContexts()[0].newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // 🎯 Mantenemos el alto gigante y el zoom x4 para la calidad brutal
    await page.setViewport({
        width: 1920,
        height: 3000, 
        deviceScaleFactor: 4 
    });

    // Bloqueador nativo de anuncios
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        const urlReq = request.url();
        if (urlReq.includes('googleads') || urlReq.includes('doubleclick') || urlReq.includes('ads')) {
            request.abort(); 
        } else {
            request.continue(); 
        }
    });

    try {
        console.log(`🌐 Entrando a NameMC...`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        await page.waitForSelector('h1', { timeout: 60000 });
        await page.waitForSelector('canvas', { timeout: 60000 });

        console.log(`📐 Aplicando tus medidas de recorte exactas...`);
        
        await new Promise(r => setTimeout(r, 2000)); 

        const clipRegion = await page.evaluate(() => {
            const nameEl = document.querySelector('h1');
            const cards = Array.from(document.querySelectorAll('.card'));

            const skinCard = cards.find(c => c.querySelector('canvas'));
            const mosaicCard = cards.find(c => c.innerText.includes('Aspectos') || c.innerText.includes('Skins'));

            if (!nameEl || !skinCard || !mosaicCard) return null;

            // Obtenemos las cajas de cada elemento
            const nRect = nameEl.getBoundingClientRect();
            const sRect = skinCard.getBoundingClientRect();
            const mRect = mosaicCard.getBoundingClientRect();

            // Calculamos los límites extremos
            const left = Math.min(nRect.left, sRect.left, mRect.left);
            const right = Math.max(nRect.right, sRect.right, mRect.right);
            const top = nRect.top;
            const bottom = mRect.bottom;

            // ✂️ AJUSTE FINO DE BORDES (Tus medidas aplicadas)
            // Ya no hay 30px de margen estorbando.
            const margenIzquierdo = 5; // Lo mínimo para no cortar la "S"
            const margenDerecho = 0;   // Adiós borde verde
            const margenArriba = 0;    // Adiós borde azul
            const margenAbajo = 0;     // Adiós borde rojo

            return {
                x: left - margenIzquierdo,
                y: top - margenArriba, 
                width: (right - left) + margenIzquierdo + margenDerecho,
                height: (bottom - top) + margenArriba + margenAbajo 
            };
        });

        if (clipRegion) {
            const savePath = path.join(__dirname, `${username}_perfil_perfecto.png`);
            await page.screenshot({
                path: savePath,
                clip: clipRegion 
            });
            console.log(`📸 ¡LISTO! Captura milimétrica guardada como: ${username}_perfil_perfecto.png`);
        } else {
            console.log(`❌ Error: No se pudo calcular el área.`);
        }

    } catch (error) {
        console.error('❌ Ocurrió un error:', error);
    } finally {
        await browser.close();
        console.log('🏁 Proceso terminado. Revisa tu imagen.');
    }
})();