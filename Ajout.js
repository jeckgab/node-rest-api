
const fs = require('fs');
const path = require('path');

function ajoutContenu(message) {
    const envPath = path.resolve(__dirname, '.env');

    if (!fs.existsSync(envPath)) {
        console.error("Fichier .env introuvable");
        return;
    }

    let envContent = fs.readFileSync(envPath, 'utf-8');
    const regex = /^CONTENU=(.*)$/m;
    const match = envContent.match(regex);

    const encodedMessage = encodeURIComponent(message); // <-- ici
    if (match) {
        const messages = match[1]
            .split(',')
            .map(m => m.trim())
            .filter(m => m.length > 0);

        if (!messages.includes(encodedMessage)) {
            messages.push(encodedMessage);
            const nouvelleLigne = `CONTENU=${messages.join(',')}`;
            envContent = envContent.replace(regex, nouvelleLigne);
            fs.writeFileSync(envPath, envContent, 'utf-8');
            console.log('Message ajouté.');
        } else {
            console.log('Le message existe déjà.');
        }
    } else {
        fs.appendFileSync(envPath, `\nCONTENU=${encodedMessage}`, 'utf-8');
        console.log('CONTENU créé avec le message.');
    }
}

//ajoutContenu('message 6')

module.exports = {  ajoutContenu };