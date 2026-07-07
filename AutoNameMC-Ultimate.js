const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
    /* =========================================================
       🛑 EDIT YOUR USERNAME HERE BELOW! 🛑
       Change 'sonrojado' to your exact NameMC username
       ========================================================= */
    const username = 'sonrojado'; 

    const urlNameMC = `https://namemc.com/profile/${username}`;
    const letters = ['c', 'b', 'a'];
    const skins = [];
    
    for (let letter of letters) {
        for (let i = 9; i >= 1; i--) {
            skins.push(`${letter}(${i}).png`); 
        }
    }

    console.log(`📋 List generated: ${skins.length} skins to upload.`);

    try {
        console.log(`🔌 Connecting to your browser instance...`);
        const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222' });
        const pages = await browser.pages();

        let tabMinecraft = pages.find(p => p.url().includes('minecraft.net'));
        let tabNameMC = pages.find(p => p.url().includes('namemc.com'));

        if (!tabMinecraft || !tabNameMC) {
            throw new Error('❌ Tabs not found! Ensure minecraft.net and namemc.com are open.');
        }

        console.log(`✅ Tabs detected. Starting the Ultimate bot!\n`);

        for (let skin of skins) {
            const skinPath = path.join(__dirname, skin);
            let uploadSuccess = false;
            let attempts = 1;

            while (!uploadSuccess) {
                console.log(`👕 [Attempt #${attempts}] Processing: ${skin}...`);

                try {
                    await tabMinecraft.bringToFront();
                    
                    if (!tabMinecraft.url().includes('editskin')) {
                        console.log(`🚨 [ALERT] Redirect detected. Pausing 30s...`);
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
                    
                    const networkPromise = tabMinecraft.waitForResponse(
                        res => res.url().includes('/profile/skins') && res.request().method() !== 'OPTIONS',
                        { timeout: 12000 }
                    ).catch(() => null); 

                    console.log(`   └─ Sending request to Mojang...`);
                    const btnUpload = 'button[data-aem-contentname="Upload Skin"]';
                    await tabMinecraft.waitForSelector(btnUpload, { visible: true, timeout: 15000 });
                    await tabMinecraft.click(btnUpload);

                    const apiResponse = await networkPromise;

                    if (apiResponse && apiResponse.ok()) {
                        console.log(`   ✅ [CONFIRMED] Server accepted the skin perfectly.`);
                        uploadSuccess = true; 
                    } else {
                        if (!apiResponse) {
                            console.log(`   ⚠️ [SILENT FAILURE] Request dropped or page froze.`);
                        } else {
                            const statusCode = apiResponse.status();
                            let errorDetails = 'No details.';
                            try { errorDetails = await apiResponse.text(); } catch (e) {}
                            
                            console.log(`   ⚠️ [REJECTED] Code: ${statusCode} | Reason: ${errorDetails}`);
                        }
                        
                        console.log(`   ⏳ [PENALTY] Waiting 15s to retry...`);
                        await tabMinecraft.reload({ waitUntil: 'networkidle2', timeout: 60000 }); 
                        await new Promise(r => setTimeout(r, 15000));
                        attempts++;
                    }

                } catch (innerError) {
                    console.log(`   🚨 [BROWSER ERROR] ${innerError.message}`);
                    console.log(`   ⏳ [RECOVERY] Forcing reload (15s)...`);
                    try { await tabMinecraft.reload({ waitUntil: 'networkidle2', timeout: 60000 }); } catch (e) {}
                    await new Promise(r => setTimeout(r, 15000));
                    attempts++;
                }
            }

            try {
                console.log(`🔄 Switching to NameMC for the FIRST F5...`);
                await tabNameMC.bringToFront();
                await tabNameMC.reload({ waitUntil: 'networkidle2', timeout: 60000 });
                
                await new Promise(r => setTimeout(r, 8000));

                console.log(`🔄 Executing SECOND security F5 on NameMC...`);
                await tabNameMC.reload({ waitUntil: 'networkidle2', timeout: 60000 });
                console.log(`✅ History secured.`);
            } catch (nameMcError) {
                console.log(`   ⚠️ [WARNING] Delay reloading NameMC.`);
            }

            console.log(`⏳ Waiting 7s cooldown...\n`);
            await new Promise(r => setTimeout(r, 7000));
        }

        console.log(`📸 [AUTOCAPTURE] Opening clean instance for 4K photo...`);
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

        console.log(`🌐 Entering photographic profile...`);
        await capturePage.goto(urlNameMC, { waitUntil: 'networkidle2', timeout: 60000 });
        await capturePage.waitForSelector('h1', { timeout: 60000 });
        await capturePage.waitForSelector('canvas', { timeout: 60000 });
        
        await new Promise(r => setTimeout(r, 2000));

        const clipRegion = await capturePage.evaluate(() => {
            const nameEl = document.querySelector('h1');
            const cards = Array.from(document.querySelectorAll('.card'));
            const skinCard = cards.find(c => c.querySelector('canvas'));
            const mosaicCard = cards.find(c => c.innerText.includes('Skins') || c.innerText.includes('Aspectos'));

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
            console.log(`\n📸 PHOTO SAVED! Registered as: ${username}_mural_${numeroMural}.png`);
        } else {
            console.log(`\n❌ Error: Could not calculate clipping area.`);
        }

        await captureBrowser.close();
        browser.disconnect();
        console.log(`\n🎉 PROCESS COMPLETED!`);

    } catch (error) {
        console.error('\n❌ A catastrophic error occurred:', error);
    }
})();
