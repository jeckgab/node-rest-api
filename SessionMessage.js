const { loginInstagram } = require('./Login');
const { sendInstagramMessage } = require('./Message');

const { sleep,closeLaterPopup} = require('./utils');

// Gérer la session globale
async function sendMessagesToUsers(page, users, ContenueMessageList) {
    // Fermer la popup 'Plus tard' si elle apparaît
 
    await sleep(6000, 8000);

    // Parcourir la liste des utilisateurs et envoyer un message à chacun
    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const contenu = ContenueMessageList[i];
        await sendInstagramMessage(page, user, contenu);
        await sleep(6000, 8000);  // Délai entre chaque message
    }
}





async function startSessionMessage(Username,mdp, users, ContenueMessageList) {
    const redirectUrl = 'https://www.instagram.com/nyhanitrahauratius/';
    const page = await loginInstagram(Username, mdp, redirectUrl);


    console.log("Le navigateur restera ouvert. Vous pouvez interagir manuellement si nécessaire.");
    await sleep(5000, 7000);
    console.log("Redirection vers Instagram Direct...");
    await page.click('a[href="/direct/inbox/"]');
    await sleep(5000, 7000);

    // Fermer la popup 'Plus tard' si elle apparaît
    await closeLaterPopup(page);
    await sendMessagesToUsers(page, users, ContenueMessageList);
    await sleep(5000, 7000 );

    await page.close();
}



module.exports = { startSessionMessage};