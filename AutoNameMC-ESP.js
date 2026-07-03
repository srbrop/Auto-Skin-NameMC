/**
 * Minecraft Skin Batch Uploader & NameMC Synchronizer
 * --------------------------------------------------
 * Repository: Open Source
 * License: MIT
 * Description: Automates sequential skin uploads to minecraft.net
 * and forces profile history synchronization on NameMC in reverse order.
 */

const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    // === 1. RESOURCE MATRIX GENERATION (SKINS) ===
    // Configured for reverse order: c(9)->c(1), b(9)->b(1), a(9)->a(1)
    const letters = ['c', 'b', 'a'];
    const skins = [];
    
    for (let letter of letters) {
        for (let i = 9; i >= 1; i--) {
            // Target file name format: e.g., "c(9).png"
            skins.push(`${letter}(${i}).png`); 
        }
    }

    console.log(`📋 [INFO] Matrix generated successfully: ${skins.length} items in queue.`);

    try {
        // === 2. BROWSER CONNECTION VIA CDP (Chrome DevTools Protocol) ===
        console.log(`🔌 [CONNECT] Attempting link with browser instance on port 9222...`);
        const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222' });
        const pages = await browser.pages();

        // Map and discriminate target tabs
        let tabMinecraft = pages.find(p => p.url().includes('minecraft.net'));
        let tabNameMC = pages.find(p => p.url().includes('namemc.com'));

        if (!tabMinecraft || !tabNameMC) {
            throw new Error('Target tabs not detected. Please verify active browser sessions.');
        }

        console.log(`✅ [SUCCESS] Automation channels validated. Starting main sequence.`);

        // === 3. MAIN CORE LOOP ===
        for (let skin of skins) {
            const skinPath = path.join(__dirname, skin);
            let uploadSuccess = false;
            let attempts = 1;

            // Resilience loop: Prevents sequence order loss if Mojang API errors out
            while (!uploadSuccess) {
                console.log(`\n👕 [PROCESS] [${skin}] - Transmission attempt #${attempts}`);

                // Focus active work tab to prevent rendering desyncs
                await tabMinecraft.bringToFront();
                
                // Target the native Minecraft DOM upload button ID
                const btnSelector = '#choose-file';
                await tabMinecraft.waitForSelector(btnSelector, { visible: true });
                
                // Asynchronously intercept native OS File Chooser
                const [fileChooser] = await Promise.all([
                    tabMinecraft.waitForFileChooser(),
                    tabMinecraft.click(btnSelector)
                ]);
                
                // Inject local file path into the binary input
                await fileChooser.accept([skinPath]);
                console.log(`   └─ 💾 Local payload loaded into DOM.`);
                
                // Technical delay for 3D skin render preview processing
                await new Promise(r => setTimeout(r, 2500));
                
                // Trigger submit event (Click Upload/Save button)
                await tabMinecraft.evaluate(() => {
                    const buttons = Array.from(document.querySelectorAll('button'));
                    const uploadBtn = buttons.find(b => b.innerText && (b.innerText.toLowerCase().includes('cargar') || b.innerText.toLowerCase().includes('guardar') || b.innerText.toLowerCase().includes('upload')));
                    if (uploadBtn) uploadBtn.click();
                });

                console.log(`   └─ ⏳ Waiting for Mojang database write confirmation...`);
                await new Promise(r => setTimeout(r, 4000)); 

                // === 4. ANTI-RATE LIMITING INSPECTION SYSTEM (SHIELD) ===
                const hasError = await tabMinecraft.evaluate(() => {
                    // Analytical detection of error components/spam block banners
                    const errorBanner = document.querySelector('.notification-banner, .alert-danger, .error-message, [class*="error"], [class*="alert"]');
                    if (errorBanner && errorBanner.offsetHeight > 0) return true;

                    // Syntactic analysis of plain body text for common network exceptions
                    const pageText = document.body.innerText.toLowerCase();
                    if (pageText.includes('error al subir') || pageText.includes('error guardando') || pageText.includes('inténtalo de nuevo') || pageText.includes('too many requests')) {
                        return true; 
                    }
                    return false;
                });

                if (hasError) {
                    console.log(`   ⚠️ [REJECTED] Server saturated or request denied for ${skin}.`);
                    console.log(`   ⏳ [PENALTY] Reloading environment and applying 15s cooldown before retry.`);
                    
                    // Hard-reset active tab to clear corrupted DOM states
                    await tabMinecraft.reload({ waitUntil: 'networkidle2' }); 
                    await new Promise(r => setTimeout(r, 15000));
                    attempts++;
                } else {
                    console.log(`   ✅ [ACCEPTED] Skin successfully registered globally.`);
                    uploadSuccess = true; // Breaks retry loop
                }
            }

            // === 5. NAMEMC HISTORY SYNCHRONIZATION (F5) ===
            console.log(`🔄 [SYNC] Forcing refresh (F5) on NameMC...`);
            await tabNameMC.bringToFront();
            await tabNameMC.reload({ waitUntil: 'networkidle2' });
            console.log(`✅ [SYNCED] History updated on NameMC.`);

            // === 6. REGULATORY BEHAVIOR COOL DOWN ===
            console.log(`⏳ [COOL DOWN] Waiting 15 seconds to mitigate bot behavior signatures...`);
            await new Promise(r => setTimeout(r, 15000));
        }

        console.log(`\n🎉 [FINISH] All 27 skins processed in flawless reverse order!`);

    } catch (error) {
        console.error('❌ [FATAL ERROR] Critical exception in execution thread:', error);
    }
})();