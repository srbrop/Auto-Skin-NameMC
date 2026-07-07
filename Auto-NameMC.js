const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
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

        console.log(`✅ Tabs detected. Starting bot with Anti-Crash Shield active!\n`);

        for (let skin of skins) {
            const skinPath = path.join(__dirname, skin);
            let uploadSuccess = false;
            let attempts = 1;

            while (!uploadSuccess) {
                console.log(`👕 [Attempt #${attempts}] Processing: ${skin}...`);

                try {
                    await tabMinecraft.bringToFront();
                    
                    if (!tabMinecraft.url().includes('editskin')) {
                        console.log(`🚨 [ALERT] Redirect detected. Pausing 30s for session verification...`);
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

                    console.log(`   └─ Sending request to Mojang servers...`);
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
                            let errorDetails = 'Could not extract details.';
                            try { errorDetails = await apiResponse.text(); } catch (e) {}
                            
                            console.log(`   ⚠️ [REJECTED] Server returned code: ${statusCode}`);
                            console.log(`   🔍 [ROOT CAUSE]: ${errorDetails}`);
                        }
                        
                        console.log(`   ⏳ [PENALTY] Reloading environment and waiting 15s to retry...`);
                        await tabMinecraft.reload({ waitUntil: 'networkidle2', timeout: 60000 }); 
                        await new Promise(r => setTimeout(r, 15000));
                        attempts++;
                    }

                } catch (innerError) {
                    console.log(`   🚨 [BROWSER ERROR] Page timed out or disconnected.`);
                    console.log(`   🔍 Error details: ${innerError.message}`);
                    console.log(`   ⏳ [RECOVERY] Forcing reload and retrying in 15s...`);
                    
                    try { 
                        await tabMinecraft.reload({ waitUntil: 'networkidle2', timeout: 60000 }); 
                    } catch (e) {
                        console.log(`   ⚠️ Could not reload, will retry in the next cycle.`);
                    }
                    
                    await new Promise(r => setTimeout(r, 15000));
                    attempts++;
                }
            }

            try {
                console.log(`🔄 Switching to NameMC for the FIRST F5...`);
                await tabNameMC.bringToFront();
                await tabNameMC.reload({ waitUntil: 'networkidle2', timeout: 60000 });
                
                console.log(`⏳ Waiting 8 seconds for data to propagate...`);
                await new Promise(r => setTimeout(r, 8000));

                console.log(`🔄 Executing SECOND security F5 on NameMC...`);
                await tabNameMC.reload({ waitUntil: 'networkidle2', timeout: 60000 });
                console.log(`✅ History secured.`);
            } catch (nameMcError) {
                console.log(`   ⚠️ [WARNING] Delay occurred while reloading NameMC, but history should be safe.`);
            }

            console.log(`⏳ Waiting remaining 7 seconds of cooldown...\n`);
            await new Promise(r => setTimeout(r, 7000));
        }

        console.log(`🎉 ALL DONE! 27 skins successfully uploaded and secured in your history.`);

    } catch (error) {
        console.error('\n❌ A catastrophic error occurred (Outside the loop):', error);
    }
})();
