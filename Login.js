const { chromium } = require('playwright');
const { sleep, moveMouseRandomly, clickAndFill, closeLaterPopup } = require('./utils');

async function closeSaveCredentialsPopup(page) {
    try {
        await page.waitForSelector('button[type="button"]', { timeout: 5000 });
        await page.click('button[type="button"]');
        console.log("Fenêtre d'enregistrement des identifiants fermée.");
    } catch (e) {
        console.log("Pas de fenêtre d'enregistrement des identifiants.");
    }
}

// Fonction pour se connecter à Instagram
async function loginInstagram(username, password, redirectUrl) {
    const browser = await chromium.launch({ headless: false, slowMo: 500 });
    const page = await browser.newPage();

    await page.goto('https://www.instagram.com/');
    await sleep(5000, 10000);

    await moveMouseRandomly(page, 0, 1000, 0, 800);
    await clickAndFill(page, 'input[name="username"]', username);
    await sleep(2000, 5000);

    await moveMouseRandomly(page, 0, 1000, 0, 800);
    await clickAndFill(page, 'input[name="password"]', password);
    await sleep(2000, 4000);

    await closeSaveCredentialsPopup(page);
    await moveMouseRandomly(page, 0, 1000, 0, 800);

    await page.click('button[type="submit"]');

    await sleep(9000, 15000);

    await page.goto('https://www.instagram.com/');
    await sleep(5000, 12000);

    console.log(`Redirection vers le profil Instagram : ${redirectUrl}...`);
    await page.goto(redirectUrl);
    await sleep(5000, 12000);

    return page;
}

module.exports = { loginInstagram };
