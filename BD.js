const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const mysql = require('mysql')
const { sleep} = require('./utils');
const {startSession} =require('./Session');
const { startSessionMessage } = require('./SessionMessage')
const { Enregistrement } = require('./Teste')
const { ajoutContenu } = require('./Ajout')
const { chargementContenu } = require('./ChargementListContenu')
const { supprContenu } = require('./Suppression')
const { updateEnvVariable } = require('./Modification')


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

app.get('/api/comptes',(req,res)=>{
    const sql="SELECT * FROM `compte`"
    db.query(sql,(err,result)=>{res.send(result)} )
})

app.get('/api/Nombrecomptes',(req,res)=>{
    const sql="SELECT COUNT(*) as nb FROM `compte`"
    db.query(sql,(err,result)=>{res.send(result)} )
})

app.post('/api/insertCompte',(req,res)=>{
    const nom = req.body.nom
    const Mdp = req.body.Mdp  
    const sql="INSERT INTO `compte` (`IdCompte`, `UserName`, `MotsDePasse`) VALUES (NULL, ?, ?);"
    db.query(sql,[nom,Mdp ],(err,result)=>{} ) 
})

app.get('/api/Contenu',(req,res)=>{
    const contenu = chargementContenu();
    res.send(contenu)

})


app.post('/api/insertSession',(req,res)=>{
    const LienPage = req.body.LienPage
    const Nombre = req.body.Nombre  
    const sql="INSERT INTO `session` (`IdSession`, `DateLancement`, `StatuSession`, `DateCloture`) VALUES (NULL, '2025-04-09', 'LKL.ML', '2025-04-01');"
    db.query(sql,[LienPage,Nombre ],(err,result)=>{} ) 
})


/*INSERTION PAGE*/

app.post('/api/insertPage',(req,res)=>{
    const LienPage = req.body.LienPage
    const Nombre = req.body.Nombre  
    const sql="INSERT INTO `page` (`IdPage`, `NomPage`, `DateEnregistrement`, `LienPage`, `IdSession`) SELECT NULL,'Nompage','2025-04-09',?, MAX(IdSession) FROM `session` WHERE 1;"
    db.query(sql,[LienPage,Nombre ],(err,result)=>{} ) 
})


async function afficherCompte(comptes,url) {
    for (let i = 0; i < comptes.length; i++) {
        try {
            await sleep(2000, 4000);
            console.log(comptes[i].UserName);
            const followers = await startSession(comptes[i].UserName, comptes[i].MotsDePasse,url);
            Enregistrement  ("extraction",followers,url);
            await sleep(8000, 10000);
        } catch (error) {
            console.log(error);
        }
    }
}
async function ExecutionSession(url){
    const sql="SELECT * FROM `compte` WHERE IdCompte=4;"
    db.query(sql,(err,result)=>{
        if(err){
            console.log("erreur")
        }
        console.log("misy valeur")
        console.log(result.length)
        afficherCompte(result,url)
      
    } )
}

async function getFollowers(IdCompte,IdPage) {
    return new Promise((resolve, reject) => {
        db.query("SELECT followers.NomFollowers,message.ContenueMessage FROM `followers`,`message`,`envoyer`,`avoir`,`page` WHERE message.IdMessage = followers.IdFollowers AND message.IdMessage=envoyer.IdMessage AND followers.IdFollowers=envoyer.IdFollowers AND page.IdPage=avoir.IdPage AND followers.IdFollowers=avoir.IdFollowers AND envoyer.IdCompte=? AND page.IdPage=?;",[IdCompte,IdPage],(err, result) => {
            if (err) {
                reject("Erreur lors de l'exécution de la requête SQL.");
            } else {
                resolve(result);  
            }
        });
    });
}
async function envoi(comptes,IdPage) {    
    for (let i = 0; i < comptes.length; i++) {
        try {
            const result = await getFollowers(comptes[i].IdCompte,IdPage);
            const followersList = result.map(row => row.NomFollowers);
            const ContenueMessageList = result.map(row => row.ContenueMessage);
            await sleep(2000, 4000);
            console.log(comptes[i].UserName);
            console.log(result.NomFollowers)
            const followers = await startSessionMessage(comptes[i].UserName, comptes[i].MotsDePasse,followersList,ContenueMessageList);
            await sleep(8000, 10000);
        } catch (error) {
            console.log(error);
        }
    }
}
async function ExecutionEvoi(IdPage){
    const sql="SELECT DISTINCT compte.* FROM `followers`,`message`,`envoyer`,`avoir`,`page`,`compte` WHERE message.IdMessage = followers.IdFollowers AND message.IdMessage=envoyer.IdMessage AND followers.IdFollowers=envoyer.IdFollowers AND page.IdPage=avoir.IdPage AND followers.IdFollowers=avoir.IdFollowers AND compte.IdCompte = envoyer.IdCompte AND page.IdPage=?;"
    db.query(sql,IdPage,(err,result)=>{
        if(err){
            console.log("erreur")
        }
        envoi(result,IdPage)
      
    } )
}
 

app.post('/api/executerSession',async (req,res)=>{
    try {
        const { LienPage } = req.body;
        const result = await ExecutionSession(LienPage);
        res.json({message: result});
    } catch (error) {
        
    }
})
app.post('/api/Supression',async (req,res)=>{
    try {
        const { contenu } = req.body;
        supprContenu(contenu);
    } catch (error) {
        
    }
})
app.post('/api/update',async (req,res)=>{
    try {
        const { contenu } = req.body;
        const { NouveauContenu } = req.body;
        updateEnvVariable('CONTENU',contenu,NouveauContenu)
    } catch (error) {
        
    }
})

app.post('/api/CreationContenu',async (req,res)=>{
    try {
        const { contenu } = req.body;
        const result = ajoutContenu(contenu);
        res.json({message: result});
    } catch (error) {
        
    }
})

app.post('/api/Envoie',async (req,res)=>{
    try {
        const { IdPage } = req.body;
        const result = await ExecutionEvoi(IdPage);
        res.json({message: result});
    } catch (error) {
        
    }
})



app.get('/api/Message/:IdPage',(req,res)=>{
    const sql="SELECT * FROM `followers`,`message`,`envoyer`,`avoir`,`page` WHERE message.IdMessage = followers.IdFollowers AND message.IdMessage=envoyer.IdMessage AND followers.IdFollowers=envoyer.IdFollowers AND page.IdPage=avoir.IdPage AND followers.IdFollowers=avoir.IdFollowers AND page.IdPage=?;"
    const IdPage  = req.params.IdPage;
    db.query(sql,IdPage,(err,result)=>{res.send(result)} )
})
app.get('/api/Page',(req,res)=>{
    const sql="SELECT DISTINCT page.IdPage,page.NomPage FROM `followers`,`message`,`envoyer`,`avoir`,`page` WHERE message.IdMessage = followers.IdFollowers AND message.IdMessage=envoyer.IdMessage AND followers.IdFollowers=envoyer.IdFollowers AND page.IdPage=avoir.IdPage AND followers.IdFollowers=avoir.IdFollowers;"
    db.query(sql,(err,result)=>{res.send(result)} )

})




app.get('/api/NombreFollowers',(req,res)=>{
    const sql="SELECT COUNT(*) as nb FROM `followers`"
    db.query(sql,(err,result)=>{res.send(result)} )
})

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Serveur lancé sur le port ${port}`);
})

module.exports = db;