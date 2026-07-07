const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
    /* =========================================================
       🛑 ¡EDITA TU NOMBRE DE USUARIO AQUÍ ABAJO! 🛑
       Cambia 'sonrojado' por tu usuario exacto de NameMC
       ========================================================= */
    const username = 'sonrojado'; 

    const urlNameMC = `https://es.namemc.com/profile/${username}`;
    const letras = ['c', 'b', 'a'];
    const skins = [];
    
    for (let letra of letras) {
        for (let i = 9; i >= 1; i--) {
            skins.push(`${letra}(${i}).png`); 
        }
    }

    console.log(`📋 Lista generada: ${skins.length} skins para subir.`);

    try {
        console.log(`🔌 Conectando a tu navegador para la subida...`);
        const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222' });
        const pages = await browser.pages();

        let tabMinecraft = pages.find(p => p.url().includes('minecraft.net'));
        let tabNameMC = pages.find(p => p.url().includes('namemc.com'));

        if (!tabMinecraft || !tabNameMC) {
            throw new Error('❌ ¡No encontré las pestañas! Asegúrate de tener minecraft.net y namemc.com abiertas.');
        }

        console.log(`✅ Pestañas detectadas. ¡Iniciando el bot Ultimate!\n`);

        for (let skin of skins) {
            const skinPath = path.join(__dirname, skin);
            let subidaExitosa = false;
            let intentos = 1;

            while (!subidaExitosa) {
                console.log(`👕 [Intento #${intentos}] Procesando: ${skin}...`);

                try {
                    await tabMinecraft.bringToFront();
                    
                    if (!tabMinecraft.url().includes('editskin')) {
                        console.log(`🚨 [ALERTA] Redirección detectada. Pausando 30s...`);
                        await new Promise(r => setTimeout(r, 30000));
                        await tabMinecraft.goto('https://www.minecraft.net/msaprofile/mygames/editskin', { waitUntil: 'networkidle2', timeout: 60000 });
                        continue;
                    }

                    const btnSelectorFile = '#choose-file';
                    await tabMinecraft.waitForSelector(btnSelectorFile, { visible: true, timeout: 15000 });
                    
                    const [fileChooser] = await Promise.all([
                        tabMinecraft.waitForFileChooser({ timeout: 15000 }),
                        tabMinecraft.click(btnSelectorFile)
                    ]);
                    await fileChooser.accept([skinPath]);
                    
                    await new Promise(r => setTimeout(r, 2500));
                    
                    const promesaRed = tabMinecraft.waitForResponse(
                        res => res.url().includes('/profile/skins') && res.request().method() !== 'OPTIONS',
                        { timeout: 12000 }
                    ).catch(() => null); 

                    console.log(`   └─ Enviando petición a Mojang...`);
                    const btnCargar = 'button[data-aem-contentname="Upload Skin"]';
                    await tabMinecraft.waitForSelector(btnCargar, { visible: true, timeout: 15000 });
                    await tabMinecraft.click(btnCargar);

                    const respuestaAPI = await promesaRed;

                    if (respuestaAPI && respuestaAPI.ok()) {
                        console.log(`   ✅ [CONFIRMADO] El servidor aceptó la skin perfectamente.`);
                        subidaExitosa = true; 
                    } else {
                        if (!respuestaAPI) {
                            console.log(`   ⚠️ [FALLO SILENCIOSO] Petición perdida o página congelada.`);
                        } else {
                            const statusCode = respuestaAPI.status();
                            let detallesError = 'No detallado.';
                            try { detallesError = await respuestaAPI.text(); } catch (e) {}
                            
                            console.log(`   ⚠️ [RECHAZADO] Código: ${statusCode} | Motivo: ${detallesError}`);
                        }
                        
                        console.log(`   ⏳ [PENALIZACIÓN] Esperando 15s para reintentar...`);
                        await tabMinecraft.reload({ waitUntil: 'networkidle2', timeout: 60000 }); 
                        await new Promise(r => setTimeout(r, 15000));
                        intentos++;
                    }

                } catch (innerError) {
                    console.log(`   🚨 [ERROR DE NAVEGADOR] ${innerError.message}`);
                    console.log(`   ⏳ [RECUPERACIÓN] Forzando recarga (15s)...`);
                    try { await tabMinecraft.reload({ waitUntil: 'networkidle2', timeout: 60000 }); } catch (e) {}
                    await new Promise(r => setTimeout(r, 15000));
                    intentos++;
                }
            }

            try {
                console.log(`🔄 Pasando a NameMC para el PRIMER F5...`);
                await tabNameMC.bringToFront();
                await tabNameMC.reload({ waitUntil: 'networkidle2', timeout: 60000 });
                
                await new Promise(r => setTimeout(r, 8000));

                console.log(`🔄 Dando el SEGUNDO F5 de seguridad en NameMC...`);
                await tabNameMC.reload({ waitUntil: 'networkidle2', timeout: 60000 });
                console.log(`✅ Historial asegurado.`);
            } catch (nameMcError) {
                console.log(`   ⚠️ [AVISO] Retraso al recargar NameMC.`);
            }

            console.log(`⏳ Esperando 7s de seguridad...\n`);
            await new Promise(r => setTimeout(r, 7000));
        }

        console.log(`📸 [AUTOCAPTURA] Abriendo instancia limpia para la foto 4K...`);
        const captureBrowser = await puppeteer.launch({ headless: false, defaultViewport: null });
        const capturePage = await captureBrowser.browserContexts()[0].newPage();
        
        await capturePage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await capturePage.setViewport({ width: 1920, height: 3000, deviceScaleFactor: 4 });

        await capturePage.setRequestInterception(true);
        capturePage.on('request', (request) => {
            const urlReq = request.url();
            if (urlReq.includes('googleads') || urlReq.includes('doubleclick') || urlReq.includes('ads')) {
                request.abort(); 
            } else { request.continue(); }
        });

        console.log(`🌐 Entrando al perfil fotográfico...`);
        await capturePage.goto(urlNameMC, { waitUntil: 'networkidle2', timeout: 60000 });
        await capturePage.waitForSelector('h1', { timeout: 60000 });
        await capturePage.waitForSelector('canvas', { timeout: 60000 });
        
        await new Promise(r => setTimeout(r, 2000));

        const clipRegion = await capturePage.evaluate(() => {
            const nameEl = document.querySelector('h1');
            const cards = Array.from(document.querySelectorAll('.card'));
            const skinCard = cards.find(c => c.querySelector('canvas'));
            const mosaicCard = cards.find(c => c.innerText.includes('Aspectos') || c.innerText.includes('Skins'));

            if (!nameEl || !skinCard || !mosaicCard) return null;

            const nRect = nameEl.getBoundingClientRect();
            const sRect = skinCard.getBoundingClientRect();
            const mRect = mosaicCard.getBoundingClientRect();

            const left = Math.min(nRect.left, sRect.left, mRect.left);
            const right = Math.max(nRect.right, sRect.right, mRect.right);
            
            return {
                x: left - 5,
                y: nRect.top, 
                width: (right - left) + 5,
                height: (mRect.bottom - nRect.top)
            };
        });

        if (clipRegion) {
            let numeroMural = 1;
            while (fs.existsSync(path.join(__dirname, `${username}_mural_${numeroMural}.png`))) {
                numeroMural++;
            }
            const savePath = path.join(__dirname, `${username}_mural_${numeroMural}.png`);
            await capturePage.screenshot({ path: savePath, clip: clipRegion });
            console.log(`\n📸 ¡FOTO GUARDADA! Registrado como: ${username}_mural_${numeroMural}.png`);
        } else {
            console.log(`\n❌ Error: No se pudo calcular el área de recorte.`);
        }

        await captureBrowser.close();
        browser.disconnect();
        console.log(`\n🎉 ¡PROCESO COMPLETADO!`);

    } catch (error) {
        console.error('\n❌ Ocurrió un error catastrófico:', error);
    }
})();
