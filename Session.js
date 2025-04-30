const { loginInstagram } = require('./Login');
const { sendInstagramMessage } = require('./Message');
const { extractFollowers } = require('./Followers');
const { sleep,closeLaterPopup} = require('./utils');

// Gérer la session globale
async function startSession(Username,mdp, url) {
    const redirectUrl = 'https://www.instagram.com/nyhanitrahauratius/';
    const page = await loginInstagram(Username, mdp, redirectUrl);

    const followers = await extractFollowers(page,url);

    console.log("Le navigateur restera ouvert. Vous pouvez interagir manuellement si nécessaire.");
    await sleep(5000, 7000);

    await page.close();
    return Array.from(followers);
    
}



module.exports = { startSession};