const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
admin.firestore().settings({ ignoreUndefinedProperties: true });

exports.dolibarrWebhook = functions.https.onRequest(async (req, res) => {
  // Configuration CORS
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.status(200).send();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const doliData = req.body;
  
  // Validation basique
  if (!doliData || !doliData.ref) {
    return res.status(400).send("Payload invalide : ref manquante");
  }

  // Date actuelle format ISO court
  const now = new Date().toISOString().slice(0, 16);

  // Mapping des données Dolibarr vers le format ADVOrder
  const newOrder = {
    id: `DOLI-${doliData.ref}`,
    refContrat: doliData.ref,
    dateDepot: now,
    dateSaisi: now,
    dateTraitement: now,
    commercial: "Dolibarr Import", // Vous pouvez mapper doliData.user_author_id ici si besoin
    raisonSociale: doliData.soc_name || "Client Inconnu",
    telephone: doliData.soc_phone || "",
    ville: doliData.soc_town || "",
    offre: "À qualifier",
    validation: "EN ATTENTE",
    etape: "ÉTUDE",
    statutSi: "En Etudes",
    isConfirmed: true, // On suppose que si c'est validé dans Dolibarr, c'est confirmé
    linkCrm: `Dolibarr Ref: ${doliData.ref}`,
    nFixe: "",
    nSerie: ""
  };

  try {
    const db = admin.firestore();
    // On cible le document unique qui contient la liste des commandes (architecture actuelle)
    const docRef = db.collection('diversifia_store').doc('adv_orders');

    await db.runTransaction(async (t) => {
      const doc = await t.get(docRef);
      let currentOrders = [];
      
      if (doc.exists) {
        const data = doc.data();
        currentOrders = data.payload || [];
      }

      // Vérification des doublons (basée sur la référence contrat)
      const exists = currentOrders.some(o => o.refContrat === newOrder.refContrat);
      if (exists) {
        console.log(`Commande ${newOrder.refContrat} déjà existante. Ignorée.`);
        return;
      }

      // Ajout en tête de liste
      const updatedOrders = [newOrder, ...currentOrders];
      
      t.set(docRef, { 
        payload: updatedOrders, 
        updatedAt: new Date().toISOString() 
      }, { merge: true });
    });

    res.status(200).json({ success: true, id: newOrder.id, message: "Importé dans ADV" });
  } catch (error) {
    console.error("Erreur Webhook Dolibarr:", error);
    res.status(500).send(error.message);
  }
});