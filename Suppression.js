const fs = require('fs');
const path = require('path');

function supprContenu(messageSuppr) {
    const envPath = path.resolve(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf-8');
    const regex = /^CONTENU=(.*)$/m;
    const match = envContent.match(regex);

    if (match) {
        const encodedMessage = encodeURIComponent(messageSuppr);
        let messages = match[1]
            .split(',')
            .map(m => m.trim())
            .filter(m => m.length > 0);

        if (!messages.includes(encodedMessage)) {
            console.log(`❌ Message "${messageSuppr}" non trouvé.`);
            return;
        }

        messages = messages.filter(m => m !== encodedMessage);
        const nouvelleLigne = `CONTENU=${messages.join(',')}`;
        envContent = envContent.replace(regex, nouvelleLigne);
        fs.writeFileSync(envPath, envContent, 'utf-8');
        console.log(`✔️ Message "${messageSuppr}" supprimé avec succès.`);
    } else {
        console.error("⚠️ La variable CONTENU n'existe pas dans le fichier .env.");
    }
}
//supprContenu('message 5')

module.exports = {  supprContenu };