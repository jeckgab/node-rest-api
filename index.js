require('dotenv').config();
const { chromium } = require('@playwright/test');

// Fonction pour générer un délai aléatoire
const randomDelay = () => Math.floor(Math.random() * 2000) + 1000;

// Fonction pour faire une pause
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function extractFollowers() {
    const browser = await chromium.launch({ headless: false }); // headless: false pour voir l'automatisation
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        // Se connecter à Instagram
        console.log('Connexion à Instagram...');
        await page.goto('https://www.instagram.com/');
        await sleep(randomDelay());

        // Accepter les cookies si nécessaire
        try {
            await page.click('text=Accepter tout');
            await sleep(randomDelay());
        } catch (e) {
            console.log('Pas de popup de cookies ou déjà accepté');
        }

        // Remplir le formulaire de connexion
        await page.fill('input[name="username"]', process.env.INSTAGRAM_USERNAME);
        await sleep(randomDelay());
        await page.fill('input[name="password"]', process.env.INSTAGRAM_PASSWORD);
        await sleep(randomDelay());

        // Cliquer sur le bouton de connexion
        await page.click('button[type="submit"]');
        await sleep(5000); // Attendre que la connexion soit terminée

        // Aller sur la page du compte cible
        console.log(`Navigation vers le compte ${process.env.TARGET_ACCOUNT}...`);
        await page.goto(`https://www.instagram.com/${process.env.TARGET_ACCOUNT}/`);
        await sleep(5000);

        // Cliquer sur le lien des abonnés
        const followersLink = await page.locator('a[href*="followers"]').first();
        const followersCount = await followersLink.textContent();
        console.log(`Nombre total d'abonnés : ${followersCount}`);
        await followersLink.click();
        await sleep(5000);

        // Extraire les abonnés
        console.log('Extraction des abonnés...');
        const followers = new Set();
        let previousFollowersCount = 0;
        let noNewFollowersCount = 0;

        while (followers.size < 20 && noNewFollowersCount < 3) {
            // Récupérer les noms d'utilisateur
            const usernames = await page.$$eval('a[role="link"]', links => 
                links.map(link => link.textContent)
            );

            // Ajouter les nouveaux noms d'utilisateur
            usernames.forEach(username => {
                if (username && !username.includes('.')) { // Filtrer les faux positifs
                    followers.add(username);
                }
            });

            // Vérifier si de nouveaux abonnés ont été chargés
            if (followers.size === previousFollowersCount) {
                noNewFollowersCount++;
            } else {
                noNewFollowersCount = 0;
            }
            previousFollowersCount = followers.size;

            // Faire défiler la liste
            await page.evaluate(() => {
                document.querySelector('div[role="dialog"]').scrollTop += 1000;
            });
            await sleep(randomDelay());
        }

        // Afficher les résultats
        console.log('\nListe des abonnés extraits :');
        followers.forEach(username => console.log(username));
        console.log(`\nTotal d'abonnés extraits : ${followers.size}`);

    } catch (error) {
        console.error('Une erreur est survenue :', error.message);
    } finally {
        await browser.close();
    }
}

// Lancer l'extraction
extractFollowers(); 