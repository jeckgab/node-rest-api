const { sleep, closeFollowersPopup } = require('./utils');

async function extractFollowers(page, url) {
    try {
        await sleep(5000, 7000);
        await page.goto(url);
        await sleep(2000, 4000);

        const followersLink = await page.locator('a[href*="followers"]').first();
        await sleep(3000, 6000);
        const followersCount = await followersLink.textContent();
        console.log(`Nombre total d'abonnés : ${followersCount}`);
        await followersLink.click();
        await sleep(3000, 8000);

        await page.waitForSelector('div[role="dialog"]', { timeout: 20000 });

        console.log('Défilement pour charger les abonnés...');
        const followers = new Set();
        let previousFollowersCount = 0;
        let isScrolledToBottom = false;
        let maxScrolls = 30;

        while (!isScrolledToBottom && maxScrolls-- > 0) {
            console.log('Défilement de la liste...');
            await page.evaluate(() => {
                const dialog = document.querySelector('div[role="dialog"]');
                if (dialog) dialog.scrollTop = dialog.scrollHeight;
            });

            await sleep(4000, 8000);

            const dialog = await page.$('div[role="dialog"]');
            const scrollHeight = await dialog.evaluate(el => el.scrollHeight);
            const scrollTop = await dialog.evaluate(el => el.scrollTop);
            const clientHeight = await dialog.evaluate(el => el.clientHeight);

            isScrolledToBottom = scrollHeight - scrollTop === clientHeight;

            const usernames = await page.$$eval('div[role="dialog"] a[href^="/"][role="link"]', links =>
                links.map(link => link.textContent.trim())
            );

            usernames.forEach(username => {
                if (username && /^[a-zA-Z0-9._]+$/.test(username)) {
                    followers.add(username);
                }
            });

            if (followers.size === previousFollowersCount) {
                console.log("Plus de nouveaux abonnés détectés.");
                break;
            } else {
                previousFollowersCount = followers.size;
            }
        }

        console.log('\nListe des abonnés extraits :');
        followers.forEach(username => console.log(username));
        console.log(`\nTotal d'abonnés extraits : ${followers.size}`);

        await closeFollowersPopup(page);
        return Array.from(followers);
    } catch (error) {
        console.error('Une erreur est survenue :', error.message);
    }
}

module.exports = { extractFollowers };
