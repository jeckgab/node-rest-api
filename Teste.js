const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const mysql = require('mysql')
require('dotenv').config();



const db = mysql.createPool({
  host: 'sql10.freesqldatabase.com',
  user: 'sql10776144',
  password: 'RWlwbx7NWy',
  database: 'sql10776144',
  port: 3306,
})
app.use(cors())  
app.use(express.json())
 
app.use(bodyParser.urlencoded({extended:true}))


const contenu = process.env.CONTENU.split(','); 
function just(followersList) {
  const listFollowerMessage = [];
  const nb = followersList.length;

  for (let index = 0; index < nb; index++) {
    const y = index % contenu.length; 
    const decodedMessage = decodeURIComponent(contenu[y]);
    listFollowerMessage.push({
      flw: followersList[index],
      mes: `bonjour ${followersList[index]} ${decodedMessage}`
    });
  }

  return listFollowerMessage; 
}

const sql =" SELECT IdCompte FROM `compte` ORDER BY `compte`.`IdCompte` ASC;"

async function getCompte() {
  return new Promise((resolve, reject) => {
      db.query(sql, (err, result) => {
          if (err) {
              reject("Erreur lors de l'exécution de la requête SQL.");
          } else {
              resolve(result); 
          }  
      });
  });
}  

  // Récupérer le nombre de followers déjà attribués à chaque compte
  async function getNbFollowerIdEnvoyer(IdCompte) {
    return new Promise((resolve, reject) => {
        db.query('SELECT COUNT(*) AS total FROM envoyer WHERE IdCompte=?;', [IdCompte], (err, result) => {
            if (err) {
                reject("Erreur lors de l'exécution de la requête SQL.");
            } else {
                resolve(result); 
            }
        });
    });
  }


    async function getIdNewFollower() {
      return new Promise((resolve, reject) => {
          db.query('SELECT MAX(IdFollowers) AS max FROM followers;', (err, result) => {
              if (err) {
                  reject("Erreur lors de l'exécution de la requête SQL.");
              } else {
                  resolve(result); 
              }
          });
      });
    }


async function insertSession(Statue) {
  const sql="INSERT INTO `session` (`IdSession`, `DateLancement`, `StatuSession`, `DateCloture`) VALUES (NULL, '2025-04-09', ?, '2025-04-01');"
 
      return new Promise((resolve, reject) => {
        db.query(sql,[Statue ],(err,result)=>{              if (err) {
          console.error('Erreur lors de l\'insertion de l\'abonné :', err.message);
          reject(err);
      } else {
          
          resolve();
      }} )
      });
    }

async function insertPage(LienPage ,Nombre) {
      const sql="INSERT INTO `page` (`IdPage`, `NomPage`, `DateEnregistrement`, `LienPage`, `IdSession`) SELECT NULL,'Nompage','2025-04-09',?, MAX(IdSession) FROM `session` WHERE 1;"
     
          return new Promise((resolve, reject) => {
            db.query(sql,[LienPage,Nombre ],(err,result)=>{              if (err) {
              console.error('Erreur lors de l\'insertion de l\'abonné :', err.message);
              reject(err);
          } else {
              console.log('Session ajouté:', LienPage);
              resolve();
          }} )
          });
        }
      
  
async function insertFollower(IdFollowers ,followerName) { 
  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO `followers` (`IdFollowers`, `NomFollowers`, `DateEnregistrementFollowers`, `StatutsCompteFollowers`) VALUES (?, ?, '2025-04-01', 'actif');",
      [IdFollowers ,followerName],
      (err, results) => {
          if (err) {
              console.error('Erreur lors de l\'insertion de l\'abonné :', err.message);
              reject(err);
          } else {
              console.log('Abonné ajouté:', followerName);
              resolve();
          }
      }
    );
  });
}

async function insertAvoir() {
  const sql="INSERT INTO `avoir` (`IdFollowers`, `IdPage`) SELECT MAX(IdFollowers),MAX(IdPage) FROM `followers`,page WHERE 1;"
 
      return new Promise((resolve, reject) => {
        db.query(sql,(err,result)=>{              if (err) {
          console.error('Erreur lors de l\'insertion de l\'abonné :', err.message);
          reject(err);
      } else {
          console.log('Session ajouté:');
          resolve();
      }} )
      });
    }
  
async function insertMessage(idmessage, Message) {
  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO `message` (`IdMessage`, `ContenueMessage`, `DateCreation`) VALUES (?, ?, '2025-04-01');",
      [idmessage, Message],
      (err, results) => {
          if (err) {
              console.error('Erreur lors de l\'insertion du message :', err.message);
              reject(err);
          } else {
              console.log('Contenu du message', Message);
              resolve();
          }
      }
    );
  });
}

async function insertEnvoi(idmessage, IdFollowers ,IdCompte) {
  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO `envoyer` (`IdMessage`, `IdFollowers`, `IdCompte`, `statutEnvoi`) VALUES (?, ?, ?, 'en attente');",
      [idmessage, IdFollowers ,IdCompte],
      (err, results) => {
          if (err) {
              console.error('Erreur lors de l\'insertion dans envoyer :', err.message);
              reject(err);
          } else {
              console.log('Enregistrement terminé pour', idmessage);
              resolve();
          }
      }
    );
  });
}


 async function Enregistrement  (type,liste,LienPage){
  const list=just(liste)
  const followersList = list.map(row => row.flw)
  const MessageList = list.map(row => row.mes)
  const totalFollowersToInsert = followersList.length;
  await insertSession(type);
  await insertPage(LienPage,10);
  const comptes = await getCompte();
  const compteIds = comptes.map(row => row.IdCompte);

  // Récupérer le nombre de followers déjà attribués à chaque compte
  const compteFollowerCount = [];
  for (let i = 0; i < compteIds.length; i++) {
    const rows = await getNbFollowerIdEnvoyer(compteIds[i]);
    compteFollowerCount.push({
      IdCompte: compteIds[i],
      count: rows[0].total
    });
  }
  console.log( compteFollowerCount);
 
  // Calculer le dernier follower_id existant 
  const lastFollowerRow = await getIdNewFollower();
  let lastFollowerId = lastFollowerRow[0].max || 0;

  let iterations = totalFollowersToInsert;
  let rotationDone = false; 

  while (iterations > 0) {

    let compteIndex = compteFollowerCount
      .filter(c => c.count < 10) 
      .sort((a, b) => a.count - b.count)[0]; 

    if (!compteIndex) {
      
      if (!rotationDone) {
        console.log("Tous les comptes ont atteint 10 followers. Réinitialisation.");
        compteFollowerCount.forEach(c => c.count = 0); 
        rotationDone = true; 
      }
      compteIndex = compteFollowerCount[0]; 
    }


    lastFollowerId++;
    const followerName = followersList[iterations - 1];
    const textMessage= MessageList[iterations - 1];
    
    await insertFollower(lastFollowerId, followerName);
    await insertAvoir();
    
    await insertMessage(lastFollowerId, textMessage);


    const compteId = compteIndex.IdCompte;
    console.log(`Follower ${lastFollowerId} assigné au compte ${compteId}`);

  
    await insertEnvoi(lastFollowerId, lastFollowerId, compteId);

  
    const updatedIndex = compteFollowerCount.findIndex(c => c.IdCompte === compteId);
    compteFollowerCount[updatedIndex].count++;
    console.log("Compte actualisé avec : ", compteFollowerCount);

    iterations--;
  }

  console.log("✅ Insertion terminée !");
};


module.exports = { Enregistrement };