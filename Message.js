const { sleep, clickAndFill } = require('./utils');

// Fonction pour envoyer un message sur Instagram
async function sendInstagramMessage(page, recipient, message) {
    await page.click("svg[aria-label='Nouveau message']");
    await sleep(4000, 4000);

    await clickAndFill(page, 'input[name="queryBox"]', recipient);
    await sleep(6000, 10000);

    await page.click('input[name="ContactSearchResultCheckbox"]');
    await sleep(3000, 6000);

    await page.click('div[role="button"]:has-text("Discuter")');
    await sleep(5000, 10000);

    const messageBox = await page.locator('div[aria-label="Écrire un message"][contenteditable="true"]');
    await sleep(1000, 2000); 
    await messageBox.fill(message);
    await sleep(2000, 5000);

    await messageBox.press("Enter");
    await sleep(7000, 12000);
}

module.exports = { sendInstagramMessage };
