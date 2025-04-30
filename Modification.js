const fs = require('fs');
const path = require('path');

// Le chemin du fichier .env
const envPath = path.join(__dirname, '.env');

// Fonction pour remplacer une valeur spécifique dans la variable CONTENU
function updateEnvVariable(variableName, oldValue, newValue) {
    // Encodage des valeurs pour correspondre à celles du fichier
    const encodedOldValue = encodeURIComponent(oldValue);
    const encodedNewValue = encodeURIComponent(newValue);

    fs.readFile(envPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erreur lors de la lecture du fichier .env', err);
            return;
        }

        const regex = new RegExp(`^${variableName}=(.*)$`, 'm');
        const match = data.match(regex);

        if (match) {
            let variableValue = match[1];

            // Vérifie si l'ancienne valeur est bien présente
            if (!variableValue.includes(encodedOldValue)) {
                console.log(`Valeur "${oldValue}" non trouvée dans ${variableName}`);
                return;
            }

            // Remplace uniquement l'ancienne valeur encodée
            variableValue = variableValue.replace(encodedOldValue, encodedNewValue);
            const nouvelleLigne = `${variableName}=${variableValue}`;
            const updatedData = data.replace(regex, nouvelleLigne);

            fs.writeFile(envPath, updatedData, 'utf8', (err) => {
                if (err) {
                    console.error('Erreur lors de l\'écriture dans le fichier .env', err);
                } else {
                    console.log(`"${oldValue}" remplacé par "${newValue}" dans ${variableName}`);
                }
            });
        } else {
            console.log(`${variableName} n'existe pas dans le fichier .env`);
        }
    });
}

// Exemple : Modifier "message 1" par "bonjour" dans la variable CONTENU
//updateEnvVariable('CONTENU', 'message 6', 'messagenumero 2');
module.exports = {  updateEnvVariable };