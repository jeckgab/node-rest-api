
const fs = require('fs');
const path = require('path');


// Fonction qui lit et retourne CONTENU depuis .env
// Fonction qui lit et retourne CONTENU depuis .env (avec décodage)
function chargementContenu() {
     try {
       const envPath = path.resolve(__dirname, '.env');
       const envContent = fs.readFileSync(envPath, 'utf-8');
       const regex = /^CONTENU\s*=\s*(.*)$/m;
       const match = envContent.match(regex);
   
       if (match) {
         const contenuList = match[1]
           .split(',')
           .map(m => decodeURIComponent(m.trim())) // Décodage ici
           .filter(m => m.length > 0); // Optionnel : pour filtrer les vides
   
         return contenuList;
       }
     } catch (error) {
       console.error('Erreur lors du chargement de .env :', error.message);
     }
   
     return []; // En cas d'erreur ou de contenu manquant
   }

// Observer le fichier pour déboguer (optionnel)
const envPath = path.resolve(__dirname, '.env');




module.exports = {  chargementContenu };