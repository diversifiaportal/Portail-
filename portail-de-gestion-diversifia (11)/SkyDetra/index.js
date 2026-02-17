
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const mysql = require('mysql2/promise');
const path = require('path');

// Chargement du .env avec vérification du chemin
const envPath = path.join(__dirname, '.env');
require('dotenv').config({ path: envPath });

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

// Diagnostic de démarrage
console.log(`Config DB: Host=${process.env.DB_HOST || 'MANQUANT'}, User=${process.env.DB_USER || 'MANQUANT'}`);

// Initialisation paresseuse du pool (Lazy Loading) pour éviter les crashs au démarrage global
let pool = null;

function getPool() {
  if (!pool) {
    if (!process.env.DB_HOST) {
      throw new Error("Configuration DB manquante (Fichier .env non chargé sur le serveur)");
    }
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT || '3306'),
      waitForConnections: true,
      connectionLimit: 3,
      queueLimit: 0,
      connectTimeout: 20000 // Augmenté pour les connexions distantes
    });
  }
  return pool;
}

/**
 * LOGIQUE DE SYNCHRONISATION ROBUSTE
 */
async function performSync() {
  let connection;
  try {
    const dbPool = getPool();
    connection = await dbPool.getConnection();
    console.log('Connexion MySQL OK.');
    
    // 1. Mapping Utilisateurs
    const userMap = new Map();
    const [allUserRows] = await connection.execute("SELECT rowid, firstname, lastname FROM llxfb_user");
    for (const u of allUserRows) {
      const fullName = `${u.firstname || ''} ${u.lastname || ''}`.trim();
      userMap.set(u.rowid, fullName || "Vendeur Inconnu");
    }

    // 2. Commandes Brouillons
    const [orderRows] = await connection.execute("SELECT rowid, ref, date_creation, fk_user_author, fk_soc FROM llxfb_commande WHERE fk_statut = 0");
    if (!orderRows || orderRows.length === 0) {
      console.log('Fin : Aucune nouvelle commande brouillon.');
      return { success: true, count: 0 };
    }

    const orderMap = new Map();
    for (const order of orderRows) orderMap.set(order.rowid, { ...order, date: new Date(order.date_creation) });

    const orderIds = Array.from(orderMap.keys());
    const socIds = [...new Set(Array.from(orderMap.values()).map(o => o.fk_soc))].filter(Boolean);

    // 3. Sociétés
    let socMap = new Map();
    if (socIds.length > 0) {
      const [socRows] = await connection.query("SELECT rowid, nom, phone, town FROM llxfb_societe WHERE rowid IN (?)", [socIds]);
      socMap = new Map(socRows.map(s => [s.rowid, s]));
    }

    // 4. Détails et Offres
    const [lineRows] = await connection.query("SELECT rowid, fk_commande FROM llxfb_commandedet WHERE fk_commande IN (?)", [orderIds]);
    const lineMap = new Map();
    lineRows.forEach(l => lineMap.set(l.fk_commande, l.rowid));
    const lineIds = [...new Set(Array.from(lineMap.values()))].filter(Boolean);

    let lineExtraMap = new Map();
    if (lineIds.length > 0) {
      const [leRows] = await connection.query("SELECT fk_object, vad_vel FROM llxfb_commandedet_extrafields WHERE fk_object IN (?)", [lineIds]);
      lineExtraMap = new Map(leRows.map(le => [le.fk_object, le.vad_vel]));
    }

    const [oeRows] = await connection.query("SELECT fk_object, val_cont FROM llxfb_commande_extrafields WHERE fk_object IN (?)", [orderIds]);
    const orderExtraMap = new Map(oeRows.map(oe => [oe.fk_object, oe.val_cont]));

    const offreMap = {
      1: "BUSINESS BOX FIXE 249 AE", 2: "TDLTE", 3: "FIBRE 20M ESE", 4: "FIBRE 50M ESE", 5: "FIBRE 100M ESE", 6: "FIBRE 200M ESE",
      7: "FF Orange Pro 6H+6Go ST", 8: "Forfait Orange Pro 15H+15Go ST", 10: "Forfait illimité national + ST", 11: "FF illimité pro national ST",
      12: "FF illimité Pro Silver ST", 31: "FF illimité Pro Premium ST", 13: "FF illimité Pro Gold ST", 32: "Forfait Pro Connect 15 ST",
      33: "FORFAIT PRO CONNECT 30 ST", 34: "Forfait Pro CONNECT 70Go ST", 35: "Forfait Pro Connect 40 ST", 14: "Wifi Pro Pack Connect",
      15: "Wifi Pro Connect +", 16: "Smart-fax limité 29dh", 17: "BUSINESS BOX 4G 249", 18: "BUSINESS BOX 4G + 349", 23: "SIM Only BBOX FIXE 249",
      24: "SIM ONLY – BUSINESS BOX 4G+", 25: "SIM ONLY – BUSINESS BOX 4G Premium", 26: "Pack Forfait Orange Pro 6H", 27: "Pack Forfait Pro Connect 15",
      28: "BUSINESS BOX FIXE+ 349 AE", 29: "SIM Only BBOX FIXE+ 349", 30: "ADSL", 19: "BUSINESS BOX FIXE 249 SE", 20: "FF Orange Pro 25H+25Go ST",
      21: "Smart-fax limité 99dh", 40: "Partage FIBRE 20M ESE", 41: "Partage FIBRE 50M ESE", 42: "Partage FIBRE 100M ESE", 43: "Partage FIBRE 200M ESE",
      60: "Forfait Orange Pro 40H ST", 61: "Forfait Orange Pro 50H ST", 62: "Forfait Pro CONNECT 100Go ST", 63: "Internet Mobile Pro 35 Go",
      64: "Internet Mobile Pro 80 Go", 65: "Internet Mobile Pro 100 Go", 66: "Internet Mobile Pro 150 Go", 50: "BUSINESS BOX 5G"
    };

    const docRef = db.collection('diversifia_store').doc('adv_orders');
    let importedCount = 0;

    // CORRECTIF SYNC: Fonction de nettoyage pour normaliser les références
    // Supprime les espaces avant/après et les espaces multiples
    const cleanRef = (r) => (r || '').trim().replace(/\s+/g, ' ');

    await db.runTransaction(async (t) => {
      const docSnap = await t.get(docRef);
      let currentOrders = docSnap.exists ? (docSnap.data().payload || []) : [];
      
      // CORRECTIF: Normaliser TOUTES les refs existantes (refContrat + doliRef)
      // pour éviter que des espaces invisibles causent un re-import
      const existingRefs = new Set();
      currentOrders.forEach(o => {
        if (o.refContrat) existingRefs.add(cleanRef(o.refContrat));
        if (o.doliRef) existingRefs.add(cleanRef(o.doliRef));
      });
      const newOrdersToAdd = [];
      const nowISO = new Date().toISOString().slice(0, 16);

      for (const order of orderMap.values()) {
        const client = socMap.get(order.fk_soc);
        const finalRef = cleanRef(orderExtraMap.get(order.rowid) || order.ref || '');
        const doliRef = cleanRef(order.ref || '');
        
        // CORRECTIF: Vérifier aussi bien refContrat que doliRef (ref Dolibarr)
        if (!finalRef || !client || existingRefs.has(finalRef) || existingRefs.has(doliRef)) continue;

        const lineId = lineMap.get(order.rowid);
        const offreCode = lineExtraMap.get(lineId);

        newOrdersToAdd.push({
          id: `DOLI-${order.rowid}`,
          refContrat: finalRef,
          doliRef: doliRef,
          dateDepot: order.date.toISOString().slice(0, 16),
          dateSaisi: nowISO,
          dateTraitement: nowISO,
          commercial: cleanRef(userMap.get(order.fk_user_author) || "Dolibarr Sync"),
          raisonSociale: cleanRef((client.nom || "Client Inconnu").toUpperCase()),
          telephone: (client.phone || "").replace(/\s/g, ''),
          offre: offreMap[offreCode] || "À qualifier",
          ville: cleanRef(client.town || ""),
          validation: 'EN ATTENTE', etape: 'ÉTUDE', statutSi: 'En Etudes',
          isConfirmed: false, linkCrm: `Dolibarr ID: ${order.rowid}`,
          isManuallyCreated: false
        });
        existingRefs.add(finalRef);
        existingRefs.add(doliRef);
      }

      if (newOrdersToAdd.length > 0) {
        importedCount = newOrdersToAdd.length;
        // Limiter le payload
        const totalPayload = [...newOrdersToAdd, ...currentOrders].slice(0, 2000);
        t.set(docRef, { payload: totalPayload, updatedAt: new Date().toISOString() }, { merge: true });
      }
    });

    return { success: true, count: importedCount };
  } catch (err) {
    console.error("ERREUR CRITIQUE SYNC:", err);
    throw err;
  } finally {
    if (connection) connection.release();
  }
}

/**
 * TRIGGERS
 */
exports.appendDraftOrders = functions.pubsub.schedule('every 15 minutes').onRun(async (context) => {
  console.log('Sync Automatique en cours...');
  try { await performSync(); } catch (e) { console.error('Echec sync planifiée:', e.message); }
});

exports.manualSyncDraftOrders = functions.https.onRequest(async (req, res) => {
  // CORS Headers explicites
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const result = await performSync();
    res.status(200).json({ status: "success", count: result.count });
  } catch (e) {
    console.error("Erreur HTTP Sync:", e);
    // On renvoie TOUJOURS du JSON, même en cas d'erreur 500, pour éviter le "Unexpected token <"
    res.status(500).json({ 
      status: "error", 
      message: e.message || "Erreur serveur interne lors de la synchronisation",
      details: "Vérifiez les logs Firebase Cloud Functions."
    });
  }
});
