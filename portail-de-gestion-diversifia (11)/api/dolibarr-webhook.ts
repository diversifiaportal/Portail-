
import * as admin from 'firebase-admin';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  // Note: On Vercel, this requires GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT env var
  // containing the JSON key.
  admin.initializeApp();
}
const db = admin.firestore();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configuration CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const doliData = req.body;
  
  // Validation basique
  if (!doliData || !doliData.ref) {
    return res.status(400).json({ error: "Payload invalide : ref manquante" });
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
    // On cible le document unique qui contient la liste des commandes (architecture actuelle)
    const docRef = db.collection('diversifia_store').doc('adv_orders');

    await db.runTransaction(async (t) => {
      const doc = await t.get(docRef);
      let currentOrders = [];
      
      if (doc.exists) {
        const data = doc.data();
        currentOrders = data?.payload || [];
      }

      // Vérification des doublons (basée sur la référence contrat)
      const exists = currentOrders.some((o: any) => o.refContrat === newOrder.refContrat);
      if (exists) {
        // Déjà existant
        return;
      }

      // Ajout en tête de liste
      const updatedOrders = [newOrder, ...currentOrders];
      
      t.set(docRef, { 
        payload: updatedOrders, 
        updatedAt: new Date().toISOString() 
      }, { merge: true });
    });

    return res.status(200).json({ success: true, id: newOrder.id, message: "Importé dans ADV" });
  } catch (error: any) {
    console.error("Erreur Webhook Dolibarr:", error);
    return res.status(500).json({ error: error.message });
  }
}
