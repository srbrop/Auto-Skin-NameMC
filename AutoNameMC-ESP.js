const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
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

        console.log(`✅ Pestañas detectadas. ¡Iniciando el bot con Escudo Anti-Crasheos Activo!\n`);

        for (let skin of skins) {
            const skinPath = path.join(__dirname, skin);
            let subidaExitosa = false;
            let intentos = 1;

            while (!subidaExitosa) {
                console.log(`👕 [Intento #${intentos}] Procesando: ${skin}...`);

                try {
                    await tabMinecraft.bringToFront();
                    
                    if (!tabMinecraft.url().includes('editskin')) {
                        console.log(`🚨 [ALERTA] Redirección detectada. Pausando 30s para que verifiques tu sesión...`);
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

                    console.log(`   └─ Enviando petición a los servidores de Mojang...`);
                    const btnCargar = 'button[data-aem-contentname="Upload Skin"]';
                    await tabMinecraft.waitForSelector(btnCargar, { visible: true, timeout: 15000 });
                    await tabMinecraft.click(btnCargar);

                    const respuestaAPI = await promesaRed;

                    if (respuestaAPI && respuestaAPI.ok()) {
                        console.log(`   ✅ [CONFIRMADO] El servidor aceptó la skin perfectamente.`);
                        subidaExitosa = true; 
                    } else {
                        if (!respuestaAPI) {
                            console.log(`   ⚠️ [FALLO SILENCIOSO] La petición no salió o la página se congeló.`);
                        } else {
                            const statusCode = respuestaAPI.status();
                            let detallesError = 'No se pudieron extraer detalles.';
                            try { detallesError = await respuestaAPI.text(); } catch (e) {}
                            
                            console.log(`   ⚠️ [RECHAZADO] Servidor devolvió código: ${statusCode}`);
                            console.log(`   🔍 [MOTIVO REAL]: ${detallesError}`);
                        }
                        
                        console.log(`   ⏳ [PENALIZACIÓN] Refrescando entorno y esperando 15s para reintentar...`);
                        await tabMinecraft.reload({ waitUntil: 'networkidle2', timeout: 60000 }); 
                        await new Promise(r => setTimeout(r, 15000));
                        intentos++;
                    }

                } catch (innerError) {
                    console.log(`   🚨 [ERROR DE NAVEGADOR] La página tardó demasiado o se desconectó.`);
                    console.log(`   🔍 Detalles del fallo: ${innerError.message}`);
                    console.log(`   ⏳ [RECUPERACIÓN] Forzando recarga y reintentando en 15s...`);
                    
                    try { 
                        await tabMinecraft.reload({ waitUntil: 'networkidle2', timeout: 60000 }); 
                    } catch (e) {
                        console.log(`   ⚠️ No se pudo recargar, reintentaremos en el próximo ciclo.`);
                    }
                    
                    await new Promise(r => setTimeout(r, 15000));
                    intentos++;
                }
            }

            try {
                console.log(`🔄 Pasando a NameMC para el PRIMER F5...`);
                await tabNameMC.bringToFront();
                await tabNameMC.reload({ waitUntil: 'networkidle2', timeout: 60000 });
                
                console.log(`⏳ Esperando 8 segundos a que se propaguen los cambios...`);
                await new Promise(r => setTimeout(r, 8000));

                console.log(`🔄 Dando el SEGUNDO F5 de seguridad en NameMC...`);
                await tabNameMC.reload({ waitUntil: 'networkidle2', timeout: 60000 });
                console.log(`✅ Historial asegurado.`);
            } catch (nameMcError) {
                console.log(`   ⚠️ [AVISO] Hubo un retraso al recargar NameMC, pero el historial debería estar a salvo.`);
            }

            console.log(`⏳ Esperando los 7 segundos restantes de seguridad...\n`);
            await new Promise(r => setTimeout(r, 7000));
        }

        console.log(`🎉 ¡PROCESO COMPLETADO! 27 skins subidas y aseguradas en tu historial.`);

    } catch (error) {
        console.error('\n❌ Ocurrió un error catastrófico (Fuera del bucle):', error);
    }
})();
