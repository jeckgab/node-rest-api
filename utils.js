

// Fonction pour fermer la popup 'Plus tard' si elle apparaît
async function closeLaterPopup(page) {
    try {
        // Attendre que le bouton 'Plus tard' soit visible (en utilisant un sélecteur spécifique)
        await page.waitForSelector('button:has-text("Plus tard")', { timeout: 5000 });  // Attente du bouton
        await page.click('button:has-text("Plus tard")');  // Cliquer sur le bouton
        console.log("Popup 'Plus tard' fermée.");
    } catch (e) {
        console.log(`Pas de popup 'Plus tard' ou erreur : ${e}`);
    }
}
// Fonction pour fermer le popup des abonnés
async function closeFollowersPopup(page) {
    try {
        await sleep(6000, 6000); // Attendre exactement 6 secondes
        await page.click('div[role="dialog"] button');
        console.log("Popup des abonnés fermé.");
    } catch (e) {
        console.log(`Erreur lors de la fermeture du popup des abonnés : ${e}`);
    }
}

// Fonction de pause avec un temps aléatoire
const sleep = (min, max) => {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
};

// Fonction pour simuler un clic et remplir un champ avec un texte
async function clickAndFill(page, selector, text) {
    await page.click(selector);
    await page.fill(selector, text);
}

// Fonction pour déplacer la souris de manière aléatoire
async function moveMouseRandomly(page, xMin, xMax, yMin, yMax) {
    const x = Math.floor(Math.random() * (xMax - xMin + 1)) + xMin;
    const y = Math.floor(Math.random() * (yMax - yMin + 1)) + yMin;
    await page.mouse.move(x, y);
    await sleep(500, 1500); // Attente entre 0.5 et 1.5 secondes
}

module.exports = { sleep, moveMouseRandomly, clickAndFill, closeFollowersPopup,closeLaterPopup };
